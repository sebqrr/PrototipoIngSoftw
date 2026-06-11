import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Proveedor de Autenticación
import { AuthProvider,useAuth } from './context/Auth';

// Vistas
import Login from './pages/login';
import MainLayout from './layouts/MainLayout';
import IngresoDatos from './pages/hu01';
import CalculoRiesgo from './pages/CalculoRiesgo';
import PanelAlertas from './pages/PanelDeAlertas';
import EvolucionGrafica from './pages/EvolucuionGrafica';
import VisorDicom from './pages/VisorDicom';
import RecetaElectronica from './pages/RecetaElectronica';
import PortalPaciente from './pages/PortalDelPaciente';
import SimuladorFinanciero from './pages/SimuladorFinanciero';

// Componente para proteger las rutas
function ProtectedRoutes() {
  const { role } = useAuth();
  const navigate = useNavigate();

  // Si no hay rol, vuelve al login
  useEffect(() => {
    if (!role) {
      navigate('/login');
    } else if (role === 'PACIENTE' && window.location.pathname === '/') {
      // Redirigir al paciente a su portal si intenta entrar al inicio médico
      navigate('/paciente');
    }
  }, [role, navigate]);

  if (!role) return null;

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Rutas exclusivas Médico */}
        {role === 'MEDICO' && (
          <>
            <Route path="/" element={<IngresoDatos />} />
            <Route path="/riesgo" element={<CalculoRiesgo />} />
            <Route path="/alertas" element={<PanelAlertas />} />
            <Route path="/evolucion" element={<EvolucionGrafica />} />
            <Route path="/visor" element={<VisorDicom />} />
            <Route path="/recetas" element={<RecetaElectronica />} />
          </>
        )}

        {/* Rutas exclusivas Paciente */}
        {role === 'PACIENTE' && (
          <>
            <Route path="/paciente" element={<PortalPaciente />} />
            <Route path="/simulador" element={<SimuladorFinanciero />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;