import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Calendar,
  Building2,
  Filter,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import AnalyticsSubNav from '../components/AnalyticsSubNav';
import { getParameterStatus } from '../utils/statusHelper';

const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlR1 = searchParams.get('r1') || '';
  const urlR2 = searchParams.get('r2') || '';
  const urlR3 = searchParams.get('r3') || '';

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected report IDs
  const [selectedR1, setSelectedR1] = useState(urlR1);
  const [selectedR2, setSelectedR2] = useState(urlR2);
  const [selectedR3, setSelectedR3] = useState(urlR3);

  // Filter and Sort states
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'changed' | 'abnormal' | 'improved'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'pctChange' | 'abnormal'

  // Fetch all reports for the user
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/reports');
      const fetchedReports = res.data || [];
      setReports(fetchedReports);

      if (fetchedReports.length >= 2) {
        // Pre-select if not already in URL or state
        const validR1 = fetchedReports.find((r) => r._id === urlR1)?._id || fetchedReports[1]._id;
        const validR2 = fetchedReports.find((r) => r._id === urlR2)?._id || fetchedReports[0]._id;
        const validR3 = fetchedReports.find((r) => r._id === urlR3)?._id || '';

        setSelectedR1(validR1);
        setSelectedR2(validR2);
        setSelectedR3(validR3);

        const params = { r1: validR1, r2: validR2 };
        if (validR3) params.r3 = validR3;
        setSearchParams(params, { replace: true });
      }
    } catch (err) {
      console.error('Failed to load user reports for comparison:', err);
      setError(err.response?.data?.message || 'Failed to load laboratory reports. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, [urlR1, urlR2, urlR3, setSearchParams]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle dropdown selections and update URL parameters
  const handleSelectR1 = (id) => {
    setSelectedR1(id);
    const params = { r1: id, r2: selectedR2 };
    if (selectedR3) params.r3 = selectedR3;
    setSearchParams(params);
  };

  const handleSelectR2 = (id) => {
    setSelectedR2(id);
    const params = { r1: selectedR1, r2: id };
    if (selectedR3) params.r3 = selectedR3;
    setSearchParams(params);
  };

  const handleSelectR3 = (id) => {
    setSelectedR3(id);
    const params = { r1: selectedR1, r2: selectedR2 };
    if (id) params.r3 = id;
    setSearchParams(params);
  };

  // Identify selected report objects and sort chronologically (oldest to newest)
  const selectedReportObjects = useMemo(() => {
    const list = [];
    const r1Obj = reports.find((r) => r._id === selectedR1);
    const r2Obj = reports.find((r) => r._id === selectedR2);
    const r3Obj = reports.find((r) => r._id === selectedR3);

    if (r1Obj) list.push(r1Obj);
    if (r2Obj && r2Obj._id !== selectedR1) list.push(r2Obj);
    if (r3Obj && r3Obj._id !== selectedR1 && r3Obj._id !== selectedR2) list.push(r3Obj);

    // Sort chronologically ascending (earlier -> later)
    return list.sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
  }, [reports, selectedR1, selectedR2, selectedR3]);

  // Compute unified comparison matrix
  const { comparisons, summary } = useMemo(() => {
    if (selectedReportObjects.length < 2) {
      return { comparisons: [], summary: { improved: 0, worsened: 0, unchanged: 0, abnormal: 0 } };
    }

    const oldestReport = selectedReportObjects[0];
    const newestReport = selectedReportObjects[selectedReportObjects.length - 1];

    // Build parameter maps for each selected report
    const reportParamMaps = selectedReportObjects.map((report) => {
      const map = {};
      (report.parameters || []).forEach((p) => {
        map[p.name.trim().toLowerCase()] = p;
      });
      return { report, map };
    });

    // Collect all unique canonical parameter names across all selected reports
    const allParamNames = new Set();
    const paramMetaMap = {};

    selectedReportObjects.forEach((report) => {
      (report.parameters || []).forEach((p) => {
        const key = p.name.trim().toLowerCase();
        allParamNames.add(key);
        if (!paramMetaMap[key]) {
          paramMetaMap[key] = {
            name: p.name.trim(),
            panel: p.panel || 'General',
            unit: p.unit || '',
            resultType: p.resultType || 'numeric',
            normalRangeLow: p.normalRangeLow,
            normalRangeHigh: p.normalRangeHigh,
            referenceText: p.referenceText || ''
          };
        }
      });
    });

    let improvedCount = 0;
    let worsenedCount = 0;
    let unchangedCount = 0;
    let abnormalCount = 0;

    const matrix = [];

    allParamNames.forEach((key) => {
      const meta = paramMetaMap[key];
      const valuesByReport = reportParamMaps.map(({ map }) => map[key] || null);

      const oldestParam = reportParamMaps[0].map[key] || null;
      const newestParam = reportParamMaps[reportParamMaps.length - 1].map[key] || null;

      let diff = null;
      let pctChange = null;
      let direction = 'none';
      let trendEvaluation = 'neutral'; // 'improved' | 'worsened' | 'neutral'

      const oldestVal = oldestParam && oldestParam.value !== null && oldestParam.value !== undefined ? Number(oldestParam.value) : null;
      const newestVal = newestParam && newestParam.value !== null && newestParam.value !== undefined ? Number(newestParam.value) : null;

      if (oldestVal !== null && newestVal !== null && !isNaN(oldestVal) && !isNaN(newestVal)) {
        diff = Number((newestVal - oldestVal).toFixed(2));
        pctChange = oldestVal !== 0 ? Number(((diff / oldestVal) * 100).toFixed(1)) : 0;
        direction = diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'same';

        const oldestStatus = oldestParam.status || 'normal';
        const newestStatus = newestParam.status || 'normal';

        if (newestStatus === 'normal' && oldestStatus !== 'normal') {
          trendEvaluation = 'improved';
          improvedCount++;
        } else if (newestStatus !== 'normal' && oldestStatus === 'normal') {
          trendEvaluation = 'worsened';
          worsenedCount++;
        } else if (diff === 0) {
          unchangedCount++;
        }
      }

      // Check if newest has abnormal reading
      if (newestParam && newestParam.status && newestParam.status !== 'normal') {
        abnormalCount++;
      }

      matrix.push({
        key,
        name: meta.name,
        panel: meta.panel,
        unit: meta.unit,
        normalRangeLow: meta.normalRangeLow,
        normalRangeHigh: meta.normalRangeHigh,
        referenceText: meta.referenceText,
        valuesByReport,
        diff,
        pctChange,
        direction,
        trendEvaluation
      });
    });

    return {
      comparisons: matrix,
      summary: {
        improved: improvedCount,
        worsened: worsenedCount,
        unchanged: unchangedCount,
        abnormal: abnormalCount
      }
    };
  }, [selectedReportObjects]);

  // Filtered & Sorted comparisons
  const filteredComparisons = useMemo(() => {
    let list = [...comparisons];

    if (activeFilter === 'changed') {
      list = list.filter((item) => item.diff !== null && item.diff !== 0);
    } else if (activeFilter === 'abnormal') {
      list = list.filter((item) =>
        item.valuesByReport.some((v) => v && v.status && v.status !== 'normal')
      );
    } else if (activeFilter === 'improved') {
      list = list.filter((item) => item.trendEvaluation === 'improved');
    }

    // Sorting
    if (sortBy === 'pctChange') {
      list.sort((a, b) => Math.abs(b.pctChange || 0) - Math.abs(a.pctChange || 0));
    } else if (sortBy === 'abnormal') {
      list.sort((a, b) => {
        const aAbnormal = a.valuesByReport.some((v) => v && v.status !== 'normal');
        const bAbnormal = b.valuesByReport.some((v) => v && v.status !== 'normal');
        return (bAbnormal ? 1 : 0) - (aAbnormal ? 1 : 0);
      });
    } else {
      list.sort((a, b) => a.panel.localeCompare(b.panel) || a.name.localeCompare(b.name));
    }

    return list;
  }, [comparisons, activeFilter, sortBy]);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Report Comparison Matrix</h1>
            <p className="page-subtitle">Compare biomarkers across multiple lab tests side by side</p>
          </div>
        </div>
        <AnalyticsSubNav />
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p>Loading historical blood test records...</p>
        </div>
      </div>
    );
  }

  if (reports.length < 2) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Report Comparison Matrix</h1>
            <p className="page-subtitle">Compare biomarkers across multiple lab tests side by side</p>
          </div>
        </div>
        <AnalyticsSubNav />
        <div className="empty-state">
          <div className="empty-icon">
            <GitCompare size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
            At Least 2 Lab Reports Required for Comparison
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px', fontSize: '0.9375rem' }}>
            You currently have {reports.length} report recorded. Add a second blood test report to compare changes,
            spot improving markers, and analyze longitudinal delta metrics.
          </p>
          <Link to="/add-report" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Add Your Next Lab Report</span>
          </Link>
        </div>
      </div>
    );
  }

  const formatReportOption = (r) => {
    const d = new Date(r.testDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${d} — ${r.labName} (${r.parameters?.length || 0} biomarkers)`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Report Comparison Matrix</h1>
          <p className="page-subtitle">Compare biomarker changes, improvements, and trajectories side by side</p>
        </div>
      </div>

      <AnalyticsSubNav />

      {error && (
        <div className="error-banner" role="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={fetchReports} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Selectors Card */}
      <div className="compare-selectors-card">
        <div className="compare-selectors-grid">
          {/* Report 1 Selector */}
          <div className="selector-field">
            <label className="selector-label" htmlFor="select-r1">
              <Calendar size={14} className="text-primary" />
              <span>Report 1 (Baseline) *</span>
            </label>
            <select
              id="select-r1"
              className="form-select"
              value={selectedR1}
              onChange={(e) => handleSelectR1(e.target.value)}
            >
              {reports.map((r) => (
                <option
                  key={r._id}
                  value={r._id}
                  disabled={r._id === selectedR2 || r._id === selectedR3}
                >
                  {formatReportOption(r)} {r._id === selectedR2 ? '(In Report 2)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Report 2 Selector */}
          <div className="selector-field">
            <label className="selector-label" htmlFor="select-r2">
              <Calendar size={14} className="text-primary" />
              <span>Report 2 (Comparison) *</span>
            </label>
            <select
              id="select-r2"
              className="form-select"
              value={selectedR2}
              onChange={(e) => handleSelectR2(e.target.value)}
            >
              {reports.map((r) => (
                <option
                  key={r._id}
                  value={r._id}
                  disabled={r._id === selectedR1 || r._id === selectedR3}
                >
                  {formatReportOption(r)} {r._id === selectedR1 ? '(In Report 1)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Report 3 Selector */}
          <div className="selector-field">
            <label className="selector-label" htmlFor="select-r3">
              <Sparkles size={14} color="#0F6E6E" />
              <span>Report 3 (Optional Longitudinal)</span>
            </label>
            <select
              id="select-r3"
              className="form-select"
              value={selectedR3}
              onChange={(e) => handleSelectR3(e.target.value)}
            >
              <option value="">(None — Compare 2 Reports)</option>
              {reports.map((r) => (
                <option
                  key={r._id}
                  value={r._id}
                  disabled={r._id === selectedR1 || r._id === selectedR2}
                >
                  {formatReportOption(r)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Metric Summary Cards */}
      <div className="compare-summary-grid">
        <div className="compare-summary-card">
          <div className="summary-card-icon" style={{ backgroundColor: 'var(--primary-teal-light)', color: 'var(--primary-teal)' }}>
            <GitCompare size={22} />
          </div>
          <div>
            <div className="summary-card-val">{comparisons.length}</div>
            <div className="summary-card-label">Biomarkers Compared</div>
          </div>
        </div>

        <div className="compare-summary-card">
          <div className="summary-card-icon" style={{ backgroundColor: 'var(--status-normal-bg)', color: 'var(--status-normal-text)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="summary-card-val" style={{ color: 'var(--status-normal-text)' }}>
              {summary.improved}
            </div>
            <div className="summary-card-label">Improved to Normal</div>
          </div>
        </div>

        <div className="compare-summary-card">
          <div className="summary-card-icon" style={{ backgroundColor: 'var(--status-high-bg)', color: 'var(--status-high-text)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="summary-card-val" style={{ color: 'var(--status-high-text)' }}>
              {summary.worsened}
            </div>
            <div className="summary-card-label">Needs Clinical Attention</div>
          </div>
        </div>

        <div className="compare-summary-card">
          <div className="summary-card-icon" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
            <Minus size={22} />
          </div>
          <div>
            <div className="summary-card-val">{summary.unchanged}</div>
            <div className="summary-card-label">Unchanged / Stable</div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="compare-filter-bar">
        <div className="filter-pills-group" role="tablist" aria-label="Filter compared biomarkers">
          <button
            type="button"
            className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Biomarkers ({comparisons.length})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${activeFilter === 'changed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('changed')}
          >
            Changed Only
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${activeFilter === 'abnormal' ? 'active' : ''}`}
            onClick={() => setActiveFilter('abnormal')}
          >
            Abnormal Only
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${activeFilter === 'improved' ? 'active' : ''}`}
            onClick={() => setActiveFilter('improved')}
          >
            Improved Only ({summary.improved})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={16} className="text-muted" />
          <label htmlFor="compare-sort-select" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Sort:
          </label>
          <select
            id="compare-sort-select"
            className="form-select"
            style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8125rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Panel / Name</option>
            <option value="pctChange">Biggest % Change</option>
            <option value="abnormal">Abnormal First</option>
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <div className="compare-table-container">
        <table className="compare-table" aria-label="Side-by-side blood report biomarker comparison matrix">
          <thead>
            <tr>
              <th scope="col" className="sticky-biomarker-col" style={{ width: '24%' }}>Biomarker</th>
              <th scope="col" style={{ width: '10%' }}>Unit</th>
              {selectedReportObjects.map((report, idx) => (
                <th key={report._id} scope="col" style={{ width: `${50 / selectedReportObjects.length}%` }}>
                  <div className="report-col-header">
                    <span className="report-col-date">
                      {new Date(report.testDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="report-col-lab">{report.labName}</span>
                  </div>
                </th>
              ))}
              <th scope="col" style={{ width: '16%' }}>Absolute Change</th>
              <th scope="col" style={{ width: '14%' }}>% Change</th>
              <th scope="col" style={{ width: '12%' }}>Trajectory</th>
            </tr>
          </thead>
          <tbody>
            {filteredComparisons.length === 0 ? (
              <tr>
                <td colSpan={selectedReportObjects.length + 5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No biomarkers match the selected filter.
                </td>
              </tr>
            ) : (
              filteredComparisons.map((row) => {
                const isImproved = row.trendEvaluation === 'improved';
                const isWorsened = row.trendEvaluation === 'worsened';

                return (
                  <tr
                    key={row.key}
                    className={isImproved ? 'row-improved' : isWorsened ? 'row-worsened' : ''}
                  >
                    {/* Sticky Biomarker Name Column */}
                    <td className="sticky-biomarker-col">
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                        {row.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {row.panel}
                        {row.normalRangeLow !== null && row.normalRangeHigh !== null && (
                          <span> &bull; Ref: {row.normalRangeLow}–{row.normalRangeHigh}</span>
                        )}
                      </div>
                    </td>

                    {/* Unit Column */}
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {row.unit || '—'}
                    </td>

                    {/* Value columns per selected report */}
                    {row.valuesByReport.map((p, idx) => {
                      if (!p) {
                        return (
                          <td key={idx} style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
                            —
                          </td>
                        );
                      }

                      return (
                        <td key={idx}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="number-cell" style={{ fontSize: '0.9375rem' }}>
                              {p.value !== null ? p.value : p.textValue || '—'}
                            </span>
                            <StatusBadge status={p.status} />
                          </div>
                        </td>
                      );
                    })}

                    {/* Absolute Change */}
                    <td>
                      {row.diff !== null ? (
                        <span className={`delta-cell ${row.diff > 0 ? 'delta-positive' : row.diff < 0 ? 'delta-negative' : 'delta-neutral'}`}>
                          {row.diff > 0 ? `+${row.diff}` : row.diff} {row.unit}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
                    </td>

                    {/* % Change */}
                    <td>
                      {row.pctChange !== null ? (
                        <span className={`delta-cell ${row.pctChange > 0 ? 'delta-positive' : row.pctChange < 0 ? 'delta-negative' : 'delta-neutral'}`}>
                          {row.pctChange > 0 ? `+${row.pctChange}%` : `${row.pctChange}%`}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
                    </td>

                    {/* Trajectory / Direction */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {row.direction === 'increased' ? (
                          <span className="delta-positive" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Increased">
                            <ArrowUpRight size={18} aria-hidden="true" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Up</span>
                          </span>
                        ) : row.direction === 'decreased' ? (
                          <span className="delta-negative" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Decreased">
                            <ArrowDownRight size={18} aria-hidden="true" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Down</span>
                          </span>
                        ) : row.direction === 'same' ? (
                          <span className="delta-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Unchanged">
                            <Minus size={16} aria-hidden="true" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Same</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)' }}>—</span>
                        )}

                        {isImproved && (
                          <span className="trend-badge-improved" title="Biomarker transitioned from abnormal into normal clinical reference range">
                            Improved
                          </span>
                        )}

                        {isWorsened && (
                          <span className="trend-badge-worsened" title="Biomarker moved outside standard reference range">
                            Alert
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
