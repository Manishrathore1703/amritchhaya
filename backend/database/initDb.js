/**
 * Database Initialization Script
 * 
 * Educational note for Node.js + MySQL:
 * This script connects to MySQL, creates the database if it doesn't exist,
 * executes the `schema.sql` table definitions and seeds a default Super Admin.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  console.log('🔄 Initializing Amrit Chhaya Database...');

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'amritchhaya_db';

  let connection;
  try {
    // 1. Connect without selecting database to ensure database exists
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log(`✅ Connected to MySQL server at ${host}:${port}`);

    // 2. Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`✅ Database '${dbName}' verified/created.`);

    // 3. Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(sqlScript);
    console.log('✅ Database schema and seed data loaded successfully!');

    // 4. Create default Super Admin user if not exists
    const [existingAdmin] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    
    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash('password', 10);
      await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@example.com', passwordHash, 'SUPER_ADMIN']
      );
      console.log('👤 Default Super Admin created: email: admin@example.com | password: password');
    } else {
      console.log('👤 Super Admin account already exists.');
    }

    console.log('🚀 Database Initialization Completed Successfully!');
  } catch (error) {
    console.error('❌ Error during database initialization:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Execute if run directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
