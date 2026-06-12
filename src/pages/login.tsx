import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { db } from '../db/mockDb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calcularEdad, calcularRiesgoSCORE2 } from '@/lib/clinical';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState(db.getAll());
  const [selectedPatientId, setSelectedPatientId] = useState('');

  useEffect(() => {
    // Forzar recarga si la base de datos no tiene 2 pacientes
    if (db.getAll().length < 2) {
      localStorage.removeItem('serverStartTime');
      window.location.reload();
    } else {
      setSelectedPatientId(db.getAll()[0]?.id || '');
    }
  }, []);

  const handleLogin = (role: 'MEDICO' | 'PACIENTE') => {
    login(role);
    
    if (role === 'MEDICO') {
      navigate('/');
    } else {
      // Guardar el paciente seleccionado en localStorage para que el portal sepa quién somos
      localStorage.setItem('currentPatientId', selectedPatientId);
      navigate('/paciente');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-transparent font-sans">
      {/* Background Decorativo Premium */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300/30 via-transparent to-transparent opacity-80 mix-blend-multiply" />
        <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-300/30 via-transparent to-transparent blur-3xl opacity-60 mix-blend-multiply" />
      </div>

      {/* Tarjeta de Login Glassmorphism */}
      <div className="relative z-10 w-full max-w-[440px] px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden ring-1 ring-slate-900/5">
          
          <div className="p-10 pb-6 text-center border-b border-slate-200/50 bg-gradient-to-b from-blue-50/50 to-transparent">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 ring-1 ring-white/60">
              <HeartPulse className="text-white w-10 h-10 animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              MediConnect <span className="text-blue-600 font-light">Pro</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Acceso Seguro a la Red de Salud
            </p>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Sección Médico */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Personal de Salud</p>
              <button 
                onClick={() => handleLogin('MEDICO')}
                className="group relative w-full flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white p-4 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg border border-blue-400/20 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 font-semibold">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  Ingreso Médico
                </div>
                <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium rounded-full border border-slate-100">O SIMULAR COMO PACIENTE</span>
              </div>
            </div>

            {/* Sección Paciente */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 ml-1">
                  Identidad Virtual:
                </label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="w-full bg-white/60 border-slate-200 text-slate-700 h-12 rounded-xl focus:ring-emerald-500/50 shadow-sm backdrop-blur-sm">
                    <SelectValue placeholder="Seleccionar Paciente">
                      {(() => {
                        const p = pacientes.find(x => x.id === selectedPatientId);
                        if (!p) return null;
                        const edad = calcularEdad(p.fechaNacimiento || '1970-01-01');
                        const lastM = p.mediciones[p.mediciones.length - 1];
                        const riesgo = lastM ? calcularRiesgoSCORE2(edad, lastM.presionSistolica) : 'BAJO';
                        return (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.nombre}</span>
                            <span className="text-slate-500 text-xs px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">Riesgo {riesgo}</span>
                          </div>
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-700">
                    {pacientes.map(p => {
                      const edad = calcularEdad(p.fechaNacimiento || '1970-01-01');
                      const lastM = p.mediciones[p.mediciones.length - 1];
                      const riesgo = lastM ? calcularRiesgoSCORE2(edad, lastM.presionSistolica) : 'BAJO';
                      return (
                        <SelectItem key={p.id} value={p.id} className="focus:bg-slate-100 focus:text-slate-900">
                          {p.nombre} <span className="text-slate-400 text-xs ml-1">(Riesgo {riesgo})</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <button 
                onClick={() => handleLogin('PACIENTE')}
                className="group w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 p-4 rounded-2xl transition-all duration-300 shadow-sm font-semibold h-[56px] hover:-translate-y-0.5"
              >
                <User className="w-5 h-5" />
                Acceder al Portal
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer Text */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Plataforma de Prototipo © {new Date().getFullYear()}<br />
          Para uso académico y de simulación
        </p>
      </div>
    </div>
  );
}