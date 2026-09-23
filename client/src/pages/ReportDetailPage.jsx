import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, Trash2, FileText, Search, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Coursework Requirement: useCallback for fetching on route param change
  const fetchReportDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/${id}`);
      setReport(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report detail:', err);
      setError('Report not found or unable to fetch details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Coursework Requirement: useEffect on mount & param change
  useEffect(() => {
    fetchReportDetail();
  }, [fetchReportDetail]);

  // Coursework Requirement: useMemo for derived parameter calculations & filtering
  const processedParameters = useMemo(() => {
    if (!report || !report.parameters) return [];

    let list = report.parameters;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(term));
    }

    return list;
  }, [report, searchTerm]);

  // Coursework Requirement: useMemo to compute summary counters using Array.prototype.reduce
  const summary = useMemo(() => {
    if (!report || !report.parameters) return { normal: 0, low: 0, high: 0, total: 0 };

    return report.parameters.reduce(
      (acc, param) => {
        acc.total += 1;
        const st = (param.status || 'normal').toLowerCase();
        if (st === 'low') acc.low += 1;
        else if (st === 'high') acc.high += 1;
        else acc.normal += 1;
        return acc;
      },
      { normal: 0, low: 0, high: 0, total: 0 }
    );
  }, [report]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lab report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      navigate('/');
    } catch (err) {
      alert('Failed to delete report.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading laboratory report findings...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="card empty-state">
        <AlertCircle size={32} color="var(--status-high-text)" />
        <h3 style={{ marginTop: '12px' }}>{error || 'Lab Report Not Found'}</h3>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px 0' }}>
          The requested report may have been removed or does not exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(report.testDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="page-title">{report.labName}</h1>
            <StatusBadge status={report.overallStatus} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} />
              {formattedDate}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleDelete} className="btn btn-danger btn-sm">
            <Trash2 size={16} />
            <span>Delete Report</span>
          </button>
        </div>
      </div>

      {/* Summary Status Strip */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-icon" style={{ width: '40px', height: '40px' }}>
            <FileText size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{summary.total}</div>
            <div className="stat-label">Total Biomarkers</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-icon" style={{ width: '40px', height: '40px', backgroundColor: 'var(--status-normal-bg)', color: 'var(--status-normal-text)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{summary.normal}</div>
            <div className="stat-label">Normal Range</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-icon" style={{ width: '40px', height: '40px', backgroundColor: 'var(--status-low-bg)', color: 'var(--status-low-text)' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{summary.low}</div>
            <div className="stat-label">Low Flags</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '16px' }}>
          <div className="stat-icon" style={{ width: '40px', height: '40px', backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{summary.high}</div>
            <div className="stat-label">High Flags</div>
          </div>
        </div>
      </div>

      {report.notes && (
        <div className="card" style={{ marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '16px 20px' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            Physician / Clinical Notes
          </h4>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>{report.notes}</p>
        </div>
      )}

      {/* Parameter Table View */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Laboratory Findings & Reference Ranges
          </h3>

          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search parameter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.875rem', height: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-light)' }} />
          </div>
        </div>

        <div className="clinical-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Parameter Name</th>
                <th>Result Value</th>
                <th>Unit</th>
                <th>Standard Reference Range</th>
                <th>Clinical Flag</th>
              </tr>
            </thead>
            <tbody>
              {processedParameters.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No parameters matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                processedParameters.map((param) => {
                  const hasLow = param.normalRangeLow !== null && param.normalRangeLow !== undefined;
                  const hasHigh = param.normalRangeHigh !== null && param.normalRangeHigh !== undefined;

                  let rangeStr = 'Not specified';
                  if (hasLow && hasHigh) rangeStr = `${param.normalRangeLow} – ${param.normalRangeHigh}`;
                  else if (hasLow) rangeStr = `>= ${param.normalRangeLow}`;
                  else if (hasHigh) rangeStr = `<= ${param.normalRangeHigh}`;

                  return (
                    <tr key={param._id || param.name}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        <Link to={`/trends?param=${encodeURIComponent(param.name)}`} style={{ color: 'inherit' }} title="View trend line for this biomarker">
                          {param.name}
                        </Link>
                      </td>
                      <td className="number-cell" style={{ fontSize: '1rem', color: param.status !== 'normal' ? 'var(--status-high-text)' : 'inherit' }}>
                        {param.value}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {param.unit || '—'}
                      </td>
                      <td className="number-cell" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {rangeStr}
                      </td>
                      <td>
                        <StatusBadge status={param.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
