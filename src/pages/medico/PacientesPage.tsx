import { useState, useEffect, useMemo } from 'react';
import { usePatient } from '@/context/PatientContext';
import { db, type PatientRecord } from '@/db/mockDb';
import { PatientConsultation } from '@/components/dashboard/PatientConsultation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus } from 'lucide-react';
import { calcularRiesgoSCORE2, configRiesgo, calcularEdad } from '@/lib/clinical';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PacientesPage() {
  const { currentPatientId, setCurrentPatientId } = usePatient();
  const [pacientesDb, setPacientesDb] = useState<PatientRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH'>('ALL');

  const refreshPatients = () => setPacientesDb(db.getAll());

  useEffect(() => {
    refreshPatients();
  }, [currentPatientId]);

  const displayList = useMemo(() => {
    let list = pacientesDb.map(p => {
      const edad = calcularEdad(p.fechaNacimiento || '1970-01-01');
      const mediciones = p.mediciones || [];
      const lastM = mediciones[mediciones.length - 1];
      const riesgo = lastM ? calcularRiesgoSCORE2(edad, lastM.presionSistolica) : 'BAJO';
      const rLevel = riesgo === 'MUY_ALTO' ? 4 : riesgo === 'ALTO' ? 3 : riesgo === 'MODERADO' ? 2 : 1;
      return { ...p, edadCalculada: edad, lastM, riesgo, rLevel };
    });

    if (searchTerm) {
      list = list.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.rut.includes(searchTerm));
    }

    if (riskFilter === 'HIGH') {
      list = list.filter(p => p.riesgo === 'ALTO' || p.riesgo === 'MUY_ALTO');
    }

    // Por defecto, los pacientes de mayor riesgo aparecen primero
    list.sort((a, b) => b.rLevel - a.rLevel);
    return list;
  }, [pacientesDb, searchTerm, riskFilter]);

  if (currentPatientId) {
    return <PatientConsultation onRecordSaved={refreshPatients} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Directorio de Pacientes</h1>
        <Button onClick={() => setCurrentPatientId('NUEVO')} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4" /> Nuevo Ingreso
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o RUT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={riskFilter} onValueChange={(v: any) => setRiskFilter(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtro de Riesgo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los pacientes</SelectItem>
            <SelectItem value="HIGH">Solo Riesgo Elevado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {displayList.map(p => {
          const borderColor = {
            BAJO: 'border-green-200 hover:border-green-400',
            MODERADO: 'border-yellow-300 hover:border-yellow-500',
            ALTO: 'border-orange-300 hover:border-orange-500',
            MUY_ALTO: 'border-red-300 hover:border-red-500'
          }[p.riesgo];

          return (
            <Card key={p.id} className={`cursor-pointer hover:shadow-md transition-all flex flex-col border-l-4 ${borderColor}`} onClick={() => setCurrentPatientId(p.id)}>
              <CardHeader className="p-6 pb-5">
                <CardTitle className="text-lg leading-tight truncate">{p.nombre}</CardTitle>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground">{p.rut}</span>
                  <span>•</span>
                  <span>{p.edadCalculada} años</span>
                  <span>•</span>
                  <span>{p.sexo === 'M' ? 'Hombre' : 'Mujer'}</span>
                </div>
              </CardHeader>
              <CardContent className="mt-auto p-6 pt-2 pb-6">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Última P.A.</span>
                    <span className="text-sm font-semibold text-foreground">{p.lastM ? `${p.lastM.presionSistolica}/${p.lastM.presionDiastolica}` : 'Sin datos'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Riesgo CV</span>
                    <Badge variant="outline" className={`${configRiesgo[p.riesgo].color} border-0 shadow-sm`}>
                      {p.riesgo}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {displayList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-slate-50">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No se encontraron pacientes con los filtros actuales.</p>
        </div>
      )}
    </div>
  );
}
