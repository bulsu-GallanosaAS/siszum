import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Clock, Users } from 'lucide-react';
import { apiClient as api } from '../services';
import './Refills.css';

interface RefillRequest {
  id: number;
  table_code: string;
  table_id: number;
  customer_id: number | null;
  status: string;
  request_type: string;
  price: number;
  requested_at: string;
  table_number: string;
  customer_name: string;
  elapsed_minutes: number;
}

interface RefillStats {
  total_requests: number;
  pending_requests: number;
  ongoing_requests: number;
  completed_requests: number;
}

const Refills: React.FC = () => {
  const [refills, setRefills] = useState<RefillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RefillStats>({
    total_requests: 0,
    pending_requests: 0,
    ongoing_requests: 0,
    completed_requests: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchRefills = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (debouncedSearchTerm) params.append('table_code', debouncedSearchTerm);

      const response = await api.get(`/refills?${params.toString()}`);
      
      if (response.data.success) {
        setRefills(response.data.data.refills);
        setTotalPages(response.data.data.pagination.totalPages);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching refill requests:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  useEffect(() => {
    fetchRefills();
  }, [fetchRefills]);

  const updateRefillStatus = async (id: number, status: string) => {
    try {
      await api.put(`/refills/${id}/status`, { status });
      fetchRefills(); 
    } catch (error) {
      console.error('Error updating refill status:', error);
    }
  };

  const formatElapsedTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'pending': 'status-pending',
      'in_progress': 'status-ongoing',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    
    const statusLabels = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status as keyof typeof statusClasses] || 'status-pending'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Loading refill requests</p>
      </div>
    );
  }

  return (
    <div className="refills-page">
      <div className="page-header">
        <h1>Refill Requests</h1>
        <div className="header-stats">
          <div className="stat-item">
            <Users size={16} />
            <span>Users Found: {stats.total_requests}</span>
            <button className="edit-btn">
              <Edit size={14} />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="controls-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by table code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Refills Table */}
      <div className="refills-table-section">
        <table className="refills-table">
          <thead>
            <tr>
              <th>Table Code</th>
              <th>Status</th>
              <th>Table Number</th>
              <th>Request</th>
              <th>Timer</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {refills.map((refill) => (
              <tr key={refill.id}>
                <td>
                  <div className="table-code">{refill.table_code}</div>
                </td>
                <td>
                  {getStatusBadge(refill.status)}
                </td>
                <td>
                  <div className="table-number">{refill.table_number}</div>
                </td>
                <td>
                  <div className="request-type">{refill.request_type}</div>
                </td>
                <td>
                  <div className="timer">
                    <Clock size={14} />
                    {formatElapsedTime(refill.elapsed_minutes)}
                  </div>
                </td>
                <td>
                  <div className="operation-buttons">
                    {refill.status === 'pending' && (
                      <>
                        <button
                          className="cancel-btn"
                          onClick={() => updateRefillStatus(refill.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                        <button
                          className="done-btn"
                          onClick={() => updateRefillStatus(refill.id, 'completed')}
                        >
                          Done
                        </button>
                      </>
                    )}
                    {refill.status === 'in_progress' && (
                      <>
                        <button
                          className="cancel-btn"
                          onClick={() => updateRefillStatus(refill.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                        <button
                          className="done-btn"
                          onClick={() => updateRefillStatus(refill.id, 'completed')}
                        >
                          Done
                        </button>
                      </>
                    )}
                    {(refill.status === 'completed' || refill.status === 'cancelled') && (
                      <span className="no-actions">No actions available</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {refills.length === 0 && (
          <div className="no-data">
            <p>No refill requests found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Refills;
