import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Admin from './pages/Admin';
import Home from './pages/Home';
import { NavigationBar } from './components/NavigationBar';

import { useUserLocation } from './contexts/LocationContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './components/ui/button';

const ProtectedLayout = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] text-white">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/auth" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/social-feed" />;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <NavigationBar />
      {children}
    </div>
  );
};

function App() {
  const { user } = useAuth();
  const { isLoadingLocation, locationError } = useUserLocation();

  if (isLoadingLocation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent 
                          rounded-full animate-spin mx-auto mb-4"
          ></div>
          <h2 className="text-xl font-semibold text-white mb-2">Detecting Your Location</h2>
          <p className="text-gray-400">This helps us show you nearby civic issues</p>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md text-center p-6">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Location Access Required</h2>
          <p className="text-gray-400 mb-4">{locationError}</p>
          <p className="text-sm text-gray-500 mb-6">
            Please enable location permissions in your browser settings to use Civic Sense AI.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/social-feed"
          element={
            <ProtectedLayout>
              <Feed />
            </ProtectedLayout>
          }
        />

        <Route
          path="/my-reports"
          element={
            <ProtectedLayout>
              <Feed /> {/* We will reuse feed for my-reports later or build it */}
            </ProtectedLayout>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedLayout requireAdmin>
              <Admin />
            </ProtectedLayout>
          }
        />

        {/* Legacy redirect */}
        <Route path="/feed" element={<Navigate to="/social-feed" />} />
        <Route path="*" element={<Navigate to={user ? '/social-feed' : '/'} />} />
      </Routes>
    </Router>
  );
}

export default App;
