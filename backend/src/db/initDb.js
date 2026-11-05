const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

async function runInit() {
  console.log('--- Initializing MySQL Database for Enterprise Banana Game ---');
  console.log(`Target Host: ${config.db.host}:${config.db.port}`);
  console.log(`Target User: ${config.db.user}`);
  console.log(`Database Name: ${config.db.database}`);

  try {
    // 1. Connect to root
    const connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password
    });

    console.log('[✓] Connected to MySQL Server successfully.');

    // 2. Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[✓] Database '${config.db.database}' ensured.`);

    await connection.changeUser({ database: config.db.database });

    // 3. Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use') && !s.toLowerCase().startsWith('create database'));

    for (const statement of statements) {
      if (statement) {
        await connection.query(statement);
      }
    }

    console.log('[✓] All tables (users, user_stats, game_rounds, match_history) successfully created/verified.');
    await connection.end();
    console.log('--- Database Initialization Complete! ---');
    process.exit(0);
  } catch (err) {
    console.error('[✗] Database initialization failed:', err.message);
    console.error('Note: If your MySQL server uses a password, please update DB_PASSWORD in backend/.env');
    process.exit(1);
  }
}

runInit();
