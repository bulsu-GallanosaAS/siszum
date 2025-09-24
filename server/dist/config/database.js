"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initDatabase = initDatabase;
exports.executeQuery = executeQuery;
exports.executeTransaction = executeTransaction;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
exports.pool = promise_1.default.createPool(dbConfig);
// Initialize database - create database if it doesn't exist
async function initDatabase() {
    try {
        // First connect without database name to create database if needed
        const tempConfig = {
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        };
        const tempConnection = await promise_1.default.createConnection(tempConfig);
        // Create database if it doesn't exist
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        await tempConnection.end();
        // Test the pool connection
        const connection = await exports.pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
// Helper function to execute queries
async function executeQuery(query, params = []) {
    try {
        const [results] = await exports.pool.execute(query, params);
        return results;
    }
    catch (error) {
        console.error('Query execution error:', error);
        throw error;
    }
}
// Helper function for transactions
async function executeTransaction(queries) {
    const connection = await exports.pool.getConnection();
    try {
        await connection.beginTransaction();
        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        await connection.commit();
        return results;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
//# sourceMappingURL=database.js.map