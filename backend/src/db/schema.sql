-- Banana Game Enterprise Schema (MySQL 8.0+)
-- Designed for CIS046-3 Software For Enterprise
CREATE DATABASE IF NOT EXISTS banana_game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banana_game_db;

-- 1. Users Table (Virtual Identity Core)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(50) DEFAULT '🍌',
  bio VARCHAR(255) DEFAULT 'Banana Game Enthusiast',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- 2. User Stats Table (Aggregated performance for Real Leaderboard)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id INT PRIMARY KEY,
  total_score INT NOT NULL DEFAULT 0,
  games_played INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  wrong_answers INT NOT NULL DEFAULT 0,
  high_score INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  highest_streak INT NOT NULL DEFAULT 0,
  hints_used_count INT NOT NULL DEFAULT 0,
  last_played_at TIMESTAMP NULL,
  CONSTRAINT fk_user_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_total_score (total_score DESC),
  INDEX idx_high_score (high_score DESC)
) ENGINE=InnoDB;

-- 3. Game Rounds Table (Anti-Cheat Server-Side Validation)
CREATE TABLE IF NOT EXISTS game_rounds (
  id VARCHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  question_url VARCHAR(512) NOT NULL,
  solution INT NOT NULL, -- Never sent to client! Prevents data leaks.
  hint_level INT NOT NULL DEFAULT 0,
  points_potential INT NOT NULL DEFAULT 100,
  status ENUM('active', 'solved', 'failed', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_game_rounds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB;

-- 4. Match History Table (Detailed audit trail and player profile records)
CREATE TABLE IF NOT EXISTS match_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  round_id VARCHAR(64) NOT NULL,
  user_answer INT NOT NULL,
  correct_solution INT NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  points_awarded INT NOT NULL DEFAULT 0,
  hints_used INT NOT NULL DEFAULT 0,
  time_taken_seconds INT NOT NULL DEFAULT 0,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_match_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_history (user_id, played_at DESC)
) ENGINE=InnoDB;
