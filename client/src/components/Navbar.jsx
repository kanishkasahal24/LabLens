import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
  GitCompare,
  User,
  LogOut,
  Users,
  UserCheck,
  Sparkles,
  LogIn,
  UserPlus,
  BookOpen,
  Menu,
  X
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isDoctor = user?.role === 'doctor';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';
    const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <header className="navbar" ref={navRef}>
      <div className="navbar-inner">
        <Link
          to="/"
          className="brand"
          aria-label="LabLens Home"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="brand-icon">
            <Activity size={22} />
          </div>
          <span>LabLens</span>
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated ? (
          <nav className="nav-links desktop-nav" aria-label="Main Navigation">
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

                <NavLink to="/compare" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <GitCompare size={18} />
                  <span>Compare</span>
                </NavLink>

                <NavLink to="/advisory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Sparkles size={18} />
                  <span>Advisory</span>
                </NavLink>

                <NavLink to="/guide" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <BookOpen size={18} />
                  <span>Guide</span>
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

                <NavLink to="/guide" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <BookOpen size={18} />
                  <span>Guide</span>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <User size={18} />
                  <span>Profile</span>
                </NavLink>
              </>
            )}
          </nav>
        ) : (
          <div className="guest-nav-desktop desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              <LogIn size={15} />
              <span>Log in</span>
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <UserPlus size={15} />
              <span>Get Started</span>
            </Link>
          </div>
        )}

        {/* Desktop User Section */}
        {isAuthenticated && (
          <div className="nav-user desktop-nav">
            <div className="user-badge">
              <div
                className="avatar-circle"
                style={{ backgroundColor: isDoctor ? 'var(--primary-teal)' : 'var(--deep-navy)' }}
              >
                {initials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>Hello, {firstName}</span>
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
        )}

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="navbar-mobile-toggle"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="navbar-mobile-menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="navbar-mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="navbar-mobile-menu"
            className="navbar-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {isAuthenticated ? (
              <>
                <div className="mobile-user-header">
                  <div
                    className="avatar-circle"
                    style={{ backgroundColor: isDoctor ? 'var(--primary-teal)' : 'var(--deep-navy)', width: '40px', height: '40px' }}
                  >
                    {initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Hello, {firstName}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {isDoctor ? `Doctor (${user.doctorCode || 'MD'})` : 'Patient Account'}
                    </span>
                  </div>
                </div>

                <nav className="mobile-nav-links" aria-label="Mobile Navigation">
                  {!isDoctor ? (
                    <>
                      <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                      </NavLink>

                      <NavLink
                        to="/add-report"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <PlusCircle size={20} />
                        <span>Add Report</span>
                      </NavLink>

                      <NavLink
                        to="/trends"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <TrendingUp size={20} />
                        <span>Trends</span>
                      </NavLink>

                      <NavLink
                        to="/compare"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <GitCompare size={20} />
                        <span>Compare Reports</span>
                      </NavLink>

                      <NavLink
                        to="/advisory"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Sparkles size={20} />
                        <span>Health Advisory</span>
                      </NavLink>

                      <NavLink
                        to="/guide"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BookOpen size={20} />
                        <span>Biomarker Guide</span>
                      </NavLink>

                      <NavLink
                        to="/profile"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User size={20} />
                        <span>Profile & Settings</span>
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/doctor"
                        end
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Users size={20} />
                        <span>Patient Roster</span>
                      </NavLink>

                      <NavLink
                        to="/doctor/requests"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserCheck size={20} />
                        <span>Link Requests</span>
                      </NavLink>

                      <NavLink
                        to="/guide"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BookOpen size={20} />
                        <span>Biomarker Guide</span>
                      </NavLink>

                      <NavLink
                        to="/profile"
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User size={20} />
                        <span>Doctor Profile</span>
                      </NavLink>
                    </>
                  )}
                </nav>

                <div className="mobile-logout-section">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-secondary mobile-logout-btn"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="mobile-guest-section">
                <p className="mobile-guest-text">
                  Take control of your health diagnostics. Track blood markers, monitor trends, and share records with your doctor.
                </p>
                <div className="mobile-guest-actions">
                  <Link
                    to="/login"
                    className="btn btn-secondary mobile-guest-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn size={18} />
                    <span>Log In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary mobile-guest-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus size={18} />
                    <span>Get Started Free</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;

