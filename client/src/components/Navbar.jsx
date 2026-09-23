import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, PlusCircle, TrendingUp, User, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Activity size={22} />
          </div>
          <span>LabLens</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/add-report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={18} />
            <span>Add Report</span>
          </NavLink>

          <NavLink to="/trends" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <TrendingUp size={18} />
            <span>Trends</span>
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="nav-user">
          <div className="user-badge">
            <div className="avatar-circle">{initials}</div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            title="Sign out of account"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
