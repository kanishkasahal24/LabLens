import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import AddReportPage from './pages/AddReportPage';
import ReportDetailPage from './pages/ReportDetailPage';
import TrendsPage from './pages/TrendsPage';
import ProfilePage from './pages/ProfilePage';

// Doctor Pages
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorRequestsPage from './pages/DoctorRequestsPage';
import DoctorPatientDetailPage from './pages/DoctorPatientDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Onboarding Route (both Patient and Doctor) */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Patient Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute roles={['patient']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-report"
                element={
                  <ProtectedRoute roles={['patient']}>
                    <AddReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trends"
                element={
                  <ProtectedRoute roles={['patient']}>
                    <TrendsPage />
                  </ProtectedRoute>
                }
              />

              {/* Report Detail View (Accessible by Patient owner OR Doctor with active link) */}
              <Route
                path="/reports/:id"
                element={
                  <ProtectedRoute>
                    <ReportDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Doctor Routes */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute roles={['doctor']}>
                    <DoctorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/requests"
                element={
                  <ProtectedRoute roles={['doctor']}>
                    <DoctorRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/patients/:id"
                element={
                  <ProtectedRoute roles={['doctor']}>
                    <DoctorPatientDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
