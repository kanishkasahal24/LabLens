import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Activity, Filter, Info, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const TrendsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialParam = searchParams.get('param') || '';

  const [trendsData, setTrendsData] = useState({ parameterNames: [], trends: {} });
  const [selectedParam, setSelectedParam] = useState(initialParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useCallback requirement for fetching function
  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/trends/all');
      setTrendsData(res.data);

      const names = res.data.parameterNames || [];
      if (names.length > 0) {
        if (!initialParam || !names.includes(initialParam)) {
          setSelectedParam(names[0]);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError('Unable to load biomarker historical trend data.');
    } finally {
      setLoading(false);
    }
  }, [initialParam]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // Update URL parameter when selection changes
  const handleSelectParam = (paramName) => {
    setSelectedParam(paramName);
    setSearchParams({ param: paramName });
  };

  // Coursework Requirement: useMemo for deriving trend chart dataset & statistics
  const currentTrendPoints = useMemo(() => {
    if (!selectedParam || !trendsData.trends || !trendsData.trends[selectedParam]) {
      return [];
    }

    return trendsData.trends[selectedParam].map((pt) => ({
      ...pt,
      numericValue: Number(pt.value)
    }));
  }, [selectedParam, trendsData]);

  // Coursework Requirement: useMemo for computing stats using reduce/math
  const stats = useMemo(() => {
    if (currentTrendPoints.length === 0) return null;

    const values = currentTrendPoints.map((p) => p.numericValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length).toFixed(1);

    const latest = currentTrendPoints[currentTrendPoints.length - 1];
    const previous = currentTrendPoints.length > 1 ? currentTrendPoints[currentTrendPoints.length - 2] : null;

    let delta = null;
    if (previous) {
      delta = (latest.numericValue - previous.numericValue).toFixed(1);
    }

    return {
      latest,
      min,
      max,
      avg,
      delta,
      unit: latest.unit,
      normalRangeLow: latest.normalRangeLow,
      normalRangeHigh: latest.normalRangeHigh
    };
  }, [currentTrendPoints]);

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Analyzing historical biomarker trajectories...</p>
      </div>
    );
  }

  const parameterNames = trendsData.parameterNames || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Biomarker Trend Analytics</h1>
          <p className="page-subtitle">Track historical biomarker progression over time</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <Info size={18} />
          <span>{error}</span>
        </div>
      )}

      {parameterNames.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <TrendingUp size={28} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
            No Parameter Trend Data Available
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Please add at least one blood report to begin tracking biomarker trends over time.
          </p>
          <Link to="/add-report" className="btn btn-primary">
            Add New Lab Report
          </Link>
        </div>
      ) : (
        <div>
          {/* Parameter Selector Dropdown */}
          <div className="card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-main)' }}>
                <Filter size={18} color="var(--primary-teal)" />
                <label htmlFor="paramSelect">Select Biomarker Parameter:</label>
              </div>

              <select
                id="paramSelect"
                className="form-select"
                style={{ maxWidth: '320px', fontWeight: 600 }}
                value={selectedParam}
                onChange={(e) => handleSelectParam(e.target.value)}
              >
                {parameterNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Biomarker Summary Statistics Cards */}
          {stats && (
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              <div className="stat-card">
                <div className="stat-icon">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="number-cell">{stats.latest.numericValue}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>{stats.unit}</span>
                  </div>
                  <div className="stat-label">
                    Latest Value ({stats.latest.formattedDate})
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#F1F5F9', color: 'var(--text-main)' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="number-cell">{stats.avg}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>{stats.unit}</span>
                  </div>
                  <div className="stat-label">Historical Average</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#F1F5F9', color: 'var(--text-main)' }}>
                  {stats.delta !== null && Number(stats.delta) > 0 ? (
                    <ArrowUpRight size={24} color="var(--status-high-text)" />
                  ) : stats.delta !== null && Number(stats.delta) < 0 ? (
                    <ArrowDownRight size={24} color="var(--primary-teal)" />
                  ) : (
                    <Minus size={24} />
                  )}
                </div>
                <div>
                  <div className="stat-value">
                    {stats.delta !== null ? (
                      <span className="number-cell">
                        {Number(stats.delta) > 0 ? `+${stats.delta}` : stats.delta} {stats.unit}
                      </span>
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="stat-label">Change from previous test</div>
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <div className="stat-value" style={{ fontSize: '1.125rem' }}>
                    {stats.normalRangeLow !== null && stats.normalRangeHigh !== null
                      ? `${stats.normalRangeLow} – ${stats.normalRangeHigh} ${stats.unit}`
                      : 'Not defined'}
                  </div>
                  <div className="stat-label" style={{ marginTop: '4px' }}>Standard Clinical Range</div>
                  <div style={{ marginTop: '6px' }}>
                    <StatusBadge status={stats.latest.status} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recharts Line Chart Container */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
              Historical Progression: {selectedParam}
            </h3>

            <div style={{ width: '100%', height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentTrendPoints} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="formattedDate" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} domain={['auto', 'auto']} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: 'white', padding: '12px 16px', border: '1px solid #CBD5E1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '4px' }}>{data.labName}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1A1A1A' }}>
                              {data.formattedDate}
                            </div>
                            <div style={{ marginTop: '6px', fontSize: '1rem', color: '#0F6E6E', fontWeight: 700 }}>
                              {data.name}: {data.numericValue} {data.unit}
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <StatusBadge status={data.status} />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Reference line indicators if low/high specified */}
                  {stats?.normalRangeLow && (
                    <ReferenceLine y={stats.normalRangeLow} stroke="#D97706" strokeDasharray="3 3" label={{ value: `Low Ref (${stats.normalRangeLow})`, fill: '#D97706', fontSize: 11 }} />
                  )}
                  {stats?.normalRangeHigh && (
                    <ReferenceLine y={stats.normalRangeHigh} stroke="#DC2626" strokeDasharray="3 3" label={{ value: `High Ref (${stats.normalRangeHigh})`, fill: '#DC2626', fontSize: 11 }} />
                  )}
                  <Line
                    type="monotone"
                    dataKey="numericValue"
                    stroke="#0F6E6E"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#0F6E6E', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 8, fill: '#1D4E89' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Data Table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Test History for {selectedParam}
              </h3>
            </div>
            <div className="clinical-table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Laboratory Name</th>
                    <th>Measured Result</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTrendPoints.map((pt) => (
                    <tr key={pt.reportId}>
                      <td style={{ fontWeight: 600 }}>{pt.formattedDate}</td>
                      <td>{pt.labName}</td>
                      <td className="number-cell" style={{ fontSize: '1rem' }}>
                        {pt.numericValue} {pt.unit}
                      </td>
                      <td className="number-cell" style={{ color: 'var(--text-muted)' }}>
                        {pt.normalRangeLow && pt.normalRangeHigh ? `${pt.normalRangeLow} – ${pt.normalRangeHigh}` : '—'}
                      </td>
                      <td>
                        <StatusBadge status={pt.status} />
                      </td>
                      <td>
                        <Link to={`/reports/${pt.reportId}`} className="btn btn-secondary btn-sm">
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendsPage;
