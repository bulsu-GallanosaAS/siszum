// Customer Management Types
export interface Customer {
  id: number;
  customer_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  new_this_month: number;
  customers_with_orders: number;
}

// Inventory Management Types
export interface InventoryItem {
  id: number;
  product_code: string;
  name: string;
  description?: string;
  category_id?: number;
  selling_price: number;
  purchase_price?: number;
  purchase_value?: number;
  quantity_in_stock: number;
  unit_type: string;
  availability: 'available' | 'out_of_stock' | 'discontinued';
  image_url?: string;
  is_unlimited: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryStats {
  total_items: number;
  total_value: number;
  low_stock: number;
  out_of_stock: number;
}

// Reservation Management Types
export interface Reservation {
  id: number;
  reservation_code: string;
  customer_id?: number;
  customer_name: string;
  phone: string;
  email?: string;
  table_id?: number;
  occasion?: string;
  number_of_guests: number;
  reservation_date: string;
  reservation_time: string;
  duration_hours: number;
  payment_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  city?: string;
  country?: string;
  role: 'super_admin' | 'admin' | 'manager';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: Admin;
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number;
  totalReservations: number;
  totalCustomers: number;
  dailyRevenue: number;
  ordersGrowth: number;
  reservationsGrowth: number;
  customersGrowth: number;
  revenueGrowth: number;
}

export interface RecentOrder {
  id: number;
  order_code: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}
