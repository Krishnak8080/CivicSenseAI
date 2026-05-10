import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Admin from './pages/Admin';
import Home from './pages/Home';
import { NavigationBar } from './components/NavigationBar';

const ProtectedLayout = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] text-white">Loading...</div>;
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
        <Route path="*" element={<Navigate to={user ? "/social-feed" : "/"} />} />
      </Routes>
    </Router>
  );
}

export default App;
