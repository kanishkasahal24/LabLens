import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Activity, FileText, TrendingUp, Calendar, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const DoctorPatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState(null);
  const [reports, setReports] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'profile' | 'trends'
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const [patientRes, reportsRes, trendsRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get(`/patients/${id}/reports`),
          api.get(`/patients/${id}/trends`)
        ]);

        setPatientData(patientRes.data.patient);
        setReports(reportsRes.data || []);
        setTrends(trendsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Access denied or failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Loading patient clinical file...
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/doctor')} style={{ marginBottom: '16px' }}>
          <ArrowLeft size={16} />
          <span>Back to Patients Roster</span>
        </button>
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error || 'Patient record not found'}</span>
        </div>
      </div>
    );
  }

  const profile = patientData.profile;

  return (
    <div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/doctor')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} />
        <span>Back to Patients Roster</span>
      </button>

      {/* Patient Header Summary */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-teal-light)',
                color: 'var(--primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.25rem'
              }}
            >
              {patientData.name.charAt(0)}
            </div>

            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {patientData.name}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {patientData.email} • {profile?.phone || 'No phone'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem' }}>
            <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Demographics</span>
              <strong>{profile?.age ? `${profile.age} yrs` : 'N/A'} • {profile?.sex?.toUpperCase()}</strong>
            </div>

            <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Blood Group</span>
              <strong>{profile?.bloodGroup || 'Unknown'}</strong>
            </div>

            <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Total Reports</span>
              <strong>{reports.length} Reports</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={16} />
          <span>Blood Reports ({reports.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          <span>Clinical Profile & Vitals</span>
        </button>

        <button
          className={`btn ${activeTab === 'trends' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('trends')}
        >
          <TrendingUp size={16} />
          <span>Biomarker Trends</span>
        </button>
      </div>

      {/* Tab 1: Blood Reports */}
      {activeTab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FileText size={24} /></div>
              <h3>No Blood Reports</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>This patient has not uploaded any blood test reports yet.</p>
            </div>
          ) : (
            <div className="clinical-table-container">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Test Date</th>
                    <th>Diagnostic Lab</th>
                    <th>Status</th>
                    <th>Parameters Tested</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td style={{ fontWeight: 600 }}>
                        {new Date(report.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>{report.labName}</td>
                      <td>
                        <StatusBadge status={report.overallStatus} />
                      </td>
                      <td>{report.parameters?.length || 0} Biomarkers</td>
                      <td>
                        <Link to={`/reports/${report._id}`} className="btn btn-secondary btn-sm">
                          View Report Analysis
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile Summary */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Detailed Patient Health Profile</h3>

          {!profile ? (
            <p style={{ color: 'var(--text-muted)' }}>Patient profile not completed.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Height / Weight / BMI</span>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {profile.heightCm} cm • {profile.weightKg} kg
                  {profile.heightCm && profile.weightKg && (
                    <span style={{ color: 'var(--primary-teal)', marginLeft: '8px' }}>
                      (BMI: {(profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)})
                    </span>
                  )}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Waist / Hip Circumference</span>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {profile.waistCm ? `${profile.waistCm} cm` : 'N/A'} / {profile.hipCm ? `${profile.hipCm} cm` : 'N/A'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Lifestyle Habits</span>
                <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  Activity: {profile.physicalActivity} • Diet: {profile.foodPreference} <br />
                  Smoking: {profile.smoking} • Alcohol: {profile.alcohol}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Current Medications</span>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{profile.medications || 'None recorded'}</p>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Known Medical Conditions</span>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {profile.conditions && profile.conditions.length > 0 ? profile.conditions.join(', ') : 'None'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Allergies</span>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{profile.allergies || 'None'}</p>
              </div>

              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Family History</span>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{profile.familyHistory || 'None'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Trends */}
      {activeTab === 'trends' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Biomarker Historical Trends</h3>
          {!trends || !trends.parameterNames || trends.parameterNames.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No historical trend data available for this patient.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {trends.parameterNames.map((paramName) => {
                const dataPoints = trends.trends[paramName];
                return (
                  <div key={paramName} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>{paramName}</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {dataPoints.map((dp, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{dp.formattedDate}</span>
                          <strong style={{ fontSize: '0.9375rem' }}>{dp.value} {dp.unit}</strong>
                          <span className={`status-badge status-${dp.status}`} style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                            {dp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorPatientDetailPage;
