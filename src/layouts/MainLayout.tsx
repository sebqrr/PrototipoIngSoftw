import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  HeartPulse, 
  Activity, 
  AlertCircle, 
  BarChart3, 
  LineChart, 
  Image as ImageIcon, 
  FileText, 
  User, 
  Calculator, 
  Settings 
} from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();

  // Todas las rutas del MVP integradas de una vez
  const navItems = [
    { name: 'Ingreso Clínico', path: '/', icon: Activity }, // HU-01
    { name: 'Cálculo SCORE2', path: '/riesgo', icon: BarChart3 }, // HU-02
    { name: 'Panel de Alertas', path: '/alertas', icon: AlertCircle }, // HU-03 y HU-08
    { name: 'Evolución Gráfica', path: '/evolucion', icon: LineChart }, // HU-06
    { name: 'Visor DICOM / PDF', path: '/visor', icon: ImageIcon }, // HU-05
    { name: 'Receta Electrónica', path: '/recetas', icon: FileText }, // HU-12
    { name: 'Portal Paciente', path: '/paciente', icon: User }, // HU-07 y HU-13
    { name: 'Simulador Financiero', path: '/simulador', icon: Calculator }, // HU-15
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <HeartPulse className="text-red-600 w-8 h-8" />
          <h1 className="text-lg font-bold text-gray-800 leading-tight">
            Prevención<br/><span className="text-blue-600">Cardio UANDES</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-4">
            Gestión Clínica
          </div>
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">
            Módulos del Paciente
          </div>
          {navItems.slice(6, 8).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-gray-700 font-medium w-full">
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col h-screen">
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center gap-3">
          <HeartPulse className="text-red-600 w-6 h-6" />
          <span className="font-bold text-gray-800">PrevenciónCardio UANDES</span>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {/* Aquí se inyectan las vistas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}