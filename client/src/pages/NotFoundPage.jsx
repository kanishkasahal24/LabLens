import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const NotFoundPage = () => {
  const { user, isAuthenticated } = useAuth();
  const homePath = isAuthenticated
    ? (user?.role === 'doctor' ? '/doctor' : '/dashboard')
    : '/';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-teal-light)',
        color: 'var(--primary-teal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <FileQuestion size={36} />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '440px', marginBottom: '28px', fontSize: '1rem' }}>
        The clinical page or record you are trying to access does not exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to={homePath} className="btn btn-primary">
          <Home size={18} />
          <span>Return Home</span>
        </Link>
        <button onClick={() => window.history.back()} className="btn btn-secondary">
          <ArrowLeft size={18} />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
