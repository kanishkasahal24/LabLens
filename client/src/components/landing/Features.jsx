import React from 'react';
import {
  FileText,
  TrendingUp,
  GitCompare,
  BookOpen,
  Sparkles,
  Stethoscope,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const featuresData = [
  {
    icon: FileText,
    title: 'Smart PDF Lab Report Upload',
    description: 'Drop standard PDF blood tests or scanned reports. Our clinical parser automatically detects laboratory names, test dates, and biomarkers without tedious manual entry.',
    badge: 'Automated Extraction'
  },
  {
    icon: TrendingUp,
    title: 'Longitudinal Trend Trajectories',
    description: 'Track individual biomarker progression over multiple visits with interactive charts, historical averages, standard deviations, and directional delta indicators.',
    badge: 'Visual Analytics'
  },
  {
    icon: GitCompare,
    title: 'Side-by-Side Report Comparison',
    description: 'Compare any two historical reports simultaneously. Spot improving parameters transitioning to normal, or early warning spikes requiring doctor consultation.',
    badge: 'Direct Delta Matrix'
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Biomarker Guide',
    description: 'Demystify medical jargon. Browse an extensive dictionary of routine biomarkers, understand what high/low levels indicate, and review standard clinical reference ranges.',
    badge: 'Clinical Literacy'
  },
  {
    icon: Sparkles,
    title: 'Personalized Health Advisory',
    description: 'Receive algorithm-driven lifestyle, dietary, and repeat-testing guidance tailored to your specific out-of-range biomarkers, age, biological sex, and vitals.',
    badge: 'Smart Guidance'
  },
  {
    icon: Stethoscope,
    title: 'Physician Link & Clinical Portal',
    description: 'Share access with your doctor using unique practitioner codes. Physicians review verified biomarker rosters, flag critical risks, and add clinical remarks.',
    badge: 'Doctor Collaboration'
  }
];

const Features = () => {
  const { isAuthenticated, user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const ctaLink = isAuthenticated ? (isDoctor ? '/doctor' : '/dashboard') : '/register';

  return (
    <section className="landing-features-section" id="features" aria-labelledby="features-heading">
      <div className="section-header text-center">
        <span className="section-pill">Core Capabilities</span>
        <h2 id="features-heading" className="section-title">
          Everything You Need to Master Your Blood Health
        </h2>
        <p className="section-subtitle">
          Designed for patients seeking clarity and doctors demanding streamlined clinical insights.
        </p>
      </div>

      <div className="features-grid">
        {featuresData.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div key={idx} className="feature-card">
              <div className="feature-card-top">
                <div className="feature-icon-box">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <span className="feature-badge">{f.badge}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.description}</p>
            </div>
          );
        })}
      </div>

      <div className="features-cta-box">
        <div className="features-cta-text">
          <h3>Ready to turn raw lab numbers into actionable clarity?</h3>
          <p>Join patients tracking their blood chemistry with precision and confidence.</p>
        </div>
        <Link to={ctaLink} className="btn btn-primary">
          <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Now'}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};

export default Features;
