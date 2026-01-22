import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ClientDashboard from './pages/ClientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import IntakeFormPage from './pages/IntakeFormPage';
import SessionFormPage from './pages/SessionFormPage';
import CaseHistoryDetail from './pages/CaseHistoryDetail';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'CLIENT' ? '/client/dashboard' : '/provider/dashboard'} replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'CLIENT' ? '/client/dashboard' : '/provider/dashboard'} replace /> : <SignupPage />} />
      
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/intake"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <IntakeFormPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PROVIDER']}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/session/new"
        element={
          <ProtectedRoute allowedRoles={['PROVIDER']}>
            <SessionFormPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/case-history/:id"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'PROVIDER']}>
            <CaseHistoryDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
