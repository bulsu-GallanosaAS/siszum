import React, { useState, useEffect } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import {
  Calendar,
  Clock,
  Users,
  ShoppingCart,
  CreditCard,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import api from '../services/apiClient';
import './Dashboard.css';

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_reservations: number;
  active_timers: number;
  low_stock_items: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface PendingOrder {
  id: number;
  order_code: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface RecentOrder {
  id: number;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPending, setShowAllPending] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsRes = await api.get('/admin/dashboard/stats');

      if (statsRes.data.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }

      try {
        const pendingOrdersRes = await api.get('/admin/dashboard/pending-orders');
        if (pendingOrdersRes.data.success && pendingOrdersRes.data.data) {
          setPendingOrders(pendingOrdersRes.data.data);
        }
      } catch (error) {
        console.log('Pending orders endpoint not available yet');
        setPendingOrders([]);
      }

      setRevenueData([
        { month: 'Jan', revenue: 45000, orders: 120 },
        { month: 'Feb', revenue: 52000, orders: 140 },
        { month: 'Mar', revenue: 48000, orders: 130 },
        { month: 'Apr', revenue: 61000, orders: 165 },
        { month: 'May', revenue: 55000, orders: 150 },
        { month: 'Jun', revenue: 67000, orders: 180 }
      ]);

      try {
        const ordersRes = await api.get('/admin/dashboard/recent-orders');
        if (ordersRes.data.success && ordersRes.data.data) {
          setRecentOrders(ordersRes.data.data);
        }
      } catch (error) {
        console.log('Recent orders endpoint not available yet');
        setRecentOrders([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Loading dashboard</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="date-info">
          <Calendar size={20} />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">
            <CreditCard />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="stat-value">
              {formatCurrency(stats?.total_revenue || 0)}
            </div>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">
            <ShoppingCart />
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="stat-value">
              {stats?.total_orders?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="stat-card customers">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <div className="stat-value">
              {stats?.total_customers?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="stat-card reservations">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <h3>Reservations</h3>
            <div className="stat-value">
              {stats?.total_reservations || 0}
            </div>
          </div>
        </div>

        <div className="stat-card timers">
          <div className="stat-icon">
            <Clock />
          </div>
          <div className="stat-content">
            <h3>Active Timers</h3>
            <div className="stat-value">
              {stats?.active_timers || 0}
            </div>
            <div className="stat-subtitle">
              Currently running
            </div>
          </div>
        </div>

        <div className="stat-card inventory">
          <div className="stat-icon">
            <Package />
          </div>
          <div className="stat-content">
            <h3>Low Stock Items</h3>
            <div className="stat-value">
              {stats?.low_stock_items || 0}
            </div>
            <div className="stat-subtitle">
              Need restocking
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="charts-section">
        <div className="chart-container full-width">
          <div className="chart-header">
            <h3>Revenue & Orders Trend</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color revenue"></span>
                Revenue
              </span>
              <span className="legend-item">
                <span className="legend-color orders"></span>
                Orders
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="right" dataKey="orders" fill="#4ECDC4" />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="revenue" 
                stroke="#FF6B35" 
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="tables-section">
        <div className="table-container">
          <div className="table-header">
            <h3>Pending Orders</h3>
          </div>
          <div className="table-content">
            {pendingOrders.length > 0 ? (
              <>
                <div className="responsive-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Order Code</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllPending ? pendingOrders : pendingOrders.slice(0, 5)).map((order) => (
                      <tr key={order.id}>
                        <td>{order.order_code}</td>
                        <td>{order.customer_name}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td>
                          <span className={`status ${order.status.toLowerCase()}`}>
                            <AlertCircle size={14} />
                            {order.status}
                          </span>
                        </td>
                        <td>{formatTime(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {pendingOrders.length > 5 && (
                  <button
                    className="see-more-btn"
                    onClick={() => setShowAllPending((prev) => !prev)}
                  >
                    {showAllPending ? 'See Less' : 'See More'}
                  </button>
                )}
              </>
            ) : (
              <div className="empty-state">
                <ShoppingCart size={40} />
                <p>No pending orders</p>
              </div>
            )}
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h3>Recent Orders</h3>
          </div>
          <div className="table-content">
            {recentOrders.length > 0 ? (
              <>
                <div className="responsive-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllRecent ? recentOrders : recentOrders.slice(0, 5)).map((order) => (
                      <tr key={order.id}>
                        <td>{order.customer_name}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td>
                          <span className={`status ${order.status.toLowerCase()}`}>
                            {order.status === 'completed' ? (
                              <CheckCircle size={14} />
                            ) : (
                              <AlertCircle size={14} />
                            )}
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {recentOrders.length > 5 && (
                  <button
                    className="see-more-btn"
                    onClick={() => setShowAllRecent((prev) => !prev)}
                  >
                    {showAllRecent ? 'See Less' : 'See More'}
                  </button>
                )}
              </>
            ) : (
              <div className="empty-state">
                <ShoppingCart size={40} />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
