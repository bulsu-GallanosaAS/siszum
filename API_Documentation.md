# SISZUM POS API Documentation
## Complete API endpoints for Admin Side and Client Side features

### Base URL: `http://localhost:5000/api`

## 🔐 Authentication Endpoints

### Admin Authentication
- **POST** `/auth/admin/login` - Admin login
- **POST** `/auth/admin/logout` - Admin logout  
- **GET** `/auth/admin/me` - Get current admin user
- **PUT** `/auth/admin/profile` - Update admin profile
- **POST** `/auth/admin/upload-avatar` - Upload admin avatar

## 📊 Dashboard Endpoints

### Dashboard Statistics
- **GET** `/dashboard/stats` - Get dashboard statistics (orders, reservations, refills, revenue)
- **GET** `/dashboard/upcoming-guests` - Get upcoming reservations for today
- **GET** `/dashboard/pending-orders` - Get pending orders
- **GET** `/dashboard/recent-orders` - Get recent completed orders
- **GET** `/dashboard/revenue-chart` - Get revenue chart data for the week

## 👥 Customer Management Endpoints

### Customer Accounts
- **GET** `/customers` - Get all customers with pagination
- **POST** `/customers` - Create new customer account
- **GET** `/customers/:id` - Get customer by ID
- **PUT** `/customers/:id` - Update customer information
- **DELETE** `/customers/:id` - Delete customer account
- **GET** `/customers/search` - Search customers by name, email, or phone

### Customer Feedback
- **GET** `/customers/feedback` - Get all customer feedback
- **POST** `/customers/feedback` - Submit customer feedback
- **PUT** `/customers/feedback/:id` - Update feedback status
- **DELETE** `/customers/feedback/:id` - Delete feedback
- **POST** `/customers/feedback/:id/respond` - Respond to feedback

## 📅 Reservation Management Endpoints

### Reservations
- **GET** `/reservations` - Get all reservations with filters
- **POST** `/reservations` - Create new reservation
- **GET** `/reservations/:id` - Get reservation details
- **PUT** `/reservations/:id` - Update reservation
- **DELETE** `/reservations/:id` - Cancel reservation
- **GET** `/reservations/calendar` - Get calendar view data
- **GET** `/reservations/upcoming` - Get upcoming reservations
- **PUT** `/reservations/:id/confirm` - Confirm reservation
- **PUT** `/reservations/:id/complete` - Mark reservation as completed

## 🏪 Inventory Management Endpoints

### Menu Categories
- **GET** `/inventory/categories` - Get all menu categories
- **POST** `/inventory/categories` - Create new category
- **PUT** `/inventory/categories/:id` - Update category
- **DELETE** `/inventory/categories/:id` - Delete category

### Menu Items/Products
- **GET** `/inventory/products` - Get all products with pagination and filters
- **POST** `/inventory/products` - Add new menu item
- **GET** `/inventory/products/:id` - Get product details
- **PUT** `/inventory/products/:id` - Update product
- **DELETE** `/inventory/products/:id` - Delete product
- **POST** `/inventory/products/:id/upload-image` - Upload product image
- **GET** `/inventory/stats` - Get inventory statistics
- **GET** `/inventory/low-stock` - Get low stock items
- **PUT** `/inventory/products/:id/availability` - Update product availability

## 🛒 Order Management Endpoints

### Orders
- **GET** `/orders` - Get all orders with pagination and filters
- **POST** `/orders` - Create new order
- **GET** `/orders/:id` - Get order details
- **PUT** `/orders/:id` - Update order
- **DELETE** `/orders/:id` - Cancel order
- **GET** `/orders/active` - Get active orders (pending, in-progress)
- **PUT** `/orders/:id/status` - Update order status
- **GET** `/orders/:id/items` - Get order items

### Order Items
- **POST** `/orders/:id/items` - Add item to order
- **PUT** `/orders/:id/items/:itemId` - Update order item
- **DELETE** `/orders/:id/items/:itemId` - Remove item from order

### Order Discounts
- **POST** `/orders/:id/discounts` - Apply discount to order
- **DELETE** `/orders/:id/discounts/:discountId` - Remove discount from order
- **GET** `/discounts` - Get available discounts

## 💰 Transaction & Payment Endpoints

### Transactions
- **GET** `/transactions` - Get all transactions with filters
- **POST** `/transactions` - Process payment
- **GET** `/transactions/:id` - Get transaction details
- **GET** `/transactions/stats` - Get transaction statistics
- **GET** `/transactions/chart-data` - Get chart data for transactions
- **POST** `/transactions/:id/refund` - Process refund

### Payment Methods
- **GET** `/payments/methods` - Get available payment methods
- **POST** `/payments/process` - Process payment
- **GET** `/payments/:id/status` - Check payment status

## 🧾 Receipt Management Endpoints

### Receipts
- **GET** `/receipts/:orderId` - Get receipt for order
- **POST** `/receipts/generate` - Generate receipt
- **POST** `/receipts/:id/print` - Mark receipt as printed
- **POST** `/receipts/:id/email` - Email receipt to customer
- **PUT** `/receipts/:id/void` - Void receipt

## ⏱️ Customer Timer Endpoints

### Timers
- **GET** `/timers/active` - Get all active customer timers
- **POST** `/timers/start` - Start customer timer
- **PUT** `/timers/:id/stop` - Stop customer timer
- **GET** `/timers/:id` - Get timer details
- **DELETE** `/timers/:id` - Delete timer record

## 🔄 Refill Management Endpoints

### Refill Requests
- **GET** `/refills` - Get all refill requests
- **POST** `/refills` - Create refill request
- **GET** `/refills/:id` - Get refill request details
- **PUT** `/refills/:id` - Update refill request status
- **DELETE** `/refills/:id` - Cancel refill request
- **GET** `/refills/pending` - Get pending refill requests

## 🏓 Table Management Endpoints

### Restaurant Tables
- **GET** `/tables` - Get all tables
- **POST** `/tables` - Add new table
- **GET** `/tables/:id` - Get table details
- **PUT** `/tables/:id` - Update table information
- **DELETE** `/tables/:id` - Remove table
- **PUT** `/tables/:id/status` - Update table status
- **GET** `/tables/available` - Get available tables

## 🎯 POS Interface Endpoints

### POS Operations
- **GET** `/pos/menu` - Get POS menu with categories and items
- **POST** `/pos/orders/draft` - Create draft order
- **PUT** `/pos/orders/:id/add-item` - Add item to order
- **PUT** `/pos/orders/:id/remove-item` - Remove item from order
- **POST** `/pos/orders/:id/assign-table` - Assign table to order
- **POST** `/pos/orders/:id/apply-discount` - Apply discount
- **POST** `/pos/orders/:id/complete` - Complete order
- **GET** `/pos/orders/active` - Get active POS orders

## 📱 Client Side Endpoints (Customer App)

### Customer Dashboard
- **GET** `/client/dashboard` - Get customer dashboard data
- **GET** `/client/menu` - Get menu for customers

### Customer Reservations
- **POST** `/client/reservations` - Make reservation (fill out form)
- **GET** `/client/reservations/:customerId` - Get customer reservations
- **PUT** `/client/reservations/:id` - Update reservation

### Customer Refill Requests
- **POST** `/client/refills` - Create refill request
- **GET** `/client/refills/:customerId` - Get customer refill requests

### Customer Account Creation
- **POST** `/client/customers/register` - Create customer account
- **PUT** `/client/customers/:id` - Update customer account
- **GET** `/client/customers/:id` - Get customer profile

### Customer Feedback
- **POST** `/client/feedback` - Submit feedback
- **GET** `/client/feedback/:customerId` - Get customer's feedback history

## 📈 Analytics & Reports Endpoints

### Analytics
- **GET** `/analytics/sales-report` - Get sales report by date range
- **GET** `/analytics/popular-items` - Get most popular menu items
- **GET** `/analytics/peak-hours` - Get peak business hours
- **GET** `/analytics/customer-insights` - Get customer behavior insights
- **GET** `/analytics/revenue-trends` - Get revenue trend analysis

## 🔍 Search & Filter Endpoints

### Global Search
- **GET** `/search` - Global search across orders, customers, products
- **GET** `/search/customers` - Search customers
- **GET** `/search/orders` - Search orders
- **GET** `/search/products` - Search products
- **GET** `/search/reservations` - Search reservations

## 📁 File Upload Endpoints

### File Management
- **POST** `/upload/avatar` - Upload user avatar
- **POST** `/upload/product-image` - Upload product image
- **POST** `/upload/documents` - Upload documents
- **DELETE** `/upload/:fileId` - Delete uploaded file

## ⚙️ System Administration Endpoints

### Admin Management
- **GET** `/admin/users` - Get all admin users
- **POST** `/admin/users` - Create new admin user
- **PUT** `/admin/users/:id` - Update admin user
- **DELETE** `/admin/users/:id` - Delete admin user
- **PUT** `/admin/users/:id/role` - Update user role

### System Settings
- **GET** `/settings` - Get system settings
- **PUT** `/settings` - Update system settings
- **GET** `/settings/business-hours` - Get business hours
- **PUT** `/settings/business-hours` - Update business hours

### Activity Logs
- **GET** `/logs/activity` - Get activity logs
- **GET** `/logs/errors` - Get error logs
- **DELETE** `/logs/clear` - Clear old logs

## 📊 Real-time WebSocket Events

### WebSocket Endpoints
- `/ws/orders` - Real-time order updates
- `/ws/timers` - Real-time timer updates
- `/ws/reservations` - Real-time reservation updates
- `/ws/refills` - Real-time refill request updates
- `/ws/notifications` - General notifications

### Socket Events
- `order_created` - New order created
- `order_updated` - Order status changed
- `timer_started` - Customer timer started
- `timer_updated` - Timer tick update
- `reservation_confirmed` - Reservation confirmed
- `refill_requested` - New refill request
- `payment_completed` - Payment processed

## 🔒 Authentication & Authorization

### Middleware
- `authenticateToken` - Verify JWT token
- `authorizeAdmin` - Check admin permissions
- `authorizeRole(['admin', 'manager'])` - Role-based access
- `rateLimiter` - API rate limiting
- `validateRequest` - Input validation

### Permissions
- **Super Admin**: Full system access
- **Admin**: All operations except user management
- **Manager**: Limited to daily operations
- **Customer**: Client-side features only

## 📝 Request/Response Examples

### Create Order Example
```json
POST /api/orders
{
  "customer_name": "John Doe",
  "table_id": 1,
  "order_type": "dine_in",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "unit_price": 299.00
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "order_code": "ORD001",
    "total_amount": 598.00,
    "status": "pending"
  }
}
```

### Apply Discount Example
```json
POST /api/pos/orders/123/apply-discount
{
  "discount_id": 1,
  "discount_type": "senior"
}

Response:
{
  "success": true,
  "data": {
    "discount_amount": 119.60,
    "new_total": 478.40
  }
}
```

This comprehensive API documentation covers all the features shown in your Figma designs for both the admin side and client side of the SISZUM POS system.
