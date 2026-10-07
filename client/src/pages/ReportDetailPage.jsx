import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Heart,
  Calendar,
  Building,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import StatusBadge from '../components/StatusBadge';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/${id}/analysis`);
        setAnalysisData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blood report permanently?')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/reports/${id}`);
      navigate(user?.role === 'doctor' ? '/doctor' : '/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report');
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Generating Smart Report Analysis...
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div>
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error || 'Report not found'}</span>
        </div>
      </div>
    );
  }

  const {
    report,
    patient,
    scoreBreakdown,
    vitalsGrid,
    criticalParameters,
    panelResults,
    advisory,
    previousComparison,
    disclaimer
  } = analysisData;

  const score = report.healthScore ?? 100;
  const scoreColor = score >= 80 ? '#15803D' : score >= 60 ? '#B45309' : '#B91C1C';
  const scoreBg = score >= 80 ? '#DCFCE7' : score >= 60 ? '#FEF3C7' : '#FEE2E2';

  const isPatientOwner = user?.role === 'patient';

  return (
    <div className="smart-report-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Print stylesheet */}
      <style>{`
        @media print {
          .navbar, .no-print, header, button {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .smart-report-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Navigation & Actions Top Bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>

          {isPatientOwner && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={16} />
              <span>{deleting ? 'Deleting...' : 'Delete Report'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Header Card */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '6px solid var(--primary-teal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-teal)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Activity size={18} />
              <span>Smart Blood Analysis Report</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {patient.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Demographics: {patient.age ? `${patient.age} yrs` : 'Age N/A'} • {patient.sex?.toUpperCase()} • Blood Group: {patient.bloodGroup}
            </p>
          </div>

          {/* Health Score Badge */}
          <div style={{ textAlign: 'center', minWidth: '160px' }}>
            <div
              onClick={() => setShowBreakdown(!showBreakdown)}
              style={{
                backgroundColor: scoreBg,
                color: scoreColor,
                padding: '12px 20px',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${scoreColor}40`,
                cursor: 'pointer'
              }}
              title="Click to toggle score deduction breakdown"
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                Health Score
              </span>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.1 }}>{score}</span>
              <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>/ 100</span>
            </div>
            <button
              type="button"
              className="no-print"
              onClick={() => setShowBreakdown(!showBreakdown)}
              style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '4px' }}
            >
              {showBreakdown ? 'Hide Breakdown ▲' : 'View Breakdown ▼'}
            </button>
          </div>
        </div>

        {/* Score Breakdown Drawer */}
        {showBreakdown && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>Health Score Calculation Breakdown</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Starting Score: 100 • Deductions are weighted by parameter severity & body system criticality.
            </p>
            {scoreBreakdown.deductions.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--status-normal-text)', fontWeight: 600, marginTop: '6px' }}>
                ✓ Zero deductions. All measured biomarkers are within normal optimal ranges.
              </p>
            ) : (
              <div style={{ marginTop: '8px', display: 'grid', gap: '6px' }}>
                {scoreBreakdown.deductions.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                    <span>{d.parameterName} ({d.severity} {d.status})</span>
                    <strong style={{ color: 'var(--status-high-text)' }}>-{d.pointsDeducted} pts</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meta details footer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <div>
            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>Diagnostic Lab</span>
            {report.labName}
          </div>
          <div>
            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>Sample Collection Date</span>
            {new Date(report.collectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div>
            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>Report Test Date</span>
            {new Date(report.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div>
            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>Specimen Type</span>
            {report.sampleType}
          </div>
        </div>
      </div>

      {/* Section 1: 10-System Vitals Grid */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          10-System Body Vitals Overview
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {vitalsGrid.map((sys) => {
            const isConcern = sys.state === 'Concern';
            const isNormal = sys.state === 'Looks good';
            const bgColor = isConcern ? 'var(--status-high-bg)' : isNormal ? 'var(--status-normal-bg)' : 'var(--bg-subtle)';
            const textColor = isConcern ? 'var(--status-high-text)' : isNormal ? 'var(--status-normal-text)' : 'var(--text-muted)';
            const borderColor = isConcern ? 'var(--status-high-border)' : isNormal ? 'var(--status-normal-border)' : 'var(--border-color)';

            return (
              <div
                key={sys.key}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: textColor, display: 'block' }}>
                    {sys.label}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', display: 'block' }}>
                    {sys.headlineValue}
                  </span>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: textColor
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: textColor }}>
                    {sys.state}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Critical Parameters Cards */}
      {criticalParameters.length > 0 && (
        <div className="card" style={{ marginBottom: '24px', backgroundColor: '#FFF5F5', borderColor: '#FEB2B2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--status-high-text)' }}>
            <ShieldAlert size={22} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Attention Required: Critical & Abnormal Biomarkers ({criticalParameters.length})
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            {criticalParameters.map((cp, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--status-high-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {cp.name} <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>({cp.panel})</span>
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-high-text)' }}>
                        {cp.value} {cp.unit}
                      </span>
                      <span className="status-badge status-high" style={{ fontSize: '0.8125rem' }}>
                        <span>{cp.arrow}</span>
                        <span>{cp.status.toUpperCase()} ({cp.severity} severity)</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <span>Normal Ref Range</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cp.normalRange}</p>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8125rem' }}>
                  <div>
                    <strong style={{ color: 'var(--deep-navy)', display: 'block', marginBottom: '2px' }}>Impact on Health:</strong>
                    <span style={{ color: 'var(--text-main)' }}>{cp.impact}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--primary-teal)', display: 'block', marginBottom: '2px' }}>How to Improve:</strong>
                    <span style={{ color: 'var(--text-main)' }}>{cp.howToImprove}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Biomarker Results Grouped by Panel */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>
          Complete Biomarker Results by Panel
        </h2>

        {Object.keys(panelResults).map((panelName) => {
          const params = panelResults[panelName];
          return (
            <div key={panelName} style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-teal)', backgroundColor: 'var(--primary-teal-light)', padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                {panelName} ({params.length})
              </h3>

              <div className="clinical-table-container">
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>Biomarker</th>
                      <th>Measured Result</th>
                      <th>Ref Range / Normal</th>
                      <th>Status</th>
                      <th>Change vs Prev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((p) => {
                      const comp = previousComparison[p.name];
                      return (
                        <tr key={p._id || p.name}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td className="number-cell">
                            {p.resultType === 'text' ? p.textValue : `${p.value} ${p.unit}`}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                            {p.resultType === 'text'
                              ? (p.referenceText || 'Negative')
                              : `${p.normalRangeLow ?? 'Min'} - ${p.normalRangeHigh ?? 'Max'} ${p.unit}`}
                          </td>
                          <td>
                            <StatusBadge status={p.status} />
                          </td>
                          <td>
                            {comp ? (
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span>{comp.arrow}</span>
                                <span>{comp.diff > 0 ? `+${comp.diff}` : comp.diff}</span>
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baseline</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 4: Rule-Based Clinical Advisory */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-teal)' }}>
          <Sparkles size={20} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Personalised Health Advisory</h2>
        </div>

        {/* BMI Summary */}
        <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Body Mass Index (BMI) Summary</h4>
          <p style={{ fontSize: '0.875rem', marginTop: '2px' }}>
            <strong>{advisory.bmiSummary.bmi ? `${advisory.bmiSummary.bmi} kg/m²` : 'N/A'}</strong> — Category: <strong style={{ color: 'var(--primary-teal)' }}>{advisory.bmiSummary.category}</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{advisory.bmiSummary.details}</p>
        </div>

        {/* Nutrition and Lifestyle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--status-normal-bg)', border: '1px solid var(--status-normal-border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--status-normal-text)', marginBottom: '8px' }}>
              ✓ Nutrition & Lifestyle DO's
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.8125rem', color: 'var(--text-main)', display: 'grid', gap: '6px' }}>
              {advisory.nutritionAndLifestyle.dos.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--status-high-bg)', border: '1px solid var(--status-high-border)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--status-high-text)', marginBottom: '8px' }}>
              ✕ Nutrition & Lifestyle DON'Ts
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.8125rem', color: 'var(--text-main)', display: 'grid', gap: '6px' }}>
              {advisory.nutritionAndLifestyle.donts.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggested Follow-up Retests */}
        {advisory.suggestedRetests && advisory.suggestedRetests.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>Suggested Follow-up Monitoring</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {advisory.suggestedRetests.map((ret, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 600 }}>{ret.test}</span>
                  <span style={{ color: 'var(--primary-teal)', fontWeight: 700 }}>{ret.frequency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Medical Disclaimer Banner */}
      <div style={{ padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
        <Info size={20} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {disclaimer}
        </p>
      </div>
    </div>
  );
};

export default ReportDetailPage;
