import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  HeartPulse, Activity, AlertCircle, BarChart3, LineChart, 
  Image as ImageIcon, FileText, User, Calculator, LogOut
} from 'lucide-react';
import { useAuth } from '../context/Auth';

export default function MainLayout() {
  const location = useLocation();
  const { role, logout } = useAuth();

  // Rutas de Médicos
  const rutasMedico = [
    { name: 'Ingreso Clínico', path: '/', icon: Activity },
    { name: 'Cálculo SCORE2', path: '/riesgo', icon: BarChart3 },
    { name: 'Panel de Alertas', path: '/alertas', icon: AlertCircle },
    { name: 'Evolución Gráfica', path: '/evolucion', icon: LineChart },
    { name: 'Visor DICOM / PDF', path: '/visor', icon: ImageIcon },
    { name: 'Receta Electrónica', path: '/recetas', icon: FileText },
  ];

  // Rutas de Pacientes
  const rutasPaciente = [
    { name: 'Portal Paciente', path: '/paciente', icon: User },
    { name: 'Simulador Financiero', path: '/simulador', icon: Calculator },
  ];

  const rutasActivas = role === 'MEDICO' ? rutasMedico : rutasPaciente;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <HeartPulse className="text-red-600 w-8 h-8" />
          <h1 className="text-lg font-bold text-gray-800 leading-tight">
            Prevención<br/><span className="text-blue-600">Cardio</span>
          </h1>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-sm text-gray-600 font-medium">
          <User className="w-4 h-4" /> 
          Rol: {role === 'MEDICO' ? 'Cardiólogo/Médico' : 'Paciente'}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {rutasActivas.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const colorClass = role === 'MEDICO' ? 'blue' : 'green';
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? `bg-${colorClass}-50 text-${colorClass}-700` 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? `text-${colorClass}-600` : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium w-full transition"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col h-screen">
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeartPulse className="text-red-600 w-6 h-6" />
            <span className="font-bold text-gray-800">PrevenciónCardio</span>
          </div>
          <button onClick={logout} className="text-red-500"><LogOut className="w-5 h-5"/></button>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}