import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, User, ActivitySquare, HeartPulse } from 'lucide-react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

const OnboardingPage = () => {
  const { user, updateUserProfileState } = useAuth();
  const navigate = useNavigate();

  const isDoctor = user?.role === 'doctor';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Doctor Form State
  const [doctorForm, setDoctorForm] = useState({
    licenseNumber: '',
    specialisation: 'General Medicine',
    clinic: ''
  });

  // Patient Form State
  const [patientForm, setPatientForm] = useState({
    fullName: user?.name || '',
    dateOfBirth: '',
    sex: 'male',
    phone: '',
    heightCm: '',
    weightKg: '',
    waistCm: '',
    hipCm: '',
    bloodGroup: 'Unknown',
    physicalActivity: 'sedentary',
    smoking: 'never',
    alcohol: 'never',
    foodPreference: 'vegetarian',
    medications: '',
    conditions: '',
    familyHistory: '',
    allergies: '',
    pregnant: false
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user?.profileCompleted) {
      navigate(isDoctor ? '/doctor' : '/dashboard');
    }
  }, [user, isDoctor, navigate]);

  const validateStep1 = () => {
    const errors = {};
    if (!patientForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!patientForm.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(patientForm.dateOfBirth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    if (!patientForm.sex) errors.sex = 'Biological sex is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    const h = Number(patientForm.heightCm);
    if (!patientForm.heightCm || isNaN(h) || h < 30 || h > 300) {
      errors.heightCm = 'Height must be between 30 cm and 300 cm';
    }
    const w = Number(patientForm.weightKg);
    if (!patientForm.weightKg || isNaN(w) || w < 2 || w > 500) {
      errors.weightKg = 'Weight must be between 2 kg and 500 kg';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDoctor = () => {
    const errors = {};
    if (!doctorForm.licenseNumber.trim()) {
      errors.licenseNumber = 'Medical license number is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitPatient = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.put('/profile', patientForm);
      updateUserProfileState({ profileCompleted: true });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDoctor = async (e) => {
    e.preventDefault();
    if (!validateDoctor()) return;
    setError('');

    try {
      setLoading(true);
      await api.put('/profile', doctorForm);
      updateUserProfileState({ profileCompleted: true });
      navigate('/doctor');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor profile');
    } finally {
      setLoading(false);
    }
  };

  if (isDoctor) {
    return (
      <div className="auth-wrapper">
        <div className="card auth-card" style={{ maxWidth: '520px' }}>
          <div className="auth-header">
            <div className="auth-brand">
              <Activity size={28} />
              <span>LabLens Doctor Onboarding</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Complete Clinical Profile
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Set up your medical license and practice details
            </p>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitDoctor}>
            <div className="form-group">
              <label className="form-label">Medical License Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MD-98765"
                value={doctorForm.licenseNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
              />
              {fieldErrors.licenseNumber && <p className="form-error">{fieldErrors.licenseNumber}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Specialisation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. General Medicine / Cardiology"
                value={doctorForm.specialisation}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialisation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinic / Hospital Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. City General Hospital"
                value={doctorForm.clinic}
                onChange={(e) => setDoctorForm({ ...doctorForm, clinic: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
              {loading ? 'Saving Profile...' : 'Complete Profile & Continue'}
              <CheckCircle2 size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '20px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="auth-brand" style={{ justifyContent: 'center' }}>
            <Activity size={28} />
            <span>Patient Onboarding</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            Step {step} of 3: {step === 1 ? 'About You' : step === 2 ? 'Body Vitals' : 'Lifestyle & History'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            We need your baseline profile to calculate accurate clinical reference ranges and health scores.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', backgroundColor: step >= 1 ? 'var(--primary-teal)' : 'var(--border-color)' }} />
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', backgroundColor: step >= 2 ? 'var(--primary-teal)' : 'var(--border-color)' }} />
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', backgroundColor: step >= 3 ? 'var(--primary-teal)' : 'var(--border-color)' }} />
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-teal)' }}>
              <User size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Step 1: Personal Details</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={patientForm.fullName}
                onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
              />
              {fieldErrors.fullName && <p className="form-error">{fieldErrors.fullName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                className="form-input"
                value={patientForm.dateOfBirth}
                onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
              />
              {fieldErrors.dateOfBirth && <p className="form-error">{fieldErrors.dateOfBirth}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Biological Sex *</label>
              <select
                className="form-select"
                value={patientForm.sex}
                onChange={(e) => setPatientForm({ ...patientForm, sex: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {fieldErrors.sex && <p className="form-error">{fieldErrors.sex}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1-555-0100"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                <span>Next: Body Vitals</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-teal)' }}>
              <ActivitySquare size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Step 2: Body Measurements</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Height (cm) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="175"
                  value={patientForm.heightCm}
                  onChange={(e) => setPatientForm({ ...patientForm, heightCm: e.target.value })}
                />
                {fieldErrors.heightCm && <p className="form-error">{fieldErrors.heightCm}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="70"
                  value={patientForm.weightKg}
                  onChange={(e) => setPatientForm({ ...patientForm, weightKg: e.target.value })}
                />
                {fieldErrors.weightKg && <p className="form-error">{fieldErrors.weightKg}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Waist Circumference (cm, optional)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 85"
                  value={patientForm.waistCm}
                  onChange={(e) => setPatientForm({ ...patientForm, waistCm: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hip Circumference (cm, optional)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 95"
                  value={patientForm.hipCm}
                  onChange={(e) => setPatientForm({ ...patientForm, hipCm: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group (Optional)</label>
              <select
                className="form-select"
                value={patientForm.bloodGroup}
                onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
              >
                <option value="Unknown">Don't Know / Unknown</option>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                <span>Next: History & Lifestyle</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-teal)' }}>
              <HeartPulse size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Step 3: Lifestyle & Medical History (All Optional)</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Physical Activity</label>
                <select
                  className="form-select"
                  value={patientForm.physicalActivity}
                  onChange={(e) => setPatientForm({ ...patientForm, physicalActivity: e.target.value })}
                >
                  <option value="sedentary">Sedentary (Little/no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very_active">Very Active (Heavy training)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Food Preference</label>
                <select
                  className="form-select"
                  value={patientForm.foodPreference}
                  onChange={(e) => setPatientForm({ ...patientForm, foodPreference: e.target.value })}
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Smoking Status</label>
                <select
                  className="form-select"
                  value={patientForm.smoking}
                  onChange={(e) => setPatientForm({ ...patientForm, smoking: e.target.value })}
                >
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker</option>
                  <option value="current">Current Smoker</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Alcohol Consumption</label>
                <select
                  className="form-select"
                  value={patientForm.alcohol}
                  onChange={(e) => setPatientForm({ ...patientForm, alcohol: e.target.value })}
                >
                  <option value="never">Never / Non-drinker</option>
                  <option value="occasional">Occasional</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
            </div>

            {patientForm.sex === 'female' && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={patientForm.pregnant}
                    onChange={(e) => setPatientForm({ ...patientForm, pregnant: e.target.checked })}
                  />
                  <span>Currently Pregnant</span>
                </label>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Current Medications</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Metformin 500mg, Atorvastatin 10mg"
                value={patientForm.medications}
                onChange={(e) => setPatientForm({ ...patientForm, medications: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Known Health Conditions (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                value={patientForm.conditions}
                onChange={(e) => setPatientForm({ ...patientForm, conditions: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Allergies</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Penicillin, Peanuts"
                value={patientForm.allergies}
                onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmitPatient} disabled={loading}>
                {loading ? 'Saving Baseline Profile...' : 'Complete Baseline Profile'}
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
