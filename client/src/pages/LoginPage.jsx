import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, AlertCircle, ArrowRight, User, Stethoscope } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const user = await login(email, password);
      if (user.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoPatientLogin = async () => {
    setEmail('john@example.com');
    setPassword('Password123!');
    setServerError('');
    setFieldErrors({});

    try {
      setIsSubmitting(true);
      await login('john@example.com', 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Patient demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoDoctorLogin = async () => {
    setEmail('dr.jenkins@lablens.com');
    setPassword('Password123!');
    setServerError('');
    setFieldErrors({});

    try {
      setIsSubmitting(true);
      await login('dr.jenkins@lablens.com', 'Password123!');
      navigate('/doctor');
    } catch (err) {
      setServerError(err.message || 'Doctor demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <Activity size={28} />
            <span>LabLens</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Patient & Doctor Portal Sign In
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Access clinical biomarker history and report analysis
          </p>
        </div>

        {serverError && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && <p className="form-error">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Instant Demo Account Access:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDemoPatientLogin}
              disabled={isSubmitting}
              style={{ justifyContent: 'center', backgroundColor: '#F8FAFC' }}
            >
              <User size={14} />
              <span>Demo Patient</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDemoDoctorLogin}
              disabled={isSubmitting}
              style={{ justifyContent: 'center', backgroundColor: '#F8FAFC' }}
            >
              <Stethoscope size={14} />
              <span>Demo Doctor</span>
            </button>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Register new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
