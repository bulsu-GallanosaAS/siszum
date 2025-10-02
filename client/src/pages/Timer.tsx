import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, AlertTriangle, Users, Plus, X } from 'lucide-react';
import './Timer.css';
import { apiClient } from '../services/apiClient';

interface Timer {
  id: number;
  table_number: string;
  customer_name: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  status: 'active' | 'paused' | 'completed' | 'overtime';
  remaining_minutes: number;
}

interface NewTimerData {
  table_number: string;
  customer_name: string;
}

const TimerPage: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTimer, setNewTimer] = useState<NewTimerData>({
    table_number: '',
    customer_name: ''
  });

  const TIME_LIMIT_MINUTES = 120;

  useEffect(() => {
    fetchTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTimers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/timers');
      if (response.data.success) {
        setTimers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching timers:', error);

      // Mock data for development
      const mockTimers: Timer[] = [
        {
          id: 1,
          table_number: 'T001',
          customer_name: 'John Doe',
          start_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          duration_minutes: 45,
          status: 'active',
          remaining_minutes: 75
        },
        {
          id: 2,
          table_number: 'T003',
          customer_name: 'Jane Smith',
          start_time: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          duration_minutes: 90,
          status: 'active',
          remaining_minutes: 30
        },
        {
          id: 3,
          table_number: 'T005',
          customer_name: 'Mike Johnson',
          start_time: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
          duration_minutes: 130,
          status: 'overtime',
          remaining_minutes: -10
        }
      ];
      setTimers(mockTimers);
    } finally {
      setLoading(false);
    }
  };

  const updateTimers = () => {
    setTimers(prevTimers => 
      prevTimers.map(timer => {
        if (timer.status === 'active' || timer.status === 'overtime') {
          const startTime = new Date(timer.start_time).getTime();
          const currentTime = Date.now();
          const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
          const remainingMinutes = TIME_LIMIT_MINUTES - elapsedMinutes;

          return {
            ...timer,
            duration_minutes: elapsedMinutes,
            remaining_minutes: remainingMinutes,
            status: remainingMinutes <= 0 ? 'overtime' : timer.status
          };
        }
        return timer;
      })
    );
  };

  const startTimer = async (timerId: number) => {
    try {
      const response = await apiClient.patch(`/timers/${timerId}/start`);
      if (response.data.success) {
        await fetchTimers();
      }
    } catch (error) {
      console.error('Error starting timer:', error);

      setTimers(prev => prev.map(timer => 
        timer.id === timerId 
          ? { ...timer, status: 'active', start_time: new Date().toISOString() }
          : timer
      ));
    }
  };

  const pauseTimer = async (timerId: number) => {
    try {
      const response = await apiClient.patch(`/timers/${timerId}/pause`);
      if (response.data.success) {
        await fetchTimers();
      }
    } catch (error) {
      console.error('Error pausing timer:', error);

      setTimers(prev => prev.map(timer => 
        timer.id === timerId ? { ...timer, status: 'paused' } : timer
      ));
    }
  };

  const stopTimer = async (timerId: number) => {
    try {
      const response = await apiClient.patch(`/timers/${timerId}/stop`);
      if (response.data.success) {
        await fetchTimers();
      }
    } catch (error) {
      console.error('Error stopping timer:', error);

      setTimers(prev => prev.map(timer => 
        timer.id === timerId 
          ? { ...timer, status: 'completed', end_time: new Date().toISOString() }
          : timer
      ));
    }
  };

  const addNewTimer = async () => {
    if (!newTimer.table_number || !newTimer.customer_name) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Try to find the table ID
      let tableId = 1;
      try {
        const tablesResponse = await apiClient.get('/tables');
        if (tablesResponse.data.success) {
          const existingTable = tablesResponse.data.data.find(
            (table: any) => table.table_number === newTimer.table_number || table.table_code === newTimer.table_number
          );
          if (existingTable) {
            tableId = existingTable.id;
          }
        }
      } catch (tableError) {
        console.warn('Could not fetch tables, using default table ID');
      }

      const timerData = {
        customer_name: newTimer.customer_name,
        table_id: tableId,
        order_id: null
      };

      const response = await apiClient.post('/timers', timerData);
      if (response.data.success) {
        await fetchTimers();
        setNewTimer({ table_number: '', customer_name: '' });
        setShowAddModal(false);
        alert('Timer started successfully!');
      }
    } catch (error) {
      console.error('Error adding timer:', error);
      alert('Failed to start timer. Please check if the table is available.');

      const mockNewTimer: Timer = {
        id: Date.now(),
        table_number: newTimer.table_number,
        customer_name: newTimer.customer_name,
        start_time: new Date().toISOString(),
        duration_minutes: 0,
        status: 'active',
        remaining_minutes: TIME_LIMIT_MINUTES
      };
      setTimers(prev => [...prev, mockNewTimer]);
      setNewTimer({ table_number: '', customer_name: '' });
      setShowAddModal(false);
    }
  };

  const formatTime = (minutes: number) => {
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getTimerStatus = (timer: Timer) => {
    if (timer.status === 'completed') return 'completed';
    if (timer.status === 'paused') return 'paused';
    if (timer.remaining_minutes <= 0) return 'overtime';
    if (timer.remaining_minutes <= 15) return 'warning';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overtime': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'paused': return '#6b7280';
      case 'completed': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getActiveTimersCount = () => {
    return timers.filter(timer => timer.status === 'active' || timer.status === 'overtime').length;
  };

  const getOvertimeTimersCount = () => {
    return timers.filter(timer => timer.status === 'overtime').length;
  };

  if (loading) {
    return <div className="timer-loading">Loading timers...</div>;
  }

  return (
    <div className="timer-container">
      <div className="timer-header">
        <div className="header-content">
          <h1>
            <Clock size={28} />
            Customer Timers
          </h1>
          <div className="timer-stats">
            <div className="stat-card">
              <Users size={20} />
              <div>
                <span className="stat-number">{getActiveTimersCount()}</span>
                <span className="stat-label">Active Tables</span>
              </div>
            </div>
            <div className="stat-card overtime">
              <AlertTriangle size={20} />
              <div>
                <span className="stat-number">{getOvertimeTimersCount()}</span>
                <span className="stat-label">Overtime</span>
              </div>
            </div>
          </div>
        </div>
        <button
          className="add-timer-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          New Timer
        </button>
      </div>

      <div className="timer-content">
        <div className="timer-grid">
          {timers.map(timer => {
            const status = getTimerStatus(timer);
            const statusColor = getStatusColor(status);

            return (
              <div key={timer.id} className={`timer-card ${status}`}>
                <div className="timer-card-header">
                  <div className="table-info">
                    <span className="table-number">{timer.table_number}</span>
                    <span className="customer-name">{timer.customer_name}</span>
                  </div>
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: statusColor }}
                  >
                    {status === 'overtime' && <AlertTriangle size={16} />}
                    {status === 'paused' && <Pause size={16} />}
                    {status === 'completed' && <Square size={16} />}
                    {(status === 'active' || status === 'warning') && <Clock size={16} />}
                  </div>
                </div>

                <div className="timer-display">
                  <div className="time-info">
                    <div className="elapsed-time">
                      <span className="time-label">Elapsed</span>
                      <span className="time-value">
                        {formatTime(timer.duration_minutes)}
                      </span>
                    </div>
                    <div className="remaining-time">
                      <span className="time-label">
                        {timer.remaining_minutes < 0 ? 'Overtime' : 'Remaining'}
                      </span>
                      <span 
                        className="time-value"
                        style={{ color: timer.remaining_minutes <= 0 ? '#dc2626' : statusColor }}
                      >
                        {formatTime(timer.remaining_minutes)}
                      </span>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${Math.min(100, (timer.duration_minutes / TIME_LIMIT_MINUTES) * 100)}%`,
                        backgroundColor: statusColor
                      }}
                    />
                  </div>
                </div>

                <div className="timer-controls">
                  {timer.status === 'active' && (
                    <>
                      <button
                        className="control-btn pause"
                        onClick={() => pauseTimer(timer.id)}
                      >
                        <Pause size={16} />
                        Pause
                      </button>
                      <button
                        className="control-btn stop"
                        onClick={() => stopTimer(timer.id)}
                      >
                        <Square size={16} />
                        Stop
                      </button>
                    </>
                  )}

                  {timer.status === 'paused' && (
                    <>
                      <button
                        className="control-btn start"
                        onClick={() => startTimer(timer.id)}
                      >
                        <Play size={16} />
                        Resume
                      </button>
                      <button
                        className="control-btn stop"
                        onClick={() => stopTimer(timer.id)}
                      >
                        <Square size={16} />
                        Stop
                      </button>
                    </>
                  )}

                  {timer.status === 'overtime' && (
                    <button
                      className="control-btn stop urgent"
                      onClick={() => stopTimer(timer.id)}
                    >
                      <Square size={16} />
                      End Session
                    </button>
                  )}

                  {timer.status === 'completed' && (
                    <div className="completed-message">
                      Session Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {timers.length === 0 && (
          <div className="empty-state">
            <Clock size={64} />
            <h3>No Active Timers</h3>
            <p>Start a new timer for your customers</p>
            <button
              className="add-timer-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={20} />
              Add First Timer
            </button>
          </div>
        )}
      </div>

      {}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-timer-modal">
            <div className="modal-header">
              <h2>Start New Timer</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Table Number</label>
                <input
                  type="text"
                  value={newTimer.table_number}
                  onChange={(e) => setNewTimer({
                    ...newTimer,
                    table_number: e.target.value
                  })}
                  placeholder="e.g., T001, Table 5"
                />
              </div>

              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={newTimer.customer_name}
                  onChange={(e) => setNewTimer({
                    ...newTimer,
                    customer_name: e.target.value
                  })}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="time-limit-info">
                <Clock size={20} />
                <span>Time Limit: 2 hours per customer</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={addNewTimer}
              >
                Start Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerPage;
