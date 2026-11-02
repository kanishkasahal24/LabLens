import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, TrendingUp, Sparkles, LogIn, UserPlus } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const dashboardPath = isDoctor ? '/doctor' : '/dashboard';

  return (
    <div className="landing-page" style={{ padding: '20px 0 60px' }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          backgroundColor: 'var(--primary-teal-light)',
          color: 'var(--primary-teal)',
          fontWeight: 600,
          fontSize: '0.875rem',
          marginBottom: '20px'
        }}>
          <Sparkles size={16} />
          <span>Your blood reports, finally understood</span>
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: '16px'
        }}>
          Transform Complex Lab Tests Into Clear Health Insights
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: '32px'
        }}>
          Upload your blood reports, detect out-of-range biomarkers, track longitudinal trends,
          and securely share clinical analytics with your physician.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to={dashboardPath} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              <span>Go to {isDoctor ? 'Doctor Portal' : 'Patient Dashboard'}</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                <UserPlus size={18} />
                <span>Get Started Free</span>
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                <LogIn size={18} />
                <span>Log In</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
