import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, User } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { db } from '../db/mockDb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calcularEdad, calcularRiesgoSCORE2 } from '@/lib/clinical';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

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
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-sm border-border overflow-hidden">
        <div className="bg-dashboard-blue p-8 text-center border-b border-border">
          <div className="bg-white/10 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <HeartPulse className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">PrevenciónCardio <span className="font-normal opacity-80">UANDES</span></CardTitle>
          <CardDescription className="text-dashboard-blue-fg/80 mt-2">Plataforma de Gestión Clínica</CardDescription>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Acceso Clínico</h3>
            <Button 
              onClick={() => handleLogin('MEDICO')}
              className="w-full flex items-center justify-start gap-3 bg-white hover:bg-slate-50 text-dashboard-blue border border-dashboard-blue/20 shadow-sm h-14"
              variant="outline"
            >
              <div className="bg-dashboard-blue/10 p-2 rounded-md">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-semibold text-base">Ingreso Personal Médico</span>
            </Button>
          </div>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground font-medium">Portal de Pacientes</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Identidad a simular:</label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="w-full bg-white h-12 shadow-sm border-border">
                  <SelectValue placeholder="Seleccionar Paciente">
                    {(() => {
                      const p = pacientes.find(x => x.id === selectedPatientId);
                      if (!p) return null;
                      return <span className="font-medium text-foreground">{p.nombre} <span className="text-muted-foreground font-normal ml-1">({p.rut})</span></span>;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map(p => {
                    const edad = calcularEdad(p.fechaNacimiento || '1970-01-01');
                    const lastM = p.mediciones[p.mediciones.length - 1];
                    const riesgo = lastM ? calcularRiesgoSCORE2(edad, lastM.presionSistolica) : 'BAJO';
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre} <span className="text-muted-foreground ml-1">- Riesgo {riesgo}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => handleLogin('PACIENTE')}
              className="w-full flex items-center justify-start gap-3 bg-dashboard-green hover:bg-dashboard-green/90 text-white border-0 shadow-sm h-14"
            >
              <div className="bg-white/20 p-2 rounded-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-base text-white">Ingresar al Portal</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 p-4 border-t border-border flex justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Prototipo Clínico © {new Date().getFullYear()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}