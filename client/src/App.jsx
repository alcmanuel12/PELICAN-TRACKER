import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./components/Home";
import { LoginView } from './components/Driver/LoginView';
import { DriverView } from './components/Driver/DriverView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { NotFound } from './components/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StopsProvider } from './context/StopsContext';
import { api } from './utils/api';

const ProtectedRoute = ({ isAllowed, children }) => {
  if (!isAllowed) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.name) setUser(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const res = await api.post('/api/login', { username, password });
      const data = await res.json();
      if (data.success) {
        setUser({ name: data.name, role: data.role });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Error al conectar con el servidor" };
    }
  };

  const handleLogout = async () => {
    await api.post('/api/logout').catch(() => {});
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-slate-900" />;

  return (
    <ErrorBoundary>
    <StopsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/driver" />
            ) : (
              <LoginView onLogin={handleLogin} />
            )
          } />

          <Route
            path="/driver"
            element={
              <ProtectedRoute isAllowed={!!user && user.role === 'driver'}>
                <DriverView onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute isAllowed={!!user && user.role === 'admin'}>
                <AdminDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StopsProvider>
    </ErrorBoundary>
  );
}

export default App;
