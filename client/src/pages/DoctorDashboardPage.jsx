import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, AlertTriangle, CheckCircle2, ChevronRight, FileText, Calendar, Filter } from 'lucide-react';
import api from '../api/axios';

const DoctorDashboardPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('abnormal_first');
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients', {
        params: { search, sort }
      });
      setPatients(res.data.patients || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor Clinical Portal</h1>
          <p className="page-subtitle">Monitor linked patients and track abnormal blood biomarkers</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search patients by name, email, or health condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto' }}>
              <option value="abnormal_first">Abnormal Patients First</option>
              <option value="date">Latest Report Date</option>
              <option value="name">Patient Name (A-Z)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          Loading clinical patient roster...
        </div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Users size={28} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>No Linked Patients Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 0' }}>
            {search ? 'No patients match your search query.' : 'No active patient links. Share your doctor code with patients so they can send link requests.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {patients.map((patient) => {
            const hasCritical = patient.criticalCount > 0;
            return (
              <Link
                key={patient.id}
                to={`/doctor/patients/${patient.id}`}
                className="card card-interactive"
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: hasCritical ? 'var(--status-high-bg)' : 'var(--primary-teal-light)',
                      color: hasCritical ? 'var(--status-high-text)' : 'var(--primary-teal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: `1px solid ${hasCritical ? 'var(--status-high-border)' : 'var(--status-normal-border)'}`
                    }}
                  >
                    {patient.name.charAt(0)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)' }}>{patient.name}</h3>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        ({patient.age ? `${patient.age} yrs` : 'Age N/A'}, {patient.sex?.toUpperCase()})
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {patient.email} • Blood Group: {patient.bloodGroup}
                    </p>

                    {patient.conditions && patient.conditions.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {patient.conditions.map((cond, idx) => (
                          <span key={idx} style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
                            {cond}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Latest Report</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {patient.latestReportDate ? new Date(patient.latestReportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No reports'}
                    </span>
                    {hasCritical ? (
                      <div className="status-badge status-high" style={{ marginTop: '4px' }}>
                        <AlertTriangle size={12} />
                        <span>{patient.criticalCount} Abnormal Biomarker{patient.criticalCount > 1 ? 's' : ''}</span>
                      </div>
                    ) : patient.latestReportDate ? (
                      <div className="status-badge status-normal" style={{ marginTop: '4px' }}>
                        <CheckCircle2 size={12} />
                        <span>Normal</span>
                      </div>
                    ) : null}
                  </div>

                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboardPage;
