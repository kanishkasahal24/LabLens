import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, ShieldCheck, LogOut, Activity } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : 'Active Member';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Health Profile</h1>
          <p className="page-subtitle">Account security & system configuration</p>
        </div>
      </div>

      <div style={{ maxWidth: '640px' }}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--deep-navy)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              {initials}
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {user.name}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary-teal-light)', color: 'var(--primary-teal)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginTop: '6px' }}>
                <ShieldCheck size={14} />
                <span>Verified Patient Profile</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Full Registered Name</div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Email Address</div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Member Since</div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{memberSince}</div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              LabLens v1.0 MVP Patient Portal
            </span>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
