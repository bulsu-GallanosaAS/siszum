"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const tables_1 = __importDefault(require("./routes/tables"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const customers_1 = __importDefault(require("./routes/customers"));
const orders_1 = __importDefault(require("./routes/orders"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const refills_1 = __importDefault(require("./routes/refills"));
const timers_1 = __importDefault(require("./routes/timers"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const database_1 = require("./config/database");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "https://siszumfront.onrender.com",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});
exports.io = io;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "https://siszumfront.onrender.com",
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Make io available to all routes
app.set('io', io);
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/admin/dashboard', dashboard_1.default);
app.use('/api/reservations', reservations_1.default);
app.use('/api/tables', tables_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/refills', refills_1.default);
app.use('/api/timers', timers_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SISZUM POS Server is running',
        timestamp: new Date().toISOString()
    });
});
// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Test endpoint working'
    });
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Join rooms for real-time updates
    socket.on('join-admin', () => {
        socket.join('admin');
        console.log('Admin joined:', socket.id);
    });
    socket.on('join-pos', () => {
        socket.join('pos');
        console.log('POS terminal joined:', socket.id);
    });
    socket.on('join-customer', (customerId) => {
        socket.join(`customer-${customerId}`);
        console.log(`Customer ${customerId} joined:`, socket.id);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
const PORT = process.env.PORT;
// Initialize database and start server
async function startServer() {
    try {
        await (0, database_1.initDatabase)();
        console.log('Database connected successfully');
        server.listen(PORT, () => {
            console.log(`🚀 SISZUM POS Server running on port ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map