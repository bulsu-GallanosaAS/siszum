import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Eye, UserCheck, Calendar, ShoppingCart, X, Package, Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services';
import { Customer, CustomerStats } from '../types';
import './Customers.css';

interface CustomerFeedback {
  id: number;
  full_name: string;
  email: string;
  feedback: string;
  rating: number;
  created_at: string;
}

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Feedback related state
  const [viewMode, setViewMode] = useState<'customers' | 'feedback'>('customers');
  const [customerFeedback, setCustomerFeedback] = useState<CustomerFeedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
    is_active: true
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Check for search parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    if (viewMode === 'customers') {
      fetchCustomersData();
    } else {
      fetchCustomerFeedback();
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, viewMode, feedbackSearchTerm, selectedRating]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCustomersData = async () => {
    try {
      setLoading(true);
      console.log('Fetching customers data...');
      
      const [customersResponse, statsResponse] = await Promise.all([
        apiClient.get('/customers', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: debouncedSearchTerm,
            status: statusFilter
          }
        }),
        apiClient.get('/customers/stats/overview')
      ]);

      console.log('Customers response:', customersResponse.data);
      console.log('Stats response:', statsResponse.data);

      if (customersResponse.data.success) {
        setCustomers(customersResponse.data.data);
        if (customersResponse.data.pagination) {
          setTotalItems(customersResponse.data.pagination.total);
          setTotalPages(customersResponse.data.pagination.totalPages);
        }
      }
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching customers data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerFeedback = async () => {
    try {
      setFeedbackLoading(true);
      // Mock data for now - replace with actual API call
      const mockFeedback: CustomerFeedback[] = [
        { id: 1, full_name: 'Dron Cano', email: 'DronCano@gmail.com', feedback: 'Great service and delicious food!', rating: 5, created_at: '2024-01-15' },
        { id: 2, full_name: 'Jijar Dabu', email: 'JijarDabu@gmail.com', feedback: 'Quick delivery, will order again.', rating: 4, created_at: '2024-01-14' },
        { id: 3, full_name: 'Filipina Nikka', email: 'FilipinaNikka@gmail.com', feedback: 'Amazing Korean BBQ experience!', rating: 5, created_at: '2024-01-13' },
        { id: 4, full_name: 'Juan Carlos', email: 'JuanCarlos@gmail.com', feedback: 'Good food but a bit pricey.', rating: 3, created_at: '2024-01-12' },
        { id: 5, full_name: 'Hannah Nicole', email: 'HannahNicole@gmail.com', feedback: 'Excellent atmosphere and staff.', rating: 5, created_at: '2024-01-11' },
        { id: 6, full_name: 'Jayper Caguiñas', email: 'JayperCaguinas@gmail.com', feedback: 'Fresh ingredients, loved it!', rating: 4, created_at: '2024-01-10' },
        { id: 7, full_name: 'Aizen Lois', email: 'AizenLois@gmail.com', feedback: 'Perfect for family gatherings.', rating: 5, created_at: '2024-01-09' },
        { id: 8, full_name: 'Clarisse Panagigan', email: 'ClarissePanagigan@gmail.com', feedback: 'Great value for money!', rating: 4, created_at: '2024-01-08' },
        { id: 9, full_name: 'Juarie Marie', email: 'JuarieMarie@gmail.com', feedback: 'Authentic Korean flavors.', rating: 5, created_at: '2024-01-07' },
        { id: 10, full_name: 'Bong bong Marcos', email: 'BongbongMarcos@gmail.com', feedback: 'Will definitely come back!', rating: 4, created_at: '2024-01-06' },
        { id: 11, full_name: 'Vong revilla', email: 'Vongrevilla@gmail.com', feedback: 'Outstanding service quality.', rating: 5, created_at: '2024-01-05' }
      ];
      
      // Filter by search term if provided
      let filtered = feedbackSearchTerm 
        ? mockFeedback.filter(feedback => 
            feedback.full_name.toLowerCase().includes(feedbackSearchTerm.toLowerCase()) ||
            feedback.email.toLowerCase().includes(feedbackSearchTerm.toLowerCase()) ||
            feedback.feedback.toLowerCase().includes(feedbackSearchTerm.toLowerCase())
          )
        : mockFeedback;
      
      // Filter by rating if selected
      if (selectedRating !== null) {
        filtered = filtered.filter(feedback => feedback.rating === selectedRating);
      }
      
      setCustomerFeedback(filtered);
    } catch (error: any) {
      console.error('Error fetching customer feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleViewFeedback = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackModal(true);
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      
      setCustomerFeedback(prev => prev.filter(feedback => feedback.id !== feedbackId));
      alert('Feedback deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback. Please try again.');
    }
  };

  const handleAddCustomer = async () => {
    try {
      const customerData = {
        ...formData,
        date_of_birth: formData.date_of_birth || null
      };

      const response = await apiClient.post('/customers', customerData);
      
      if (response.data.success) {
        alert('Customer added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchCustomersData(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error adding customer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add customer. Please try again.';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: '',
      city: '',
      country: '',
      is_active: true
    });
  };

  // Action handlers for View, Edit, Delete
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email || '',
      phone: customer.phone || '',
      date_of_birth: customer.date_of_birth ? customer.date_of_birth.split('T')[0] : '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || '',
      is_active: customer.is_active
    });
    setShowEditModal(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete "${customer.first_name} ${customer.last_name}"? This action cannot be undone.`)) {
      try {
        const response = await apiClient.delete(`/customers/${customer.id}`);
        if (response.data.success) {
          alert('Customer deleted successfully!');
          fetchCustomersData(); // Refresh the list
        }
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete customer. Please try again.';
        alert(errorMessage);
      }
    }
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const customerData = {
        ...formData,
        date_of_birth: formData.date_of_birth || null
      };

      const response = await apiClient.put(`/customers/${selectedCustomer.id}`, customerData);
      
      if (response.data.success) {
        alert('Customer updated successfully!');
        setShowEditModal(false);
        resetForm();
        setSelectedCustomer(null);
        fetchCustomersData(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update customer. Please try again.';
      alert(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, selectedRating]);

  const handleRatingFilter = (rating: number | null) => {
    setSelectedRating(rating);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#4CAF50' : '#F44336';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customers data...</p>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>{viewMode === 'customers' ? 'Customers' : 'Customer Feedback'}</h1>
        <div className="header-actions">
          <div className="view-mode-buttons">
            <button 
              className={`view-mode-btn ${viewMode === 'customers' ? 'active' : ''}`}
              onClick={() => setViewMode('customers')}
            >
              <Users size={20} />
              Customers
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'feedback' ? 'active' : ''}`}
              onClick={() => setViewMode('feedback')}
            >
              <MessageSquare size={20} />
              Feedback
            </button>
          </div>
          {viewMode === 'customers' && (
            <>
              <button 
                className="order-list-btn"
                onClick={() => navigate('/orders')}
              >
                <Package size={20} />
                Order List
              </button>
              <button 
                className="add-button"
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                <Plus size={20} />
                Add Customer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {viewMode === 'customers' && stats && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Customers</h3>
              <div className="stat-value">{stats.total_customers}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <UserCheck size={24} />
            </div>
            <div className="stat-info">
              <h3>Active Customers</h3>
              <div className="stat-value">{stats.active_customers}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>New This Month</h3>
              <div className="stat-value">{stats.new_this_month}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-info">
              <h3>With Orders</h3>
              <div className="stat-value">{stats.customers_with_orders}</div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Statistics Cards */}
      {viewMode === 'feedback' && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <MessageSquare size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Feedback</h3>
              <div className="stat-value">{customerFeedback.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-info">
              <h3>Average Rating</h3>
              <div className="stat-value">
                {customerFeedback.length > 0 
                  ? (customerFeedback.reduce((sum, feedback) => sum + feedback.rating, 0) / customerFeedback.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-info">
              <h3>5-Star Reviews</h3>
              <div className="stat-value">
                {customerFeedback.filter(feedback => feedback.rating === 5).length}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MessageSquare size={24} />
            </div>
            <div className="stat-info">
              <h3>This Month</h3>
              <div className="stat-value">
                {customerFeedback.filter(feedback => {
                  const feedbackDate = new Date(feedback.created_at);
                  const currentDate = new Date();
                  return feedbackDate.getMonth() === currentDate.getMonth() && 
                         feedbackDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-container">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder={viewMode === 'customers' ? "Search customers..." : "Search feedback..."}
            value={viewMode === 'customers' ? searchTerm : feedbackSearchTerm}
            onChange={(e) => viewMode === 'customers' ? setSearchTerm(e.target.value) : setFeedbackSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        {viewMode === 'customers' && (
          <>
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="items-per-page">
              <label>Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="items-select"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>items per page</span>
            </div>
          </>
        )}

        {viewMode === 'feedback' && (
          <div className="filter-buttons">
            <button 
              className={`filter-button ${selectedRating === null ? 'active' : ''}`}
              onClick={() => handleRatingFilter(null)}
            >
              All
            </button>
            <button 
              className={`filter-button ${selectedRating === 5 ? 'active' : ''}`}
              onClick={() => handleRatingFilter(5)}
            >
              <Star size={14} />
              5 Stars
            </button>
            <button 
              className={`filter-button ${selectedRating === 4 ? 'active' : ''}`}
              onClick={() => handleRatingFilter(4)}
            >
              <Star size={14} />
              4 Stars
            </button>
            <button 
              className={`filter-button ${selectedRating === 3 ? 'active' : ''}`}
              onClick={() => handleRatingFilter(3)}
            >
              <Star size={14} />
              3 Stars
            </button>
            <button 
              className={`filter-button ${selectedRating === 2 ? 'active' : ''}`}
              onClick={() => handleRatingFilter(2)}
            >
              <Star size={14} />
              2 Stars
            </button>
            <button 
              className={`filter-button ${selectedRating === 1 ? 'active' : ''}`}
              onClick={() => handleRatingFilter(1)}
            >
              <Star size={14} />
              1 Star
            </button>
          </div>
        )}
      </div>

      {/* Customers Table */}
      {viewMode === 'customers' && (
        <div className="table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="customer-code">{customer.customer_code}</td>
                  <td className="customer-name">
                    <div className="name-info">
                      <div className="full-name">
                        {customer.first_name} {customer.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="email">{customer.email || 'N/A'}</td>
                  <td className="phone">{customer.phone || 'N/A'}</td>
                  <td className="city">{customer.city || 'N/A'}</td>
                  <td className="status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(customer.is_active) }}
                    >
                      {getStatusText(customer.is_active)}
                    </span>
                  </td>
                  <td className="created-date">{formatDate(customer.created_at)}</td>
                  <td className="actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleViewCustomer(customer)}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditCustomer(customer)}
                      title="Edit Customer"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteCustomer(customer)}
                      title="Delete Customer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="empty-state">
              <p>No customers found.</p>
            </div>
          )}
        </div>
      )}

      {/* Customer Feedback Table */}
      {viewMode === 'feedback' && (
        <div className="table-container">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Feedback</th>
                <th>Rating</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customerFeedback.map((feedback) => (
                <tr key={feedback.id}>
                  <td className="customer-name">{feedback.full_name}</td>
                  <td className="email">{feedback.email}</td>
                  <td className="feedback-text">
                    <div className="feedback-preview">
                      {feedback.feedback.length > 100 
                        ? feedback.feedback.substring(0, 100) + '...'
                        : feedback.feedback
                      }
                    </div>
                  </td>
                  <td className="rating">
                    <div className="star-rating">
                      {[...Array(5)].map((_, index) => (
                        <Star 
                          key={index}
                          size={16}
                          className={`star ${index < feedback.rating ? 'filled' : ''}`}
                        />
                      ))}
                      <span className="rating-number">({feedback.rating})</span>
                    </div>
                  </td>
                  <td className="created-date">{formatDate(feedback.created_at)}</td>
                  <td className="actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleViewFeedback(feedback)}
                      title="View Full Feedback"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteFeedback(feedback.id)}
                      title="Delete Feedback"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customerFeedback.length === 0 && !feedbackLoading && (
            <div className="empty-state">
              <p>No customer feedback found.</p>
            </div>
          )}

          {feedbackLoading && (
            <div className="loading-state">
              <p>Loading feedback...</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} customers
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Customer</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleAddCustomer(); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      Active
                    </label>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="view-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Customer Code:</label>
                    <span>{selectedCustomer.customer_code}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{selectedCustomer.first_name} {selectedCustomer.last_name}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedCustomer.email || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>{formatDate(selectedCustomer.date_of_birth)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>City:</label>
                    <span>{selectedCustomer.city || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Country:</label>
                    <span>{selectedCustomer.country || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Status:</label>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedCustomer.is_active) }}
                    >
                      {getStatusText(selectedCustomer.is_active)}
                    </span>
                  </div>
                  
                  <div className="detail-item full-width">
                    <label>Address:</label>
                    <span>{selectedCustomer.address || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedCustomer.created_at)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{formatDate(selectedCustomer.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Customer</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateCustomer(); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      Active
                    </label>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Update Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Feedback View Modal */}
      {showFeedbackModal && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Feedback Details</h3>
              <button className="close-btn" onClick={() => setShowFeedbackModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="feedback-details">
                <div className="detail-row">
                  <label>Customer Name:</label>
                  <span>{selectedFeedback.full_name}</span>
                </div>
                
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedFeedback.email}</span>
                </div>
                
                <div className="detail-row">
                  <label>Rating:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= selectedFeedback.rating ? '#fbbf24' : 'none'}
                        stroke={star <= selectedFeedback.rating ? '#fbbf24' : '#e5e7eb'}
                      />
                    ))}
                    <span className="rating-text">({selectedFeedback.rating}/5)</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <label>Date:</label>
                  <span>{formatDate(selectedFeedback.created_at)}</span>
                </div>
                
                <div className="detail-row full-width">
                  <label>Feedback:</label>
                  <div className="feedback-content">
                    {selectedFeedback.feedback}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowFeedbackModal(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="delete-btn" 
                onClick={() => {
                  setShowFeedbackModal(false);
                  handleDeleteFeedback(selectedFeedback.id);
                }}
              >
                <Trash2 size={16} />
                Delete Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Orders Modal */}
    </div>
  );
};

export default Customers;
