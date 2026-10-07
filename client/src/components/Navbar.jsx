import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, PlusCircle, TrendingUp, User, LogOut, Users, UserCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep Navbar hidden for unauthenticated users AND on the public landing page ("/")
  if (!isAuthenticated || location.pathname === '/') return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  const isDoctor = user?.role === 'doctor';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={isDoctor ? '/doctor' : '/dashboard'} className="brand">
          <div className="brand-icon">
            <Activity size={22} />
          </div>
          <span>LabLens</span>
        </Link>

        <nav className="nav-links">
          {!isDoctor ? (
            <>
              <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
            </>
          ) : (
            <>
              <NavLink to="/doctor" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>Patients</span>
              </NavLink>

              <NavLink to="/doctor/requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <UserCheck size={18} />
                <span>Requests</span>
              </NavLink>

              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <User size={18} />
                <span>Profile</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-user">
          <div className="user-badge">
            <div className="avatar-circle" style={{ backgroundColor: isDoctor ? 'var(--primary-teal)' : 'var(--deep-navy)' }}>
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {isDoctor ? `Doctor (${user.doctorCode || 'MD'})` : 'Patient'}
              </span>
            </div>
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
