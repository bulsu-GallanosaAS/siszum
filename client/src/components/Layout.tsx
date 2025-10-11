import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Calendar, 
  Package, 
  Users, 
  CreditCard, 
  RefreshCw, 
  ShoppingCart, 
  Receipt, 
  Timer, 
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Menu
} from 'lucide-react';
import './Layout.css';
import logoSiszum from '../images/logo.png';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on ESC and lock body scroll when open
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    if (isSidebarOpen) {
      document.addEventListener('keydown', onKeyDown);
      // lock scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = prev;
      };
    }
  }, [isSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/reservations', icon: Calendar, label: 'Reservations' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/refills', icon: RefreshCw, label: 'Refills' },
    { path: '/pos', icon: ShoppingCart, label: 'POS' },
    { path: '/orders', icon: Receipt, label: 'Orders' },
    { path: '/timers', icon: Timer, label: 'Timers' },
  ];

  return (
    <div className="layout">
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />
      {/* Sidebar */}
  <aside id="sidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-header">
          <img src={logoSiszum} alt="SISZUM Gyupsal Logo" className="sidebar-logo" style={{ width: '154px', height: '154px', borderRadius: '8px' }} />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {/* Footer content can be added here if needed */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            {/* Mobile menu toggle */}
            <button
              className="menu-toggle"
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
              aria-controls="sidebar"
              onClick={() => setIsSidebarOpen((v) => !v)}
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="header-right">
            <div className="country-selector">
              <span>🇵🇭</span>
              <span>Philippines</span>
            </div>
            
            {/* Profile Dropdown */}
            <div className="profile-section" ref={profileRef}>
              <div 
                className="profile-trigger" 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="profile-avatar-small">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.first_name} />
                  ) : (
                    <div className="avatar-placeholder-small">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="profile-info-small">
                  <span className="profile-name">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || 'User'
                    }
                  </span>
                  <span className="profile-role">{user?.role}</span>
                </div>
                {showProfileDropdown ? (
                  <ChevronUp size={16} className="dropdown-arrow" />
                ) : (
                  <ChevronDown size={16} className="dropdown-arrow" />
                )}
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <User size={16} />
                    <span>View Profile</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
