import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { db } from '../db/mockDb';

export default function PatientLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener el paciente actual del localStorage
  const currentPatientId = localStorage.getItem('currentPatientId');
  const patient = currentPatientId ? db.getById(currentPatientId) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de Navegación Superior (Top Navbar) */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Botón de retroceso si no estamos en el portal principal */}
            {location.pathname !== '/paciente' && (
              <button 
                onClick={() => navigate('/paciente')}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-muted/50"
                title="Volver al Portal"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/paciente')}>
              <HeartPulse className="text-red-600 w-6 h-6" />
              <span className="font-bold text-gray-800 text-lg hidden sm:inline-block">Prevención<span className="text-blue-600">Cardio</span> Paciente</span>
              <span className="font-bold text-gray-800 text-lg sm:hidden">PC <span className="text-blue-600">Paciente</span></span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-none">{patient?.nombre || 'Paciente'}</p>
              <p className="text-xs text-muted-foreground mt-1">Portal de Autocuidado</p>
            </div>
            
            <div className="h-8 w-px bg-border hidden sm:block"></div>
            
            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <LogOut className="w-5 h-5"/>
            </button>
          </div>
          
        </div>
      </header>

      {/* Área de Contenido Principal ocupando todo el ancho */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
