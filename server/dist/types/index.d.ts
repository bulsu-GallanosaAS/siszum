import { Request } from 'express';
export interface Admin {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
    date_of_birth?: Date;
    city?: string;
    country?: string;
    role: 'super_admin' | 'admin' | 'manager';
    is_active: boolean;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}
export interface Customer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth?: Date;
    address?: string;
    city?: string;
    country?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface RestaurantTable {
    id: number;
    table_number: string;
    table_code: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    location?: string;
    created_at: Date;
    updated_at: Date;
}
export interface MenuCategory {
    id: number;
    name: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface MenuItem {
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
    created_at: Date;
    updated_at: Date;
}
export interface Discount {
    id: number;
    name: string;
    code?: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    description?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
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
    reservation_date: Date;
    reservation_time: string;
    duration_hours: number;
    payment_amount: number;
    payment_status: 'pending' | 'paid' | 'cancelled';
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    created_at: Date;
    updated_at: Date;
}
export interface Order {
    id: number;
    order_code: string;
    customer_id?: number;
    customer_name?: string;
    table_id?: number;
    order_type: 'dine_in' | 'takeout' | 'delivery';
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
    order_date: Date;
    order_time: string;
    completed_at?: Date;
    notes?: string;
    created_by?: number;
    created_at: Date;
    updated_at: Date;
}
export interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions?: string;
    created_at: Date;
}
export interface OrderDiscount {
    id: number;
    order_id: number;
    discount_id: number;
    discount_amount: number;
    applied_at: Date;
}
export interface Transaction {
    id: number;
    transaction_code: string;
    order_id: number;
    customer_id?: number;
    payment_method: 'cash' | 'card' | 'gcash' | 'bank_transfer';
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    reference_number?: string;
    payment_date: Date;
    payment_time: string;
    processed_by?: number;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}
export interface Receipt {
    id: number;
    receipt_number: string;
    order_id: number;
    transaction_id?: number;
    customer_name?: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    generated_at: Date;
    printed_at?: Date;
    email_sent_at?: Date;
    is_voided: boolean;
    void_reason?: string;
    voided_at?: Date;
    voided_by?: number;
}
export interface CustomerTimer {
    id: number;
    customer_name: string;
    table_id: number;
    order_id?: number;
    start_time: Date;
    end_time?: Date;
    elapsed_seconds: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface RefillRequest {
    id: number;
    table_code: string;
    table_id: number;
    customer_id?: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    request_type?: string;
    price: number;
    requested_at: Date;
    completed_at?: Date;
    processed_by?: number;
    notes?: string;
}
export interface CustomerFeedback {
    id: number;
    customer_id?: number;
    customer_name: string;
    email?: string;
    feedback_type: 'compliment' | 'complaint' | 'suggestion' | 'general';
    rating?: number;
    feedback_text: string;
    order_id?: number;
    status: 'pending' | 'reviewed' | 'responded' | 'resolved';
    admin_response?: string;
    responded_by?: number;
    responded_at?: Date;
    created_at: Date;
    updated_at: Date;
}
export interface ActivityLog {
    id: number;
    user_id?: number;
    user_type: 'admin' | 'customer';
    action: string;
    table_name?: string;
    record_id?: number;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}
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
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: Omit<Admin, 'password_hash'>;
}
export interface DashboardStats {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_reservations: number;
    active_timers: number;
    low_stock_items: number;
}
export interface SocketEvents {
    order_created: Order;
    order_updated: Order;
    timer_started: CustomerTimer;
    timer_updated: CustomerTimer;
    reservation_confirmed: Reservation;
    refill_requested: RefillRequest;
    payment_completed: Transaction;
}
export interface AuthenticatedRequest extends Request {
    user?: Admin;
}
//# sourceMappingURL=index.d.ts.map