import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file from the parent directory of config/
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sri_gowthami_tracker',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a database connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection immediately on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
  } catch (error) {
    console.error('[Database] Failed to connect to MySQL database on startup.');
    console.error(`Error details: ${error.message}`);
    console.error('Make sure MySQL is running and that database configuration credentials inside server/.env are correct.');
  }
};

testConnection();

export default pool;
export { testConnection };
