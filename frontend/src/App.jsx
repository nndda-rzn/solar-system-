import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useAuthStore from './stores/authStore';

// Critical pages - loaded immediately
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Lazy-loaded pages
const Explore = lazy(() => import('./pages/Explore'));
const PlanetDetail = lazy(() => import('./pages/PlanetDetail'));
const Compare = lazy(() => import('./pages/Compare'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      checkAuth();
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/planet/:name" element={<PlanetDetail />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
