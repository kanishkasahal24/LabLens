import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, ArrowRight, HeartHandshake } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const LandingFooter = () => {
  const { user, isAuthenticated } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const ctaPath = isAuthenticated ? (isDoctor ? '/doctor' : '/dashboard') : '/register';

  return (
    <footer className="landing-footer" role="contentinfo">
      {/* Pre-footer CTA banner */}
      <div className="landing-cta-banner">
        <div className="cta-banner-inner">
          <span className="cta-banner-pill">Start Today</span>
          <h2 className="cta-banner-title">
            Your Health Story in One Unified Dashboard
          </h2>
          <p className="cta-banner-sub">
            Join thousands of patients taking charge of their wellness through clear, readable lab trends.
          </p>
          <div className="cta-banner-actions">
            <Link to={ctaPath} className="btn btn-primary btn-lg">
              <span>{isAuthenticated ? 'Return to Dashboard' : 'Create Free Account'}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-secondary btn-lg">
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main-container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link to="/" className="brand" aria-label="LabLens Home">
              <div className="brand-icon">
                <Activity size={22} />
              </div>
              <span>LabLens</span>
            </Link>
            <p className="footer-tagline">
              Clinical blood test comprehension, automated PDF parsing, and longitudinal trend analytics for patients and physicians.
            </p>
          </div>

          <div className="footer-links-col">
            <span className="footer-heading">Platform</span>
            <ul className="footer-link-list">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <span className="footer-heading">Portals</span>
            <ul className="footer-link-list">
              <li><Link to="/dashboard">Patient Dashboard</Link></li>
              <li><Link to="/doctor">Doctor Clinical Portal</Link></li>
              <li><Link to="/register?role=doctor">Doctor Registration</Link></li>
            </ul>
          </div>
        </div>

        {/* Mandatory Medical Disclaimer */}
        <div className="medical-disclaimer-card" role="note" aria-label="Medical Disclaimer">
          <div className="disclaimer-icon-wrapper">
            <ShieldCheck size={20} className="text-primary" aria-hidden="true" />
          </div>
          <div className="disclaimer-content">
            <h4 className="disclaimer-title">Clinical & Medical Advisory Notice</h4>
            <p className="disclaimer-text">
              LabLens is an educational and informational tool designed to help individuals and clinicians visualize, organize, and monitor routine laboratory biomarkers.
              The analysis, health scores, and reference range alerts provided do not constitute medical diagnosis, formal prognosis, or clinical prescriptions.
              Always consult a licensed physician or qualified medical professional before initiating, modifying, or discontinuing any treatment, diet, or medication regimen.
            </p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} LabLens Clinical Technologies. All rights reserved. Built for patient empowerment.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
