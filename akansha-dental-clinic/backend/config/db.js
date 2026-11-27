const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { bootstrapDatabase } = require('../database/bootstrap');

dotenv.config();

let pool = null;
let isDbConnected = false;
let dbPingInterval = null;

const initPool = () => {
  if (pool) return pool;

  try {
    const isSslRequired = Boolean(
      process.env.DB_SSL === 'true' ||
      process.env.DB_SSL === '1' ||
      process.env.DB_SSL === 'require' ||
      (process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com'))
    );

    const sslConfig = isSslRequired ? { rejectUnauthorized: false } : undefined;

    if (process.env.DATABASE_URL) {
      console.log('🔌 Initializing DB pool from DATABASE_URL environment string...');
      pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: sslConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        decimalNumbers: true
      });
    } else {
      const host = process.env.DB_HOST || 'localhost';
      const port = parseInt(process.env.DB_PORT, 10) || 3306;
      const user = process.env.DB_USER || 'root';
      const password = process.env.DB_PASSWORD || '';
      const database = process.env.DB_NAME || 'akansha_dental_db';

      console.log(`🔌 Initializing MySQL DB pool for ${user}@${host}:${port}/${database}${isSslRequired ? ' (SSL Enabled)' : ''}...`);

      pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        ssl: sslConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        decimalNumbers: true
      });
    }
  } catch (err) {
    console.error('❌ Failed to initialize database pool:', err.message);
  }
  return pool;
};

initPool();

/**
 * Start keep-alive ping to prevent AWS RDS / cloud firewalls from closing idle pool connections
 */
const startKeepAlive = () => {
  if (dbPingInterval) return;
  dbPingInterval = setInterval(async () => {
    if (!pool || !isDbConnected) return;
    try {
      await pool.query('SELECT 1');
    } catch (err) {
      console.warn('⚠️ [DB Keepalive]: Ping check warning:', err.message);
    }
  }, 60000); // Every 60 seconds
  if (dbPingInterval.unref) dbPingInterval.unref();
};

/**
 * Test DB Connection on server start and bootstrap schema
 */
const testConnection = async () => {
  if (!pool) initPool();
  if (!pool) return false;

  try {
    const connection = await pool.getConnection();
    const dbName = process.env.DB_NAME || 'akansha_dental_db';
    const isAws = Boolean(process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com'));
    
    console.log(`\n===========================================================`);
    console.log(`✅ [Database Connected Successfully]`);
    console.log(`   Engine:   MySQL 8.x ${isAws ? '(AWS RDS Managed Instance)' : '(Cloud / Managed MySQL)'}`);
    console.log(`   Host:     ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Database: ${dbName}`);
    console.log(`===========================================================\n`);

    // Bootstrap schema and one-time import
    await bootstrapDatabase(connection);
    connection.release();

    isDbConnected = true;
    startKeepAlive();
    return true;
  } catch (error) {
    console.warn('\n⚠️ [Database Standby Notice]: Direct MySQL server is currently unreachable.');
    console.warn('   Reason:', error.message);
    console.warn('   💡 For production persistence on AWS or Render, configure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, and DB_SSL.\n');
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
  const [rows] = await pool.query(sql, params);
  return rows;
};

/**
 * Transaction helper for atomic operations
 */
const transaction = async (callback) => {
  if (!isDbConnected || !pool) {
    throw new Error('DATABASE_OFFLINE');
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  getIsDbConnected: () => isDbConnected
};
