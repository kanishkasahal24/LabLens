import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, UserPlus, LogIn, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const homePath = isDoctor ? '/doctor' : '/dashboard';

  return (
    <section className="landing-hero" aria-labelledby="hero-heading">
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={16} aria-hidden="true" />
          <span>Your blood reports, finally understood</span>
        </div>

        <h1 id="hero-heading" className="hero-title">
          Understand Your Biomarkers. <br />
          <span className="hero-title-highlight">Track Health Over Time.</span>
        </h1>

        <p className="hero-subtitle">
          LabLens bridges the gap between confusing clinical lab sheets and your personal health journey.
          Upload blood test PDFs, automatically extract biomarkers, visualize trends, and share secure reports with your doctor.
        </p>

        <div className="hero-cta-group">
          {isAuthenticated ? (
            <>
              <Link to={homePath} className="btn btn-primary btn-lg">
                <span>Go to {isDoctor ? 'Doctor Portal' : 'Patient Dashboard'}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              {!isDoctor && (
                <Link to="/add-report" className="btn btn-secondary btn-lg">
                  <Activity size={18} aria-hidden="true" />
                  <span>Add New Report</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                <UserPlus size={18} aria-hidden="true" />
                <span>Get Started Free</span>
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                <LogIn size={18} aria-hidden="true" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        <div className="hero-trust-bar">
          <div className="trust-item">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Private & Encrypted</span>
          </div>
          <div className="trust-item">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Automated PDF Parsing</span>
          </div>
          <div className="trust-item">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Standard Clinical Reference Intervals</span>
          </div>
        </div>
      </div>

      <div className="hero-visual" aria-label="Interactive Health Score and Vitals Preview">
        <div className="hero-visual-card">
          <div className="visual-card-header">
            <div>
              <span className="visual-card-tag">Latest Analysis</span>
              <h3 className="visual-card-title">Comprehensive Metabolic Panel</h3>
            </div>
            <span className="status-badge status-normal">
              <span className="status-badge-dot" />
              Analyzed
            </span>
          </div>

          <div className="score-ring-wrapper">
            <div className="score-ring-container">
              <svg className="score-ring-svg" viewBox="0 0 120 120" role="img" aria-label="Health Score: 86 out of 100">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="score-ring-track"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="score-ring-fill"
                  strokeDasharray="326.7"
                  strokeDashoffset="45.7"
                />
              </svg>
              <div className="score-ring-center">
                <span className="score-number">86</span>
                <span className="score-denom">/ 100</span>
                <span className="score-label">Health Score</span>
              </div>
            </div>

            <div className="score-summary">
              <div className="score-stat">
                <span className="stat-num text-success">18</span>
                <span className="stat-desc">Optimal Biomarkers</span>
              </div>
              <div className="score-stat">
                <span className="stat-num text-warning">2</span>
                <span className="stat-desc">Borderline / Attention</span>
              </div>
            </div>
          </div>

          <div className="mini-vitals-grid">
            <div className="mini-vital-chip normal">
              <div className="vital-header">
                <span className="vital-name">Hemoglobin</span>
                <span className="vital-val">14.2 g/dL</span>
              </div>
              <span className="vital-status normal">Optimal (13.5–17.5)</span>
            </div>

            <div className="mini-vital-chip normal">
              <div className="vital-header">
                <span className="vital-name">Fasting Glucose</span>
                <span className="vital-val">92 mg/dL</span>
              </div>
              <span className="vital-status normal">Normal (70–99)</span>
            </div>

            <div className="mini-vital-chip warning">
              <div className="vital-header">
                <span className="vital-name">Total Cholesterol</span>
                <span className="vital-val">218 mg/dL</span>
              </div>
              <span className="vital-status warning">Borderline High (&gt;200)</span>
            </div>

            <div className="mini-vital-chip normal">
              <div className="vital-header">
                <span className="vital-name">TSH (Thyroid)</span>
                <span className="vital-val">2.3 mIU/L</span>
              </div>
              <span className="vital-status normal">Normal (0.4–4.5)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
