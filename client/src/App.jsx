import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // <--- Faltaba Navigate aquí
import Home from "./components/Home"; // Asegúrate de que esta ruta sea correcta
import { LoginView } from './components/Driver/LoginView'; // Asegúrate de que esta ruta sea correcta
import { DriverView } from './components/Driver/DriverView'; // Asegúrate de que esta ruta sea correcta

// --- COMPONENTE PROTECTED ROUTE (ESTO FALTABA) ---
// Este componente actúa como un portero de discoteca.
// Si no tienes permiso (isAllowed), te manda a casa (Navigate to="/").
const ProtectedRoute = ({ isAllowed, children }) => {
  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  // 1. ESTADO DE USUARIO
  const [user, setUser] = useState(() => {
    // Intentamos recuperar la sesión guardada
    const savedUser = localStorage.getItem('pelicanUser');
    // Si hay error al parsear JSON (a veces pasa), devolvemos null
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // 2. FUNCIÓN DE LOGIN
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

        {/* RUTA ADMIN (Protegida) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute isAllowed={!!user && user.role === 'admin'}>
              <div className="p-10 text-white bg-slate-800 h-screen">
                <h1 className="text-3xl font-bold">Panel de Administrador 👮‍♂️</h1>
                <p>Bienvenido, {user?.name}</p>
                <button 
                  onClick={handleLogout} 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
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