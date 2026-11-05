const { query } = require('../config/db');

class ProfileController {
  /**
   * Get complete profile details and match history for the logged-in user
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      // 1. User base info
      const [userRows] = await query(
        'SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (!userRows || userRows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const user = userRows[0];

      // 2. Comprehensive stats
      const [statsRows] = await query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
      const stats = statsRows && statsRows.length > 0 ? statsRows[0] : {
        total_score: 0,
        games_played: 0,
        correct_answers: 0,
        wrong_answers: 0,
        high_score: 0,
        current_streak: 0,
        highest_streak: 0,
        hints_used_count: 0,
        last_played_at: null
      };

      const winRate = stats.games_played > 0
        ? Math.round((stats.correct_answers / stats.games_played) * 100)
        : 0;

      // 3. Recent 10 matches
      const [historyRows] = await query(
        `SELECT id, round_id, user_answer, correct_solution, is_correct, points_awarded, hints_used, time_taken_seconds, played_at
         FROM match_history 
         WHERE user_id = ?
         ORDER BY played_at DESC
         LIMIT 10`,
        [userId]
      );

      return res.json({
        success: true,
        profile: {
          ...user,
          stats: {
            ...stats,
            win_rate: winRate
          },
          recentMatches: historyRows || []
        }
      });
    } catch (err) {
      console.error('[Profile Controller Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  }

  /**
   * Update avatar
   */
  async updateAvatar(req, res) {
    try {
      const { avatar } = req.body;
      const userId = req.user.id;

      if (!avatar) {
        return res.status(400).json({ success: false, message: 'Avatar symbol is required.' });
      }

      await query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId]);

      return res.json({
        success: true,
        message: 'Avatar updated successfully!',
        avatar
      });
    } catch (err) {
      console.error('[Update Avatar Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to update avatar.' });
    }
  }
}

module.exports = new ProfileController();

