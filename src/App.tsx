import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Proveedor de Autenticación y Paciente
import { AuthProvider,useAuth } from './context/Auth';
import { PatientProvider } from './context/PatientContext';

// Vistas
import Login from './pages/login';
import PatientLayout from './layouts/PatientLayout';
import DashboardMedico from './pages/DashboardMedico';
import PortalPaciente from './pages/PortalDelPaciente';
import SimuladorFinanciero from './pages/SimuladorFinanciero';
import EducacionPage from './pages/paciente/EducacionPage';

// Módulos Médico
import DashboardPage from './pages/medico/DashboardPage';
import PacientesPage from './pages/medico/PacientesPage';
import AgendaPage from './pages/medico/AgendaPage';
import ReportesPage from './pages/medico/ReportesPage';
import GuiasPage from './pages/medico/GuiasPage';

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
      {/* Rutas exclusivas Médico usando su propio layout SidebarProvider */}
      {role === 'MEDICO' && (
        <Route path="/*" element={<DashboardMedico />}>
          <Route index element={<DashboardPage />} />
          <Route path="pacientes" element={<PacientesPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="guias" element={<GuiasPage />} />
        </Route>
      )}

      {/* Rutas exclusivas Paciente */}
      {role === 'PACIENTE' && (
        <Route element={<PatientLayout />}>
          <Route path="/paciente" element={<PortalPaciente />} />
          <Route path="/simulador" element={<SimuladorFinanciero />} />
          <Route path="/educacion/:tema" element={<EducacionPage />} />
        </Route>
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<ProtectedRoutes />} />
          </Routes>
        </Router>
      </PatientProvider>
    </AuthProvider>
  );
}

export default App;