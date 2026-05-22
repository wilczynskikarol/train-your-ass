import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { FullPageSpinner } from './components/ui/Spinner';
import { BottomTabBar } from './components/ui/BottomTabBar';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Workout } from './pages/Workout';
import { History } from './pages/History';
import { Measurements } from './pages/Measurements';
import { Exercises } from './pages/Exercises';
import { Settings } from './pages/Settings';
import { useEffect, useState } from 'react';
import { getUserSettings } from './firebase/helpers';

const TAB_ROUTES = ['/', '/workout', '/history', '/measurements', '/exercises'];

function AppShell({ children }) {
  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      {children}
      <BottomTabBar />
    </div>
  );
}

function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const { ready } = useTheme();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!user) {
      setOnboardingChecked(true);
      return;
    }
    getUserSettings(user.uid).then(settings => {
      setNeedsOnboarding(!settings?.theme);
      setOnboardingChecked(true);
    }).catch(() => {
      setOnboardingChecked(true);
    });
  }, [user?.uid]);

  if (loading || !ready || !onboardingChecked) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;

  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  const { ready } = useTheme();

  if (loading || !ready) return <FullPageSpinner />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route
        path="/"
        element={
          <AuthGuard>
            <AppShell>
              <Dashboard />
            </AppShell>
          </AuthGuard>
        }
      />
      <Route
        path="/workout"
        element={
          <AuthGuard>
            <AppShell>
              <Workout />
            </AppShell>
          </AuthGuard>
        }
      />
      <Route
        path="/history"
        element={
          <AuthGuard>
            <AppShell>
              <History />
            </AppShell>
          </AuthGuard>
        }
      />
      <Route
        path="/measurements"
        element={
          <AuthGuard>
            <AppShell>
              <Measurements />
            </AppShell>
          </AuthGuard>
        }
      />
      <Route
        path="/exercises"
        element={
          <AuthGuard>
            <AppShell>
              <Exercises />
            </AppShell>
          </AuthGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthGuard>
            <Settings />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
