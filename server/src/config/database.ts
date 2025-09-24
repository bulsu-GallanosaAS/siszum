import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'sql.freedb.tech',
  user: process.env.DB_USER || 'freedb_siszum_adminn',
  password: process.env.DB_PASSWORD || '9F!VFT*8rH4pjMF',
  database: process.env.DB_NAME || 'freedb_siszum_poss',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Initialize database - create database if it doesn't exist
export async function initDatabase() {
  try {
    // First connect without database name to create database if needed
    const tempConfig = { 
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    };
    const tempConnection = await mysql.createConnection(tempConfig);
    
    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await tempConnection.end();
    
    // Test the pool connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Helper function to execute queries
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

// Helper function for transactions
export async function executeTransaction(queries: { query: string; params: any[] }[]): Promise<any> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
