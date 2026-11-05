const { query } = require('../config/db');

class LeaderboardController {
  /**
   * Get dynamic leaderboard ranked by total score
   * Real SQL Query - NOT hardcoded!
   */
  async getTopScorers(req, res) {
    try {
      const sql = `
        SELECT 
          u.id, 
          u.username, 
          u.avatar, 
          s.total_score, 
          s.games_played, 
          s.high_score,
          s.highest_streak,
          CASE 
            WHEN s.games_played > 0 THEN ROUND((s.correct_answers / s.games_played) * 100)
            ELSE 0 
          END AS win_rate
        FROM users u
        INNER JOIN user_stats s ON u.id = s.user_id
        ORDER BY s.total_score DESC, s.high_score DESC
        LIMIT 50
      `;

      const [rows] = await query(sql);

      // Add rank indices
      const rankedData = (rows || []).map((row, index) => ({
        rank: index + 1,
        ...row
      }));

      return res.json({
        success: true,
        count: rankedData.length,
        leaderboard: rankedData
      });
    } catch (err) {
      console.error('[Leaderboard Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard.' });
    }
  }

  /**
   * Get dynamic leaderboard ranked by accuracy (Win Rate %)
   */
  async getTopAccuracy(req, res) {
    try {
      const sql = `
        SELECT 
          u.id, 
          u.username, 
          u.avatar, 
          s.total_score, 
          s.games_played, 
          s.correct_answers,
          s.high_score,
          CASE 
            WHEN s.games_played > 0 THEN ROUND((s.correct_answers / s.games_played) * 100)
            ELSE 0 
          END AS win_rate
        FROM users u
        INNER JOIN user_stats s ON u.id = s.user_id
        WHERE s.games_played >= 1
        ORDER BY win_rate DESC, s.total_score DESC
        LIMIT 50
      `;

      const [rows] = await query(sql);

      const rankedData = (rows || []).map((row, index) => ({
        rank: index + 1,
        ...row
      }));

      return res.json({
        success: true,
        count: rankedData.length,
        leaderboard: rankedData
      });
    } catch (err) {
      console.error('[Accuracy Leaderboard Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch accuracy leaderboard.' });
    }
  }
}

module.exports = new LeaderboardController();
