import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Activity,
  Heart,
  Droplet,
  ShieldCheck,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';

const HealthAdvisoryPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdvisory();
  }, []);

  const fetchAdvisory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/reports/advisory/latest');
      setData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load health advisory. Please ensure you have added at least one blood report.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Generating your personalised clinical advisory...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Personalised Health Advisory</h1>
            <p className="page-subtitle">Evidence-based clinical lifestyle guidance derived from your blood test results</p>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertCircle size={44} style={{ color: 'var(--status-high-text)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>No Advisory Available Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 20px', fontSize: '0.9375rem' }}>
            {error || 'Upload your first blood report to receive a personalized diet, lifestyle, and retest plan.'}
          </p>
          <Link to="/add-report" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Add Blood Report
          </Link>
        </div>
      </div>
    );
  }

  const { report, patient, advisory, vitalsGrid, criticalParameters } = data;
  const bmi = advisory?.bmiSummary || {};
  const nutrition = advisory?.nutritionAndLifestyle || { dos: [], donts: [] };
  const retests = advisory?.suggestedRetests || [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary-teal-light)', color: 'var(--primary-teal)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>
            <Sparkles size={16} />
            <span>Smart Clinical Insights</span>
          </div>
          <h1 className="page-title">Personalised Health Advisory</h1>
          <p className="page-subtitle">
            Tailored nutrition, lifestyle actions, and follow-up screening plan for <strong>{patient.name}</strong> (Blood Group: <strong>{patient.bloodGroup}</strong>)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/reports/${report.id}`} className="btn btn-secondary">
            <FileText size={16} />
            <span>View Full Report</span>
          </Link>
          <button onClick={() => window.print()} className="btn btn-primary">
            Download Advisory
          </button>
        </div>
      </div>

      {/* Baseline Overview Banner */}
      <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--bg-card)', borderLeft: '4px solid var(--primary-teal)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Latest Test Date</span>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {new Date(report.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{report.labName}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Health Score</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: report.healthScore >= 80 ? 'var(--status-normal-text)' : 'var(--primary-teal)', marginTop: '2px' }}>
              {report.healthScore ?? 'N/A'} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ 100</span>
            </p>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Overall Biomarker Rating</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Blood Group</span>
            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-teal)', marginTop: '2px' }}>
              {patient.bloodGroup}
            </p>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Verified Body Profile</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Vitals Requiring Attention</span>
            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: criticalParameters?.length > 0 ? 'var(--status-high-text)' : 'var(--status-normal-text)', marginTop: '2px' }}>
              {criticalParameters?.length || 0} Biomarkers
            </p>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Out-of-range findings</span>
          </div>
        </div>
      </div>

      {/* Body Mass Index (BMI) & Metabolism Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Activity size={20} style={{ color: 'var(--primary-teal)' }} />
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Metabolic & Body Mass Evaluation</h2>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                Calculated BMI: <strong style={{ fontSize: '1.125rem', color: 'var(--primary-teal)' }}>{bmi.bmi ? `${bmi.bmi} kg/m²` : 'N/A'}</strong> — Category: <strong>{bmi.category}</strong>
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {bmi.details} | Routine Activity Level: <strong style={{ textTransform: 'capitalize' }}>{patient.activity}</strong>
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '20px', backgroundColor: bmi.category === 'Normal' ? 'var(--status-normal-bg)' : 'var(--status-high-bg)', color: bmi.category === 'Normal' ? 'var(--status-normal-text)' : 'var(--status-high-text)', fontWeight: 700, fontSize: '0.8125rem' }}>
              {bmi.category} Weight Range
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition & Lifestyle Action Plan: Do's and Don'ts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* DO's */}
        <div className="card" style={{ borderTop: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#047857' }}>
            <CheckCircle2 size={22} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Recommended Actions (Do's)</h3>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {nutrition.dos.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                <span style={{ color: '#10B981', fontWeight: 800, marginTop: '2px' }}>✔</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* DON'Ts */}
        <div className="card" style={{ borderTop: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#B91C1C' }}>
            <XCircle size={22} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Things to Avoid (Don'ts)</h3>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {nutrition.donts.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                <span style={{ color: '#EF4444', fontWeight: 800, marginTop: '2px' }}>✖</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Follow-up Retests */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-teal)' }}>
          <RotateCcw size={20} />
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Recommended Follow-up & Retesting Schedule</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {retests.map((rt, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'white'
              }}
            >
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                {rt.test}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--primary-teal)', fontSize: '0.8125rem', fontWeight: 600 }}>
                <Calendar size={14} />
                <span>Repeat: {rt.frequency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
        <strong>Medical Disclaimer:</strong> {data.disclaimer}
      </div>
    </div>
  );
};

export default HealthAdvisoryPage;
