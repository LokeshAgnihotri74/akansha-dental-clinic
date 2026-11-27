const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isDbConnected = false;

const initPool = () => {
  if (pool) return pool;

  try {
    if (process.env.DATABASE_URL) {
      console.log('🔌 Initializing DB pool from DATABASE_URL environment string...');
      pool = mysql.createPool(process.env.DATABASE_URL);
    } else {
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
    }
  } catch (err) {
    console.error('❌ Failed to initialize database pool:', err.message);
  }
  return pool;
};

initPool();

/**
 * Ensure database tables and unique constraints exist
 */
const ensureSchemaAndConstraints = async (connection) => {
  try {
    // 1. Ensure appointments table exists with unique constraint to prevent double-booking
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        booking_reference VARCHAR(80) NOT NULL UNIQUE,
        patient_id BIGINT NOT NULL,
        doctor_id BIGINT NOT NULL DEFAULT 0,
        service_id BIGINT NOT NULL,
        appointment_date DATE NOT NULL,
        time_slot VARCHAR(30) NOT NULL,
        status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        notes TEXT,
        cancellation_reason TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_appt_date_doc (appointment_date, doctor_id, status)
      ) ENGINE=InnoDB;
    `);

    // 2. Ensure audit_logs table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        actor_username VARCHAR(150),
        action VARCHAR(100),
        resource VARCHAR(100),
        ip_address VARCHAR(50),
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. Try to add unique constraint on (doctor_id, appointment_date, time_slot) if not already existing
    try {
      await connection.query(`
        ALTER TABLE appointments 
        ADD UNIQUE KEY uq_active_doctor_slot (doctor_id, appointment_date, time_slot);
      `);
      console.log('🛡️ Verified unique database constraint on (doctor_id, appointment_date, time_slot).');
    } catch (constraintErr) {
      // Constraint already exists or duplicate entries exist; non-fatal
    }
  } catch (schemaErr) {
    console.warn('Database schema verification notice:', schemaErr.message);
  }
};

/**
 * Test DB Connection on server start
 */
const testConnection = async () => {
  if (!pool) initPool();
  if (!pool) return false;

  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to:', process.env.DB_NAME || (process.env.DATABASE_URL ? 'Managed Cloud DB' : 'akansha_dental_db'));
    await ensureSchemaAndConstraints(connection);
    connection.release();
    isDbConnected = true;
    return true;
  } catch (error) {
    console.warn('\n⚠️ [Database Notice]: Direct database server is currently unreachable.');
    console.warn('   Reason:', error.message);
    console.warn('   💡 In the meantime, the application is using the persistent atomic file store with automated backups.\n');
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
