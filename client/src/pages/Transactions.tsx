import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, TrendingUp, CreditCard, Users, ChevronLeft, ChevronRight, PhilippinePeso, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient as api } from '../services';
import './Transactions.css';

interface Transaction {
  id: number;
  transaction_code: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
  payment_time: string;
  table_number: string;
  order_code: string;
  reference_number: string;
}

interface StatsData {
  name: string;
  value: number;
  change: string;
  icon: any;
  color: string;
}

interface Filters {
  status: string;
  paymentMethod: string;
  dateFrom: string;
  search: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    paymentMethod: '',
    dateFrom: '',
    search: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const chartData = [
    { name: 'Mon', revenue: 2000 },
    { name: 'Tue', revenue: 3500 },
    { name: 'Wed', revenue: 2800 },
    { name: 'Thu', revenue: 4200 },
    { name: 'Fri', revenue: 3800 },
    { name: 'Sat', revenue: 5200 },
    { name: 'Sun', revenue: 4800 }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '5'
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('payment_method', filters.paymentMethod);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await api.get(`/transactions?${params.toString()}`);

      if (response.data.success) {
        setTransactions(response.data.data.transactions);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalItems(response.data.data.pagination.totalItems);

        const stats = response.data.data.stats;
        setStatsData([
          { name: 'Total Revenue', value: stats.total_revenue || 0, change: '+12%', icon: TrendingUp, color: '#10b981' },
          { name: 'Today Revenue', value: stats.today_revenue || 0, change: '+8%', icon: Calendar, color: '#3b82f6' },
          { name: 'Total Reservation Fee', value: `₱${stats.total_reservations_fee || 0}`, change: '+6%', icon: PhilippinePeso, color: '#ef4444' },
          { name: 'Today Reservation Fee', value: `₱${stats.today_reservations_fee || 0}`, change: '+1%', icon: Clock, color: '#FF6B35' },
          { name: 'Total Transactions', value: stats.total_transactions || 0, change: '+5%', icon: CreditCard, color: '#8b5cf6' },
          { name: 'Today Transactions', value: stats.today_transactions || 0, change: '+3%', icon: Users, color: '#f59e0b' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.status, filters.paymentMethod, filters.dateFrom, debouncedSearch]);

  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setFilters(prev => ({ ...prev, search: searchParam }));
    }

    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: 'status-completed',
      pending: 'status-pending',
      failed: 'status-failed',
      cancelled: 'status-cancelled'
    };

    return (
      <span className={`status-badge ${statusClasses[status as keyof typeof statusClasses] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'gcash':
        return '📱';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Loading transactions</p>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>
      </div>

      {}
      <div className="stats-grid">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                <IconComponent size={24} />
              </div>
              <div className="stat-details">
                <h3>{stat.name}</h3>
                <p className="stat-value">
                  {stat.name.includes('Revenue') ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                </p>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="chart-section">
        <div className="chart-header">
          <h3>Revenue Overview</h3>
          <span className="chart-subtitle">Daily revenue for the past week</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="payment-filter">Payment Method</label>
            <select
              id="payment-filter"
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="filter-select"
            >
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="gcash">GCash</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter">Date Filter</label>
            <input
              id="date-filter"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="filter-input date-input"
              placeholder="Select Date"
            />
          </div>

          <div className="filter-group">
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setFilters({ status: '', paymentMethod: '', dateFrom: '', search: '' });
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="transactions-table-section">
        <div className="table-header">
          <h3>Recent Transactions</h3>
          <span className="table-subtitle">{totalItems} total transactions</span>
        </div>

        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Table</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <div className="transaction-id">
                      {transaction.transaction_code}
                    </div>
                  </td>
                  <td>
                    <div className="customer-name">
                      {transaction.customer_name || 'Walk-in Customer'}
                    </div>
                  </td>
                  <td>
                    <div className="table-number">
                      Table {transaction.table_number}
                    </div>
                  </td>
                  <td>
                    <div className="amount">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td>
                    <div className="payment-method">
                      <span className="payment-icon">
                        {getPaymentMethodIcon(transaction.payment_method)}
                      </span>
                      {transaction.payment_method.toUpperCase()}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td>
                    <div className="datetime">
                      <div className="date">{formatDate(transaction.payment_date)}</div>
                      <div className="time">{formatTime(transaction.payment_time)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="reference">
                      {transaction.reference_number}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {}
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
