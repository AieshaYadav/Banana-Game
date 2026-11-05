const crypto = require('crypto');
const { query } = require('../config/db');
const bananaService = require('../services/bananaService');
const hintService = require('../services/hintService');

class GameController {
  /**
   * Start a new game round:
   * 1. Fetches puzzle from external Banana API (Interoperability Theme).
   * 2. Securely stores solution on server (Prevent Data Leaks / Anti-Cheat requirement).
   * 3. Sends client only roundId, question image, timeLimit, and hint structure.
   */
  async startRound(req, res) {
    try {
      const userId = req.user.id;

      // Interoperate with Marc Conrad Banana API
      const puzzle = await bananaService.fetchNewPuzzle();

      // Generate unique secure round identifier
      const roundId = crypto.randomUUID();

      // Store in database
      await query(
        'INSERT INTO game_rounds (id, user_id, question_url, solution, hint_level, points_potential, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [roundId, userId, puzzle.question, puzzle.solution, 0, 100, 'active']
      );

      // Return ONLY sanitized payload to client (No solution leaked!)
      return res.status(200).json({
        success: true,
        roundId,
        questionUrl: puzzle.question,
        timeLimit: 30, // 30 seconds timer
        hintLevel: 0,
        pointsPotential: 100
      });
    } catch (err) {
      console.error('[Start Round Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Could not generate game round. Please try again.'
      });
    }
  }

  /**
   * Request a 3-step progressive hint:
   * Level 1: Parity & Range (e.g. Even/Odd, High/Low) - Penalty: -15 pts
   * Level 2: Candidate Elimination (Filters to 3 choices) - Penalty: -25 pts
   * Level 3: Tight Boundary Clue - Penalty: -35 pts
   */
  async requestHint(req, res) {
    try {
      const { roundId } = req.body;
      const userId = req.user.id;

      if (!roundId) {
        return res.status(400).json({ success: false, message: 'roundId is required.' });
      }

      // Find round
      const [rounds] = await query(
        'SELECT * FROM game_rounds WHERE id = ? AND user_id = ? AND status = ?',
        [roundId, userId, 'active']
      );

      if (!rounds || rounds.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Active round not found or has already expired.'
        });
      }

      const currentRound = rounds[0];
      const nextLevel = currentRound.hint_level + 1;

      if (nextLevel > 3) {
        return res.status(400).json({
          success: false,
          message: 'All 3 available hints have already been unlocked for this round!'
        });
      }

      // Generate progressive hint
      const hintData = hintService.generateHint(currentRound.solution, nextLevel);

      // Deduct potential points
      const updatedPotential = Math.max(10, currentRound.points_potential - hintData.cost);

      // Persist hint progression
      await query(
        'UPDATE game_rounds SET hint_level = ?, points_potential = ? WHERE id = ?',
        [nextLevel, updatedPotential, roundId]
      );

      return res.json({
        success: true,
        hint: hintData,
        currentHintLevel: nextLevel,
        remainingPotential: updatedPotential
      });
    } catch (err) {
      console.error('[Hint Request Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to process hint request.' });
    }
  }

  /**
   * Submit answer for verification:
   * - Evaluates answer server-side against hidden solution.
   * - Computes dynamic points, time bonus, hint penalty, and streak multiplier.
   * - Updates MySQL user_stats and match_history.
   */
  async submitAnswer(req, res) {
    try {
      const { roundId, answer, timeRemaining = 0 } = req.body;
      const userId = req.user.id;

      if (roundId === undefined || answer === undefined) {
        return res.status(400).json({
          success: false,
          message: 'roundId and answer are required.'
        });
      }

      const numericAnswer = parseInt(answer, 10);
      if (isNaN(numericAnswer) || numericAnswer < 0 || numericAnswer > 9) {
        return res.status(400).json({
          success: false,
          message: 'Answer must be a single digit between 0 and 9.'
        });
      }

      // Retrieve round from DB
      const [rounds] = await query(
        'SELECT * FROM game_rounds WHERE id = ? AND user_id = ? AND status = ?',
        [roundId, userId, 'active']
      );

      if (!rounds || rounds.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Round already resolved or expired.'
        });
      }

      const round = rounds[0];
      const isCorrect = numericAnswer === round.solution;

      // Fetch user stats for streak calculations
      const [statRows] = await query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
      const currentStats = statRows[0] || { current_streak: 0, highest_streak: 0, high_score: 0 };

      let pointsAwarded = 0;
      let scoreDetails = null;
      let newStreak = 0;

      if (isCorrect) {
        newStreak = currentStats.current_streak + 1;
        const scoreCalc = hintService.calculateRoundScore(
          100,
          round.hint_level,
          timeRemaining,
          newStreak
        );
        pointsAwarded = scoreCalc.pointsAwarded;
        scoreDetails = scoreCalc.breakdown;

        // Mark round solved
        await query(
          'UPDATE game_rounds SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['solved', roundId]
        );
      } else {
        newStreak = 0; // Reset streak on mistake!
        pointsAwarded = 0;

        // Mark round failed
        await query(
          'UPDATE game_rounds SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['failed', roundId]
        );
      }

      const highestStreak = Math.max(currentStats.highest_streak, newStreak);
      const newHighScore = Math.max(currentStats.high_score, pointsAwarded);

      // Update user_stats in MySQL
      await query(
        `UPDATE user_stats SET 
          total_score = total_score + ?,
          games_played = games_played + 1,
          correct_answers = correct_answers + ?,
          wrong_answers = wrong_answers + ?,
          high_score = ?,
          current_streak = ?,
          highest_streak = ?,
          hints_used_count = hints_used_count + ?,
          last_played_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          pointsAwarded,
          isCorrect ? 1 : 0,
          isCorrect ? 0 : 1,
          newHighScore,
          newStreak,
          highestStreak,
          round.hint_level,
          userId
        ]
      );

      // Record in match_history
      const timeTaken = Math.max(1, 30 - Math.floor(timeRemaining));
      await query(
        `INSERT INTO match_history (user_id, round_id, user_answer, correct_solution, is_correct, points_awarded, hints_used, time_taken_seconds)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          roundId,
          numericAnswer,
          round.solution,
          isCorrect ? 1 : 0,
          pointsAwarded,
          round.hint_level,
          timeTaken
        ]
      );

      return res.json({
        success: true,
        isCorrect,
        correctSolution: round.solution,
        pointsAwarded,
        breakdown: scoreDetails,
        currentStreak: newStreak,
        message: isCorrect
          ? `Spot on! +${pointsAwarded} points awarded.`
          : `Mistake! The correct solution was ${round.solution}. Shake it off and keep going!`
      });
    } catch (err) {
      console.error('[Submit Answer Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to verify answer.' });
    }
  }
}

module.exports = new GameController();
