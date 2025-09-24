import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, Phone, MapPin, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import './Reservations.css';

interface Reservation {
  id: number;
  reservation_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  table_id: number;
  table_number: string;
  occasion?: string;
  number_of_guests: number;
  reservation_date: string;
  reservation_time: string;
  duration_hours: number;
  payment_amount: number | string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'table'>('grid');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [editForm, setEditForm] = useState<Partial<Reservation>>({});
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    table_id: 1,
    number_of_guests: 2,
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '18:00'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchReservations();

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/reservations');
      if (response.data.success) {
        setReservations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId: number, newStatus: string) => {
    try {
      const response = await apiClient.put(`/reservations/${reservationId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        fetchReservations();
      }
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const createReservation = async () => {
    try {
      const response = await apiClient.post('/reservations', form);
      if (response.data.success) {
        setShowCreate(false);
        await fetchReservations();
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation');
    }
  };

  const handleView = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowView(true);
  };

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditForm({
      customer_name: reservation.customer_name,
      phone: reservation.phone,
      email: reservation.email || '',
      table_id: reservation.table_id,
      occasion: reservation.occasion || '',
      number_of_guests: reservation.number_of_guests,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      duration_hours: reservation.duration_hours,
      payment_amount: reservation.payment_amount,
      notes: reservation.notes || ''
    });
    setShowEdit(true);
  };

  const handleDelete = async (reservationId: number) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        const response = await apiClient.delete(`/reservations/${reservationId}`);
        if (response.data.success) {
          await fetchReservations();
        }
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Failed to delete reservation');
      }
    }
  };

  const updateReservation = async () => {
    if (!selectedReservation) return;

    try {
      const response = await apiClient.put(`/reservations/${selectedReservation.id}`, editForm);
      if (response.data.success) {
        setShowEdit(false);
        setSelectedReservation(null);
        setEditForm({});
        await fetchReservations();
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Failed to update reservation');
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount || '0');
    return `₱${numAmount.toFixed(2)}`;
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         reservation.phone.includes(debouncedSearch) ||
                         reservation.reservation_code.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;

    const matchesDate = viewMode === 'table' ? true : true;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const renderGridView = () => (
    <div className="reservations-grid">
      {filteredReservations.map((reservation) => (
        <div key={reservation.id} className="reservation-card">
          <div className="reservation-header">
            <div className="customer-avatar">
              <span>{reservation.customer_name.charAt(0)}</span>
            </div>
            <div className="customer-info">
              <h3>{reservation.customer_name}</h3>
              <p>{formatDate(reservation.reservation_date)}</p>
              <p>{formatTime(reservation.reservation_time)} - {formatTime(`${parseInt(reservation.reservation_time.split(':')[0]) + reservation.duration_hours}:${reservation.reservation_time.split(':')[1]}:00`)}</p>
            </div>
            <div className="reservation-actions">
              <button 
                className={`status-btn ${reservation.status}`}
                onClick={() => handleStatusUpdate(reservation.id, reservation.status === 'pending' ? 'confirmed' : 'pending')}
              >
                {reservation.status === 'confirmed' ? 'CONFIRMED' : 'CONFIRM'}
              </button>
            </div>
          </div>
          <div className="reservation-details">
            <div className="detail-item">
              <Users size={16} />
              <span>{reservation.number_of_guests} guests</span>
            </div>
            <div className="detail-item">
              <MapPin size={16} />
              <span>Table {reservation.table_number}</span>
            </div>
            <div className="detail-item">
              <Phone size={16} />
              <span>{reservation.phone}</span>
            </div>
            {reservation.occasion && (
              <div className="detail-item">
                <span>Occasion: {reservation.occasion}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalendarView = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    console.log('Total reservations:', reservations.length);
    console.log('Filtered reservations:', filteredReservations.length);
    console.log('First few reservations:', reservations.slice(0, 3));

    const calendarDays = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dayReservations = reservations.filter(r => {
        const reservationDate = new Date(r.reservation_date);
        const formattedReservationDate = `${reservationDate.getFullYear()}-${String(reservationDate.getMonth() + 1).padStart(2, '0')}-${String(reservationDate.getDate()).padStart(2, '0')}`;
        return formattedReservationDate === date;
      });

      calendarDays.push(
        <div key={day} className={`calendar-day ${date === selectedDate ? 'selected' : ''} ${dayReservations.length > 0 ? 'has-reservations' : ''}`}>
          <span className="day-number">{day}</span>
          {dayReservations.map((reservation, index) => (
            <div key={index} className="calendar-reservation" style={{ backgroundColor: getStatusColor(reservation.status) }}>
              <span className="reservation-customer">{reservation.customer_name}</span>
              <span className="reservation-time">{formatTime(reservation.reservation_time)}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="calendar-view-container">
        <div className="customer-list-container">
          <div className="customer-list-header">
            <h3>Customer</h3>
          </div>
          <div className="customer-list">
            {filteredReservations.length > 0 ? filteredReservations.map((reservation) => (
              <div key={reservation.id} className="customer-item">
                <div className="customer-avatar">
                  <span>{reservation.customer_name.charAt(0)}</span>
                </div>
                <div className="customer-details">
                  <h4>{reservation.customer_name}</h4>
                  <p className="customer-date">Today {formatTime(reservation.reservation_time)}</p>
                  <p className="customer-address">{reservation.table_number ? `Table ${reservation.table_number}` : 'No table assigned'}</p>
                </div>
                <div className="customer-actions">
                  <button 
                    className={`status-btn ${reservation.status}`}
                    onClick={() => handleStatusUpdate(reservation.id, reservation.status === 'pending' ? 'confirmed' : 'pending')}
                  >
                    {reservation.status === 'confirmed' ? 'Done' : 'Confirm'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="no-customers">
                <p>No reservations found</p>
              </div>
            )}
          </div>
          {filteredReservations.length > 4 && (
            <div className="see-more">
              <button className="see-more-btn">See More</button>
            </div>
          )}
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <h3>{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <div className="calendar-nav">
              <button>&lt;</button>
              <button>&gt;</button>
            </div>
          </div>
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDays}
          </div>
        </div>
      </div>
    );
  };

  const renderTableView = () => (
    <div className="reservations-table-container">
      <div className="table-header">
        <h3>Total Reservations: {filteredReservations.length}</h3>
      </div>
      <div className="table-wrapper">
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Occasion</th>
              <th>Number of Guest</th>
              <th>Reservation Payment</th>
              <th>Time</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.reservation_code}</td>
                <td>{reservation.customer_name}</td>
                <td>{reservation.phone}</td>
                <td>{reservation.email || '-'}</td>
                <td>{reservation.occasion || '-'}</td>
                <td>{reservation.number_of_guests}</td>
                <td>{formatCurrency(reservation.payment_amount)}</td>
                <td>{formatTime(reservation.reservation_time)}</td>
                <td>{formatDate(reservation.reservation_date)}</td>
                <td>
                  <span className={`status-badge ${reservation.status}`}>
                    {reservation.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view" 
                      title="View"
                      onClick={() => handleView(reservation)}
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="action-btn edit" 
                      title="Edit"
                      onClick={() => handleEdit(reservation)}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="action-btn delete" 
                      title="Delete"
                      onClick={() => handleDelete(reservation.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredReservations.length === 0 && (
        <div className="empty-state">
          <CalendarIcon size={48} />
          <p>No reservations found</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="reservations-page">
      <div className="page-header">
        <h1>Reservations</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
    {}
        </div>
      </div>

      <div className="view-controls">
        <div className="view-mode-buttons">
          <button 
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon size={20} />
            Calendar
          </button>
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
          <button 
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Reservation List
          </button>
        </div>
        {viewMode === 'calendar' && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        )}
      </div>

      <div className="reservations-content">
        {viewMode === 'calendar' && renderCalendarView()}
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'table' && renderTableView()}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Reservation</h3>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input 
                    type="text"
                    value={form.customer_name} 
                    onChange={(e) => setForm({...form, customer_name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel"
                    value={form.phone} 
                    onChange={(e) => setForm({...form, phone: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Table ID</label>
                  <input 
                    type="number"
                    value={form.table_id} 
                    onChange={(e) => setForm({...form, table_id: Number(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>Number of Guests</label>
                  <input 
                    type="number"
                    value={form.number_of_guests} 
                    onChange={(e) => setForm({...form, number_of_guests: Number(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>Reservation Date</label>
                  <input 
                    type="date"
                    value={form.reservation_date} 
                    onChange={(e) => setForm({...form, reservation_date: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Reservation Time</label>
                  <input 
                    type="time"
                    value={form.reservation_time} 
                    onChange={(e) => setForm({...form, reservation_time: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={createReservation}>Save</button>
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showView && selectedReservation && (
        <div className="modal-overlay" onClick={() => setShowView(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reservation Details</h3>
            </div>
            <div className="modal-content">
              <div className="detail-grid">
                <div className="detail-item-large">
                  <span className="detail-label">Reservation Code</span>
                  <span className="detail-value">{selectedReservation.reservation_code}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Customer Name</span>
                  <span className="detail-value">{selectedReservation.customer_name}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedReservation.phone}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedReservation.email || 'Not provided'}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Table</span>
                  <span className="detail-value">Table {selectedReservation.table_number}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Number of Guests</span>
                  <span className="detail-value">{selectedReservation.number_of_guests}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Occasion</span>
                  <span className="detail-value">{selectedReservation.occasion || 'Not specified'}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatDate(selectedReservation.reservation_date)}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{formatTime(selectedReservation.reservation_time)}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{selectedReservation.duration_hours} hours</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Payment Amount</span>
                  <span className="detail-value">{formatCurrency(selectedReservation.payment_amount)}</span>
                </div>
                <div className="detail-item-large">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status ${selectedReservation.status}`}>
                    {selectedReservation.status}
                  </span>
                </div>
              </div>
              {selectedReservation.notes && (
                <div className="form-group">
                  <label>Notes</label>
                  <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px', color: '#374151' }}>
                    {selectedReservation.notes}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowView(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && selectedReservation && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Reservation</h3>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input 
                    type="text"
                    value={editForm.customer_name || ''} 
                    onChange={(e) => setEditForm({...editForm, customer_name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel"
                    value={editForm.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email"
                    value={editForm.email || ''} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Table ID</label>
                  <input 
                    type="number"
                    value={editForm.table_id || ''} 
                    onChange={(e) => setEditForm({...editForm, table_id: Number(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>Occasion</label>
                  <input 
                    type="text"
                    value={editForm.occasion || ''} 
                    onChange={(e) => setEditForm({...editForm, occasion: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Number of Guests</label>
                  <input 
                    type="number"
                    value={editForm.number_of_guests || ''} 
                    onChange={(e) => setEditForm({...editForm, number_of_guests: Number(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>Reservation Date</label>
                  <input 
                    type="date"
                    value={editForm.reservation_date || ''} 
                    onChange={(e) => setEditForm({...editForm, reservation_date: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Reservation Time</label>
                  <input 
                    type="time"
                    value={editForm.reservation_time || ''} 
                    onChange={(e) => setEditForm({...editForm, reservation_time: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Duration (hours)</label>
                  <input 
                    type="number"
                    value={editForm.duration_hours || ''} 
                    onChange={(e) => setEditForm({...editForm, duration_hours: Number(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>Payment Amount</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editForm.payment_amount || ''} 
                    onChange={(e) => setEditForm({...editForm, payment_amount: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  value={editForm.notes || ''} 
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  placeholder="Add any special notes for this reservation..."
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={updateReservation}>Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
