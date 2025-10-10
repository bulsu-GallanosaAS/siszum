import React, { useState, useEffect } from "react";
import {
  Clock,
  User,
  Square,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiClient as api } from "../services";
import "./CustomerTimer.css";

interface Timer {
  id: number;
  customer_name: string;
  table_id: number;
  order_id: number | null;
  start_time: string;
  end_time: string | null;
  elapsed_seconds: number;
  current_elapsed_seconds: number;
  is_active: boolean;
  table_number: string;
  table_code: string;
  order_code: string | null;
  timer_status: "active" | "warning" | "expired" | "completed";
}

interface TimerStats {
  total_timers: number;
  active_timers: number;
  expired_timers: number;
  warning_timers: number;
}

interface NewTimer {
  customer_name: string;
  table_id: number;
  order_id?: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const CustomerTimer: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TimerStats>({
    total_timers: 0,
    active_timers: 0,
    expired_timers: 0,
    warning_timers: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTimer, setNewTimer] = useState<NewTimer>({
    customer_name: "",
    table_id: 0,
  });
  const [availableTables, setAvailableTables] = useState<
    { id: number; table_number: string }[]
  >([]);

  // Pagination state - fixed to 10 items per page
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
  });

  const fetchTimers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/timers?page=${page}&limit=9`);

      if (response.data.success) {
        setTimers(response.data.data.timers);
        setStats(response.data.data.stats);

        // Update pagination data from backend response
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      } else {
        console.log("timers: ", response);
      }
    } catch (error) {
      console.error("Error fetching timers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      const response = await api.get("/tables?status=available");
      if (response.data.success) {
        setAvailableTables(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching available tables:", error);
    }
  };

  useEffect(() => {
    fetchTimers();
    fetchAvailableTables();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((timer) => {
          if (timer.is_active) {
            if (timer.current_elapsed_seconds < 7200) {
              return {
                ...timer,
                current_elapsed_seconds: timer.current_elapsed_seconds + 1,
              };
            } else if (
              timer.current_elapsed_seconds === 7200 &&
              timer.is_active
            ) {
              stopTimerWhenExpired(timer.id);
              return {
                ...timer,
                is_active: false,
                timer_status: "expired",
                current_elapsed_seconds: 7200,
              };
            } else {
              return {
                ...timer,
                timer_status: "expired",
                is_active: false,
                current_elapsed_seconds: 7200,
              };
            }
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchTimers(pagination.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      fetchTimers(pagination.currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTimers(page);
    }
  };

  const createTimer = async () => {
    try {
      if (!newTimer.customer_name || !newTimer.table_id) {
        alert("Please fill in all required fields");
        return;
      }

      await api.post("/timers", newTimer);
      setShowAddForm(false);
      setNewTimer({ customer_name: "", table_id: 0 });
      fetchTimers(pagination.currentPage);
      fetchAvailableTables();
    } catch (error) {
      console.error("Error creating timer:", error);
      alert("Failed to create timer");
    }
  };

  const stopTimer = async (id: number) => {
    try {
      await api.put(`/timers/${id}/stop`);
      fetchTimers(pagination.currentPage);
      fetchAvailableTables();
    } catch (error) {
      console.error("Error stopping timer:", error);
      alert("Failed to stop timer");
    }
  };

  const stopTimerWhenExpired = async (timerId: number) => {
    try {
      await api.put(`/timers/${timerId}/stop`);
      console.log(`Timer ${timerId} stopped after 2 hours.`);
    } catch (error) {
      console.error(`Failed to stop timer ${timerId}:`, error);
    }
  };

  const deleteTimer = async (id: number) => {
    try {
      if (window.confirm("Are you sure you want to delete this timer?")) {
        await api.delete(`/timers/${id}`);

        if (timers.length === 1 && pagination.currentPage > 1) {
          fetchTimers(pagination.currentPage - 1);
        } else {
          fetchTimers(pagination.currentPage);
        }

        fetchAvailableTables();
      }
    } catch (error) {
      console.error("Error deleting timer:", error);
      alert("Failed to delete timer");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimerColor = (status: string) => {
    switch (status) {
      case "expired":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "active":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getTimeRemaining = (elapsedSeconds: number) => {
    const twoHours = 2 * 60 * 60;
    const remaining = twoHours - elapsedSeconds;

    if (remaining <= 0) {
      return "EXPIRED";
    }

    return formatTime(remaining);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Loading timers</p>
      </div>
    );
  }

  return (
    <div className="timer-page">
      <div className="page-header">
        <h1>Customer Timers</h1>
        <div className="header-actions">
          <button
            className="add-timer-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} />
            Add Timer
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon active">
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <h3>Active Timers</h3>
            <p className="stat-value">{stats.active_timers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <h3>Warning (1.5h+)</h3>
            <p className="stat-value">{stats.warning_timers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expired">
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <h3>Expired (2h+)</h3>
            <p className="stat-value">{stats.expired_timers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">
            <User size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Today</h3>
            <p className="stat-value">{stats.total_timers}</p>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="add-timer-form">
          <h3>Add New Timer</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Customer Name"
              value={newTimer.customer_name}
              onChange={(e) =>
                setNewTimer((prev) => ({
                  ...prev,
                  customer_name: e.target.value,
                }))
              }
              className="form-input"
            />
            <select
              value={newTimer.table_id}
              onChange={(e) =>
                setNewTimer((prev) => ({
                  ...prev,
                  table_id: Number(e.target.value),
                }))
              }
              className="form-select"
            >
              <option value={0}>Select Table</option>
              {availableTables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.table_number}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button onClick={createTimer} className="create-btn">
                Create
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="timers-grid">
        {timers.map((timer) => (
          <div
            key={timer.id}
            className={`timer-card ${timer.timer_status}`}
            style={{ borderColor: getTimerColor(timer.timer_status) }}
          >
            <div className="timer-header">
              <div className="customer-info">
                <User size={16} />
                <span className="customer-name">{timer.customer_name}</span>
              </div>
              <div className="table-info">Table {timer.table_number}</div>
            </div>

            <div className="timer-display">
              <div className="elapsed-time">
                <Clock size={20} />
                <span className="time">
                  {formatTime(timer.current_elapsed_seconds)}
                </span>
              </div>
              <div className="remaining-time">
                <span className="label">Remaining:</span>
                <span
                  className="time"
                  style={{ color: getTimerColor(timer.timer_status) }}
                >
                  {getTimeRemaining(timer.current_elapsed_seconds)}
                </span>
              </div>
            </div>

            <div className="timer-status">
              <span
                className={`status-badge ${timer.timer_status}`}
                style={{ backgroundColor: getTimerColor(timer.timer_status) }}
              >
                {timer.timer_status.charAt(0).toUpperCase() +
                  timer.timer_status.slice(1)}
              </span>
            </div>

            <div className="timer-actions">
              {!!timer.is_active && (
                <button
                  onClick={() => stopTimer(timer.id)}
                  className="stop-btn"
                >
                  <Square size={14} />
                  Stop
                </button>
              )}
              <button
                onClick={() => deleteTimer(timer.id)}
                className="delete-btn"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>

            <div className="timer-start">
              Started:{" "}
              {new Date(timer.start_time).toLocaleString("en-PH", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}

      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>

          <div className="pagination-controls">
            <button
              onClick={handlePrevPage}
              disabled={pagination.currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="pagination-controls">
              {generatePageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-btn ${
                    page === pagination.currentPage ? "active" : ""
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="pagination-btn"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {timers.length === 0 && (
        <div className="no-timers">
          <Clock size={48} />
          <h3>No Active Timers</h3>
          <p>Click "Add Timer" to start tracking customer dining time</p>
        </div>
      )}
    </div>
  );
};

export default CustomerTimer;
