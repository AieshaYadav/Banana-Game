const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedLeaderboard() {
  console.log('[Seeder] Seeding initial leaderboard players...');

  const samplePlayers = [
    { username: 'BananaKing', email: 'king@jungle.org', avatar: '👑', score: 1850, games: 16, correct: 15, streak: 9, high: 165 },
    { username: 'MonkeyGenius', email: 'genius@jungle.org', avatar: '🐒', score: 1520, games: 14, correct: 13, streak: 7, high: 155 },
    { username: 'MathWizard', email: 'wizard@jungle.org', avatar: '🧙‍♂️', score: 1290, games: 12, correct: 11, streak: 6, high: 148 },
    { username: 'NinjaSolver', email: 'ninja@jungle.org', avatar: '🥷', score: 980, games: 10, correct: 9, streak: 4, high: 142 },
    { username: 'CyberApe', email: 'cyber@jungle.org', avatar: '🤖', score: 740, games: 8, correct: 7, streak: 3, high: 135 }
  ];

  for (const player of samplePlayers) {
    try {
      const hash = await bcrypt.hash('password123', 8);
      const [existing] = await query('SELECT * FROM users WHERE username = ? OR email = ?', [player.username, player.email]);
      
      let userId;
      if (!existing || existing.length === 0) {
        const [res] = await query(
          'INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)',
          [player.username, player.email, hash, player.avatar]
        );
        userId = res.insertId;
      } else {
        userId = existing[0].id;
      }

      await query(
        `UPDATE user_stats SET 
          total_score = ?,
          games_played = ?,
          correct_answers = ?,
          wrong_answers = ?,
          high_score = ?,
          highest_streak = ?,
          last_played_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [player.score, player.games, player.correct, player.games - player.correct, player.high, player.streak, userId]
      );
    } catch (err) {
      console.warn(`Could not seed ${player.username}:`, err.message);
    }
  }

  console.log('[✓] Leaderboard seeding complete!');
}

seedLeaderboard().then(() => process.exit(0)).catch(() => process.exit(1));
