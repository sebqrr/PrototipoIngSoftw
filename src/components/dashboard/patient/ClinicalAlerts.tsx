import { AlertTriangle, Info, Stethoscope, Clock, ActivitySquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PatientRecord } from '@/db/mockDb';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ClinicalAlertsProps {
  patient: PatientRecord;
  riesgoActual: string;
}

export function ClinicalAlerts({ patient, riesgoActual }: ClinicalAlertsProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const mediciones = patient.mediciones || [];
  const lastM = mediciones[mediciones.length - 1];
  const prevM = mediciones[mediciones.length - 2];

  const alerts = [];
  const guidelines = [];

  if (lastM) {
    // 1. Inasistencia > 6 meses (CA-03-2)
    const lastDate = new Date(lastM.fecha).getTime();
    const diffMonths = (new Date().getTime() - lastDate) / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths >= 6) {
      alerts.push({ id: 'inasistencia', type: 'warning', icon: Clock, title: 'Inasistencia Prolongada', desc: `El paciente no registra controles clínicos hace más de ${Math.floor(diffMonths)} meses.` });
    }

    // 2. Presión Arterial Crítica (CA-03-1 / CA-08-1)
    if (lastM.presionSistolica >= 140 || lastM.presionDiastolica >= 90) {
      alerts.push({ id: 'pa_critica', type: 'destructive', icon: ActivitySquare, title: 'Presión Arterial Fuera de Rango Objetivo', desc: `Última lectura: ${lastM.presionSistolica}/${lastM.presionDiastolica} mmHg. El umbral de hipertensión ha sido superado.` });
    }

    // 3. Subida Abrupta de Peso (CA-03-1)
    if (prevM) {
      const weightDiff = lastM.peso - prevM.peso;
      const dayDiff = (lastDate - new Date(prevM.fecha).getTime()) / (1000 * 60 * 60 * 24);
      if (weightDiff >= 2 && dayDiff <= 30) {
        // En un entorno real esto sería <= 7 días. Para la demo lo hacemos <= 30 días para que se note en las fechas mockeadas.
        alerts.push({ id: 'peso_abrupto', type: 'destructive', icon: AlertTriangle, title: 'Variación de Peso Anómala', desc: `Sube ${weightDiff.toFixed(1)}kg en el último período. Podría indicar retención de líquidos o insuficiencia cardíaca descompensada.` });
      }
    }
  }

  // Soporte Clínico (CA-09-1 / CA-09-3)
  if (riesgoActual === 'ALTO' || riesgoActual === 'MUY_ALTO') {
    // Identificar factores para CA-09-3
    const factores = [];
    const edadPaciente = (new Date().getFullYear()) - parseInt(patient.fechaNacimiento.split('-')[0] || '1970');
    
    if (patient.tabaquismo) factores.push('Tabaquismo Activo');
    if (edadPaciente >= 65) factores.push(`Edad Riesgo (${edadPaciente} años)`);
    if (lastM && (lastM.presionSistolica >= 140 || lastM.presionDiastolica >= 90)) {
      factores.push(`Hipertensión (${lastM.presionSistolica}/${lastM.presionDiastolica})`);
    }
    if (lastM && lastM.colesterol && lastM.colesterol >= 200) {
      factores.push(`Colesterol Elevado (${lastM.colesterol} mg/dL)`);
    }

    const justificacionText = factores.length > 0 
      ? `Factores determinantes detectados: ${factores.join(' • ')}` 
      : 'Evaluado en base al modelo poblacional SCORE2.';

    guidelines.push({
      id: 'guia_minsal_ecg',
      title: 'Soporte a la Decisión Clínica (Basado en Guías)',
      desc: 'El paciente presenta Riesgo CV Elevado (SCORE2). Según protocolo MINSAL, se recomienda considerar la solicitud de Electrocardiograma (ECG), derivación a Cardiología, o intensificar el tratamiento farmacológico actual.',
      justificacion: justificacionText,
      link: 'https://diprece.minsal.cl/programas-de-salud/salud-cardiovascular/'
    });
  }

  const activeAlerts = alerts.filter(a => !dismissed.includes(a.id));
  const activeGuidelines = guidelines.filter(g => !dismissed.includes(g.id));

  if (activeAlerts.length === 0 && activeGuidelines.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {activeAlerts.map(alert => (
        <Alert key={alert.id} variant={alert.type as any} className="relative shadow-sm border-l-4">
          <alert.icon className="h-4 w-4" />
          <AlertTitle className="font-bold flex items-center justify-between text-sm">
            {alert.title}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 absolute top-2 right-2 rounded-full" onClick={() => setDismissed([...dismissed, alert.id])}>×</Button>
          </AlertTitle>
          <AlertDescription className="text-xs mt-1 text-muted-foreground">
            {alert.desc}
          </AlertDescription>
        </Alert>
      ))}

      {activeGuidelines.map(g => (
        <Alert key={g.id} className="bg-blue-50/80 border-blue-200 text-blue-900 border-l-4 border-l-blue-500 shadow-sm relative">
          <Stethoscope className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-bold text-blue-800 flex items-center justify-between text-sm">
            {g.title}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-500 hover:text-blue-800 absolute top-2 right-2 rounded-full hover:bg-blue-100" onClick={() => setDismissed([...dismissed, g.id])}>×</Button>
          </AlertTitle>
          <AlertDescription className="text-xs mt-1 text-blue-800/80">
            {g.desc}
            <div className="mt-3">
              <a href={g.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 bg-blue-100/50 px-2 py-1 rounded transition-colors">
                <Info className="h-3 w-3" /> Ver Protocolo en Guía Clínica MINSAL
              </a>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
