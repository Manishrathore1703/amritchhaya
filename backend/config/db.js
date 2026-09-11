/**
 * MySQL Connection Pool Setup
 * 
 * Educational Note on Database Connection Pools:
 * Creating a new database connection for every single HTTP request adds latency
 * and depletes server resources. A pool maintains reusable connections.
 * 
 * We use `mysql2/promise` so that every query can be executed asynchronously
 * using standard JavaScript async/await.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'amritchhaya_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection Function
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connection Pool established successfully.');
    connection.release(); // Always release connection back to pool!
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
