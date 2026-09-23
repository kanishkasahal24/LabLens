import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Calendar,
  Building2,
  ChevronRight,
  Trash2,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const DashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // useCallback requirement for fetching functions passed or reused
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      setReports(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blood reports:', err);
      setError('Failed to load blood reports. Please check server connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect requirement for fetching on mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = async (e, reportId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this lab report?')) return;

    try {
      setDeletingId(reportId);
      await api.delete(`/reports/${reportId}`);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (err) {
      alert('Failed to delete report. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading clinical dashboard and lab records...</p>
      </div>
    );
  }

  const totalReports = reports.length;
  const abnormalCount = reports.filter((r) => r.overallStatus === 'Abnormal').length;
  const latestReport = reports[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Reports Dashboard</h1>
          <p className="page-subtitle">Track, review, and monitor historical blood test parameters</p>
        </div>
        <Link to="/add-report" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add New Report</span>
        </Link>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Clinical Metrics Summary Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-value">{totalReports}</div>
            <div className="stat-label">Total Lab Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: abnormalCount > 0 ? '#FEE2E2' : '#DCFCE7', color: abnormalCount > 0 ? '#B91C1C' : '#15803D' }}>
            {abnormalCount > 0 ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div>
            <div className="stat-value">{totalReports === 0 ? '—' : `${abnormalCount} Abnormal`}</div>
            <div className="stat-label">{abnormalCount > 0 ? 'Requires attention' : 'All parameters normal'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">
              {latestReport
                ? new Date(latestReport.testDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'No Data'}
            </div>
            <div className="stat-label">Latest Test Date</div>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Activity size={28} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
            No Blood Reports Recorded Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px auto' }}>
            Start building your personal health profile by entering details from your recent lab report.
          </p>
          <Link to="/add-report" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Add Your First Report</span>
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Recent Lab Reports ({reports.length})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {reports.map((report) => {
              const formattedDate = new Date(report.testDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={report._id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <StatusBadge status={report.overallStatus} />
                      <button
                        onClick={(e) => handleDelete(e, report._id)}
                        disabled={deletingId === report._id}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', border: 'none', color: 'var(--text-light)' }}
                        title="Delete report"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                      {report.labName}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
                      <Calendar size={15} />
                      <span>{formattedDate}</span>
                    </div>

                    <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        <span>Parameters Tracked</span>
                        <span>{report.parameters.length} biomarkers</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {report.parameters.slice(0, 4).map((p, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: 'white',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.75rem'
                            }}
                          >
                            {p.name}: <strong className="number-cell">{p.value}</strong> {p.unit}
                          </span>
                        ))}
                        {report.parameters.length > 4 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 4px' }}>
                            +{report.parameters.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/reports/${report._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>View Full Laboratory Table</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
