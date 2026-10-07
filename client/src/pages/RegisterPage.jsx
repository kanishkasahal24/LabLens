import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, AlertCircle, UserPlus, Stethoscope, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'doctor' || r === 'patient') {
      setRole(r);
    }
  }, [searchParams]);

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (role === 'doctor' && !licenseNumber.trim()) {
      errors.licenseNumber = 'Medical license number is required for doctors';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const user = await register(name, email, password, role, licenseNumber);
      if (user.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-brand">
            <Activity size={28} />
            <span>LabLens</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Select your account type to get started
          </p>
        </div>

        {serverError && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">I am registering as a:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              className={`btn ${role === 'patient' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('patient')}
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              <User size={18} />
              <span>Patient</span>
            </button>
            <button
              type="button"
              className={`btn ${role === 'doctor' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('doctor')}
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              <Stethoscope size={18} />
              <span>Doctor</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'John Doe'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
          </div>

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

          {role === 'doctor' && (
            <div className="form-group">
              <label className="form-label" htmlFor="licenseNumber">Medical License Number</label>
              <input
                id="licenseNumber"
                type="text"
                className="form-input"
                placeholder="e.g. MD-98765"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
              {fieldErrors.licenseNumber && <p className="form-error">{fieldErrors.licenseNumber}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && <p className="form-error">{fieldErrors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword && <p className="form-error">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : `Register as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}
            <UserPlus size={18} />
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
