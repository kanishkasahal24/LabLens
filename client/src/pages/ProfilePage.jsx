import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, ShieldCheck, LogOut, Stethoscope, Link as LinkIcon, UserPlus, CheckCircle2, AlertCircle, Trash2, Edit3, Save } from 'lucide-react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isDoctor = user?.role === 'doctor';
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Doctor search & link request state for patients
  const [doctorCodeInput, setDoctorCodeInput] = useState('');
  const [foundDoctor, setFoundDoctor] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [linking, setLinking] = useState(false);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchProfileAndLinks = async () => {
    try {
      setLoading(true);
      const [profileRes, linksRes] = await Promise.all([
        api.get('/profile'),
        api.get('/links')
      ]);

      setProfile(profileRes.data.profile);
      setLinks(linksRes.data.links || []);

      if (profileRes.data.profile) {
        if (isDoctor) {
          setFormData({
            licenseNumber: profileRes.data.profile.licenseNumber || '',
            specialisation: profileRes.data.profile.specialisation || 'General Medicine',
            clinic: profileRes.data.profile.clinic || ''
          });
        } else {
          const p = profileRes.data.profile;
          setFormData({
            fullName: p.fullName || user.name,
            dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : '',
            sex: p.sex || 'male',
            phone: p.phone || '',
            heightCm: p.heightCm || '',
            weightKg: p.weightKg || '',
            waistCm: p.waistCm || '',
            hipCm: p.hipCm || '',
            bloodGroup: p.bloodGroup || 'Unknown',
            physicalActivity: p.physicalActivity || 'sedentary',
            smoking: p.smoking || 'never',
            alcohol: p.alcohol || 'never',
            foodPreference: p.foodPreference || 'vegetarian',
            medications: p.medications || '',
            conditions: Array.isArray(p.conditions) ? p.conditions.join(', ') : '',
            familyHistory: p.familyHistory || '',
            allergies: p.allergies || '',
            pregnant: Boolean(p.pregnant)
          });
        }
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndLinks();
  }, []);

  const handleLookupDoctor = async (e) => {
    e.preventDefault();
    setLookupError('');
    setFoundDoctor(null);

    if (!doctorCodeInput.trim()) {
      setLookupError('Please enter a doctor code');
      return;
    }

    try {
      const res = await api.get(`/doctors/${doctorCodeInput.trim()}`);
      setFoundDoctor(res.data.doctor);
    } catch (err) {
      setLookupError(err.response?.data?.message || 'Doctor not found with this code');
    }
  };

  const handleSendLinkRequest = async () => {
    if (!foundDoctor) return;
    try {
      setLinking(true);
      await api.post('/links', { doctorCode: foundDoctor.doctorCode });
      setMessage({ type: 'success', text: `Link request sent to Dr. ${foundDoctor.name}` });
      setDoctorCodeInput('');
      setFoundDoctor(null);
      fetchProfileAndLinks();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send link request' });
    } finally {
      setLinking(false);
    }
  };

  const handleRevokeLink = async (linkId) => {
    try {
      await api.delete(`/links/${linkId}`);
      setMessage({ type: 'success', text: 'Doctor link revoked successfully' });
      fetchProfileAndLinks();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to revoke link' });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await api.put('/profile', formData);
      setMessage({ type: 'success', text: 'Profile details saved successfully!' });
      setIsEditing(false);
      fetchProfileAndLinks();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isDoctor ? 'Doctor Clinical Profile' : 'Personal Health Profile'}</h1>
          <p className="page-subtitle">Manage profile details and doctor-patient connections</p>
        </div>
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'error-banner' : 'card'} style={{
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: message.type === 'error' ? 'var(--status-high-bg)' : 'var(--status-normal-bg)',
          color: message.type === 'error' ? 'var(--status-high-text)' : 'var(--status-normal-text)',
          borderColor: message.type === 'error' ? 'var(--status-high-border)' : 'var(--status-normal-border)'
        }}>
          {message.text}
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: isDoctor ? 'var(--primary-teal)' : 'var(--deep-navy)',
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
                {isDoctor ? <Stethoscope size={14} /> : <ShieldCheck size={14} />}
                <span>{isDoctor ? `Licensed Physician (${user.doctorCode || 'N/A'})` : 'Patient Account'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={16} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile}>
            {isDoctor ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Medical License Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialisation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.specialisation || ''}
                    onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinic / Hospital Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.clinic || ''}
                    onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Biological Sex *</label>
                    <select
                      className="form-select"
                      value={formData.sex || 'male'}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Height (cm) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.heightCm || ''}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight (kg) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.weightKg || ''}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Physical Activity</label>
                    <select
                      className="form-select"
                      value={formData.physicalActivity || 'sedentary'}
                      onChange={(e) => setFormData({ ...formData, physicalActivity: e.target.value })}
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="active">Active</option>
                      <option value="very_active">Very Active</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-select"
                      value={formData.bloodGroup || 'Unknown'}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Medications</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.medications || ''}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Known Conditions (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.conditions || ''}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div>
            {isDoctor ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>License Number</span>
                  <p style={{ fontWeight: 600 }}>{profile?.licenseNumber || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Doctor Unique Code</span>
                  <p style={{ fontWeight: 700, color: 'var(--primary-teal)', fontSize: '1.1rem' }}>{user.doctorCode}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Specialisation</span>
                  <p style={{ fontWeight: 600 }}>{profile?.specialisation || 'General Medicine'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Clinic / Practice</span>
                  <p style={{ fontWeight: 600 }}>{profile?.clinic || 'Private Practice'}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Date of Birth</span>
                  <p style={{ fontWeight: 600 }}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Sex / Height / Weight</span>
                  <p style={{ fontWeight: 600 }}>{profile ? `${profile.sex?.toUpperCase()} • ${profile.heightCm} cm • ${profile.weightKg} kg` : 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Blood Group</span>
                  <p style={{ fontWeight: 600 }}>{profile?.bloodGroup || 'Unknown'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Medications</span>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{profile?.medications || 'None recorded'}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Health Conditions</span>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {profile?.conditions && profile.conditions.length > 0 ? profile.conditions.join(', ') : 'None recorded'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Doctor-Patient Links Section */}
      {!isDoctor && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <LinkIcon size={20} style={{ color: 'var(--primary-teal)' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Connect with Doctor</h2>
          </div>

          <form onSubmit={handleLookupDoctor} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Doctor Unique Code (e.g. DOC-DEMO1)"
              value={doctorCodeInput}
              onChange={(e) => setDoctorCodeInput(e.target.value)}
              style={{ textTransform: 'uppercase' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
              Lookup Doctor
            </button>
          </form>

          {lookupError && (
            <p style={{ color: 'var(--status-high-text)', fontSize: '0.875rem', marginBottom: '12px' }}>
              {lookupError}
            </p>
          )}

          {foundDoctor && (
            <div style={{ padding: '16px', border: '1px solid var(--primary-teal-light)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>{foundDoctor.name}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {foundDoctor.specialisation} • {foundDoctor.clinic || 'Practice'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSendLinkRequest}
                disabled={linking}
              >
                <UserPlus size={16} />
                <span>{linking ? 'Sending...' : 'Request Doctor Link'}</span>
              </button>
            </div>
          )}

          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '20px', marginBottom: '12px' }}>
            Your Doctor Connection Requests
          </h3>

          {links.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No doctor link requests created yet. Enter a doctor code above to share reports securely.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {links.map((link) => (
                <div key={link._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{link.doctor?.name || 'Doctor'}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Code: {link.doctor?.doctorCode} • {link.doctorProfile?.specialisation || 'General Medicine'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`status-badge status-${link.status === 'active' ? 'normal' : link.status === 'pending' ? 'low' : 'high'}`}>
                      <span className="status-badge-dot" />
                      {link.status}
                    </span>
                    {link.status !== 'revoked' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRevokeLink(link._id)}
                        title="Revoke access"
                      >
                        <Trash2 size={14} />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account actions footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          LabLens Multi-Role Clinical Platform
        </span>
        <button onClick={handleLogout} className="btn btn-danger btn-sm">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
