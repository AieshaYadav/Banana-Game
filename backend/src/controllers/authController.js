const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const config = require('../config/config');

class AuthController {
  /**
   * Register a new user (Virtual Identity creation)
   */
  async register(req, res) {
    try {
      const { username, email, password, avatar } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required.'
        });
      }

      if (username.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters for enterprise security.'
        });
      }

      // Check if user already exists
      const [existingUsers] = await query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username.trim(), email.trim().toLowerCase()]
      );

      if (existingUsers && existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'A user with this username or email already exists.'
        });
      }

      // Hash password securely with bcrypt salt
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const userAvatar = avatar || '🍌';

      // Insert into users
      const [result] = await query(
        'INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)',
        [username.trim(), email.trim().toLowerCase(), passwordHash, userAvatar]
      );

      const userId = result.insertId;

      // Initialize user_stats table
      await query(
        'INSERT INTO user_stats (user_id, total_score, games_played, correct_answers, wrong_answers, high_score, current_streak, highest_streak, hints_used_count) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0)',
        [userId]
      );

      // Sign JWT
      const token = jwt.sign(
        { id: userId, username: username.trim(), email: email.trim().toLowerCase() },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to the Banana Game.',
        token,
        user: {
          id: userId,
          username: username.trim(),
          email: email.trim().toLowerCase(),
          avatar: userAvatar
        }
      });
    } catch (err) {
      console.error('[Registration Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during registration.'
      });
    }
  }

  /**
   * User login with credential validation
   */
  async login(req, res) {
    try {
      const { identifier, password } = req.body; // username or email

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username/Email and password are required.'
        });
      }

      // Find user
      const [users] = await query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [identifier.trim(), identifier.trim().toLowerCase()]
      );

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password credentials.'
        });
      }

      const user = users[0];

      // Compare password hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password credentials.'
        });
      }

      // Fetch user stats
      const [statsRows] = await query('SELECT * FROM user_stats WHERE user_id = ?', [user.id]);
      const stats = statsRows && statsRows.length > 0 ? statsRows[0] : null;

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          stats
        }
      });
    } catch (err) {
      console.error('[Login Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during login.'
      });
    }
  }

  /**
   * Get current authenticated user profile and live stats
   */
  async getMe(req, res) {
    try {
      const [userRows] = await query('SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?', [req.user.id]);
      if (!userRows || userRows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const user = userRows[0];
      const [statsRows] = await query('SELECT * FROM user_stats WHERE user_id = ?', [req.user.id]);
      const stats = statsRows && statsRows.length > 0 ? statsRows[0] : {
        total_score: 0,
        games_played: 0,
        correct_answers: 0,
        wrong_answers: 0,
        high_score: 0,
        current_streak: 0,
        highest_streak: 0,
        hints_used_count: 0
      };

      const winRate = stats.games_played > 0
        ? Math.round((stats.correct_answers / stats.games_played) * 100)
        : 0;

      return res.json({
        success: true,
        user: {
          ...user,
          stats: {
            ...stats,
            win_rate: winRate
          }
        }
      });
    } catch (err) {
      console.error('[GetMe Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  }

  /**
   * Update avatar and bio
   */
  async updateProfile(req, res) {
    try {
      const { avatar } = req.body;
      if (!avatar) {
        return res.status(400).json({ success: false, message: 'Avatar is required.' });
      }

      await query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.user.id]);

      return res.json({
        success: true,
        message: 'Profile avatar updated successfully!',
        avatar
      });
    } catch (err) {
      console.error('[Update Profile Error]', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }
}

module.exports = new AuthController();
