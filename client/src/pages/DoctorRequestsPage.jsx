import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import api from '../api/axios';

const DoctorRequestsPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/links');
      setLinks(res.data.links || []);
    } catch (err) {
      console.error('Failed to load link requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleUpdateStatus = async (linkId, newStatus) => {
    try {
      setActionMessage({ type: '', text: '' });
      await api.patch(`/links/${linkId}`, { status: newStatus });
      setActionMessage({
        type: 'success',
        text: `Link request ${newStatus === 'active' ? 'accepted' : 'rejected'} successfully.`
      });
      fetchLinks();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update link status'
      });
    }
  };

  const pendingLinks = links.filter((l) => l.status === 'pending');
  const activeLinks = links.filter((l) => l.status === 'active');
  const revokedLinks = links.filter((l) => l.status === 'revoked');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Connection Requests</h1>
          <p className="page-subtitle">Accept or reject pending doctor-patient link requests</p>
        </div>
      </div>

      {actionMessage.text && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: actionMessage.type === 'error' ? 'var(--status-high-bg)' : 'var(--status-normal-bg)',
          color: actionMessage.type === 'error' ? 'var(--status-high-text)' : 'var(--status-normal-text)',
          border: `1px solid ${actionMessage.type === 'error' ? 'var(--status-high-border)' : 'var(--status-normal-border)'}`
        }}>
          {actionMessage.text}
        </div>
      )}

      {/* Pending Requests */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <UserCheck size={20} style={{ color: 'var(--primary-teal)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            Pending Link Requests ({pendingLinks.length})
          </h2>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading pending requests...</p>
        ) : pendingLinks.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            No pending patient requests. When patients enter your doctor code in their profile, their link requests will appear here.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {pendingLinks.map((link) => (
              <div
                key={link._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'white'
                }}
              >
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {link.patient?.name || 'Patient'}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {link.patient?.email} • Requested: {new Date(link.createdAt).toLocaleDateString()}
                  </p>
                  {link.patientProfile && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--primary-teal)', marginTop: '4px' }}>
                      {link.patientProfile.sex?.toUpperCase()} • DOB: {new Date(link.patientProfile.dateOfBirth).toLocaleDateString()} • {link.patientProfile.phone || 'No phone'}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUpdateStatus(link._id, 'revoked')}
                    style={{ color: 'var(--status-high-text)' }}
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(link._id, 'active')}
                  >
                    <CheckCircle2 size={16} />
                    <span>Accept Request</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Connected Patients */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>
          Active Connected Patients ({activeLinks.length})
        </h2>

        {activeLinks.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No active patient connections.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {activeLinks.map((link) => (
              <div
                key={link._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{link.patient?.name}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                    {link.patient?.email}
                  </span>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleUpdateStatus(link._id, 'revoked')}
                >
                  Revoke Connection
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRequestsPage;
