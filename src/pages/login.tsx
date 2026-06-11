import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, User } from 'lucide-react';
import { useAuth } from '../context/Auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate(); // Herramienta para cambiar de página

  const handleLogin = (role: 'MEDICO' | 'PACIENTE') => {
    login(role); // Guardamos la sesión en el contexto
    
    // Redirigimos al usuario a su panel correspondiente
    if (role === 'MEDICO') {
      navigate('/');
    } else {
      navigate('/paciente');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-blue-800 p-8 text-center">
          <HeartPulse className="text-red-500 w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">PrevenciónCardio <span className="text-blue-300">UANDES</span></h1>
          <p className="text-blue-100 mt-2 text-sm">Plataforma de Gestión de Riesgo</p>
        </div>
        
        <div className="p-8 space-y-6">
          <p className="text-center text-gray-600 font-medium mb-4">Selecciona tu perfil de acceso para la simulación</p>
          
          <button 
            onClick={() => handleLogin('MEDICO')}
            className="w-full flex items-center justify-center gap-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 p-4 rounded-xl transition font-bold"
          >
            <Stethoscope className="w-6 h-6" />
            Ingreso Personal Médico
          </button>
          
          <button 
            onClick={() => handleLogin('PACIENTE')}
            className="w-full flex items-center justify-center gap-3 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 p-4 rounded-xl transition font-bold"
          >
            <User className="w-6 h-6" />
            Ingreso Paciente Crónico
          </button>
        </div>
      </div>
    </div>
  );
}