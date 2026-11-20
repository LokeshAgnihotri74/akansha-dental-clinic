const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isDbConnected = false;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'akansha_dental_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  });
} catch (err) {
  console.error('❌ Failed to initialize MySQL pool:', err.message);
}

/**
 * Test DB Connection on server start
 */
const testConnection = async () => {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connected successfully to:', process.env.DB_NAME || 'akansha_dental_db');
    connection.release();
    isDbConnected = true;
    return true;
  } catch (error) {
    console.warn('\n⚠️ [Database Notice]: MySQL is not connected on port', process.env.DB_PORT || 3306);
    console.warn('   Reason:', error.message);
    console.warn('   ℹ️ Tip: Start MySQL (XAMPP / MySQL Service) & import database/schema.sql & seed.sql.');
    console.warn('   💡 In the meantime, the server will safely handle requests with in-memory memory fallback.\n');
    isDbConnected = false;
    return false;
  }
};

/**
 * Execute a query with connection error resilience
 */
const query = async (sql, params = []) => {
  if (!isDbConnected || !pool) {
    throw new Error('DATABASE_OFFLINE');
  }
  const [rows] = await pool.execute(sql, params);
  return rows;
};

module.exports = {
  pool,
  query,
  testConnection,
  getIsDbConnected: () => isDbConnected
};
