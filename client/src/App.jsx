import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./components/Home";
import { LoginView } from './components/Driver/LoginView';
import { DriverView } from './components/Driver/DriverView';
// 1. IMPORTAMOS EL NUEVO DASHBOARD AQUÍ 👇
import { AdminDashboard } from './components/Admin/AdminDashboard'; 

// --- COMPONENTE PROTECTED ROUTE ---
const ProtectedRoute = ({ isAllowed, children }) => {
  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  // 1. ESTADO DE USUARIO
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pelicanUser');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // 2. LOGIN
  const handleLogin = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('pelicanUser', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      return { success: false, message: "Error al conectar con el servidor" };
    }
  };

  // 3. LOGOUT
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pelicanUser');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: EL MAPA */}
        <Route path="/" element={<Home />} />

        {/* RUTA DE LOGIN */}
        <Route path="/login" element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/driver" />
          ) : (
            <LoginView onLogin={handleLogin} />
          )
        } />

        {/* RUTA CONDUCTOR (Protegida) */}
        <Route 
          path="/driver" 
          element={
            <ProtectedRoute isAllowed={!!user && user.role === 'driver'}>
              <DriverView onLogout={handleLogout} /> 
            </ProtectedRoute>
          } 
        />

        {/* RUTA ADMIN (AQUÍ ESTÁ EL CAMBIO IMPORTANTE 🛠️) */}
        {/* Antes tenías un <div> simple, ahora ponemos el componente AdminDashboard */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute isAllowed={!!user && user.role === 'admin'}>
               {/* 👇 AQUÍ CONECTAMOS LA TORRE DE CONTROL */}
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        {/* CUALQUIER OTRA RUTA -> AL MAPA */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;