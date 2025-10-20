import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import reservationsRoutes from './routes/reservations';
import tablesRoutes from './routes/tables';
import inventoryRoutes from './routes/inventory';
import rawInventoryRoutes from './routes/rawInventory';
import customersRoutes from './routes/customers';
import ordersRoutes from './routes/orders';
import transactionsRoutes from './routes/transactions';
import refillsRoutes from './routes/refills';
import timersRoutes from './routes/timers';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://siszumfront.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "https://siszumfront.onrender.com",
  credentials: true
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Make io available to all routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/raw-inventory', rawInventoryRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/refills', refillsRoutes);
app.use('/api/timers', timersRoutes);

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
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// image
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use environment PORT if set, fallback to 5000 for local testing
const PORT = process.env.PORT || 5000;

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log('Database connected successfully');

    // Only start server if running in persistent environment (Render/Railway)
    if (PORT) {
      server.listen(PORT, () => {
        console.log(`🚀 SISZUM POS Server running on port ${PORT}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io, app };
