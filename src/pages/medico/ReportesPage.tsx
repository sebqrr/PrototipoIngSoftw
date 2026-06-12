import { useState } from 'react';
import { db } from '@/db/mockDb';
import { calcularEdad, calcularRiesgoSCORE2 } from '@/lib/clinical';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Database, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function ReportesPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const pacientes = db.getAll();
      
      // CA-10-01 y CA-10-02: Anonimización y Cálculo de Agregados Longitudinales
      const dataset: any[] = [];
      
      pacientes.forEach(p => {
        const idAnonimo = crypto.randomUUID().split('-')[0]; // Hash único por paciente
        const edad = calcularEdad(p.fechaNacimiento || '1970-01-01');
        const sexo = p.sexo;
        const tabaquismo = p.tabaquismo ? 'SI' : 'NO';

        if (!p.mediciones || p.mediciones.length === 0) {
          dataset.push({
            ID_ANONIMO: idAnonimo,
            EDAD: edad,
            SEXO: sexo,
            TABAQUISMO: tabaquismo,
            FECHA_CONTROL: '',
            PA_SISTOLICA: '',
            PA_DIASTOLICA: '',
            PESO: '',
            TALLA: '',
            IMC: '',
            COLESTEROL: '',
            NIVEL_RIESGO_SCORE2: ''
          });
        } else {
          p.mediciones.forEach(m => {
            const riesgo = calcularRiesgoSCORE2(edad, m.presionSistolica);
            const imc = (m.peso && m.talla) ? (m.peso / (m.talla * m.talla)).toFixed(1) : '';

            dataset.push({
              ID_ANONIMO: idAnonimo,
              EDAD: edad,
              SEXO: sexo,
              TABAQUISMO: tabaquismo,
              FECHA_CONTROL: m.fecha,
              PA_SISTOLICA: m.presionSistolica,
              PA_DIASTOLICA: m.presionDiastolica,
              PESO: m.peso,
              TALLA: m.talla,
              IMC: imc,
              COLESTEROL: m.colesterol || '',
              NIVEL_RIESGO_SCORE2: riesgo
            });
          });
        }
      });

      // Convert to CSV (CA-10-03)
      if (dataset.length === 0) {
        setIsExporting(false);
        return;
      }
      
      const headers = Object.keys(dataset[0]);
      const csvRows = [];
      csvRows.push(headers.join(',')); // Header row
      
      for (const row of dataset) {
        const values = headers.map(header => {
          const val = row[header as keyof typeof row];
          return `"${val}"`;
        });
        csvRows.push(values.join(','));
      }
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dataset_poblacional_anonimizado_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
    }, 800); // Fake delay for UX
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes y Analítica Poblacional</h1>
        <p className="text-muted-foreground mt-1">Módulo exclusivo para Analistas de Datos e Inteligencia Sanitaria.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-dashboard-blue/20 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-dashboard-blue">
              <Database className="h-5 w-5" /> Exportación de Dataset
            </CardTitle>
            <CardDescription>
              Descarga la base de datos completa de pacientes activos para análisis estadístico en software externo (Excel, Python, R).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 bg-dashboard-green/10 text-dashboard-green-fg rounded-lg text-sm border border-dashboard-green/20">
                <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Cumplimiento Legal (Ley de Protección de Datos):</strong> El algoritmo de exportación aplicará una máscara de anonimización automática. Los campos identificables (Nombre, RUT) serán purgados y reemplazados por un Hash criptográfico corto.
                </p>
              </div>
              <ul className="text-xs text-muted-foreground list-disc pl-5 mt-2 space-y-1">
                <li>Campos transversales: ID Anónimo, Edad, Sexo, Tabaquismo.</li>
                <li>Métricas longitudinales: Fecha de Control, IMC histórico, Presión Arterial, Colesterol.</li>
                <li>Clasificación de Riesgo SCORE2 histórico.</li>
                <li>Estructura: Una fila por cada registro clínico (medición) del paciente.</li>
                <li>Formato de salida: <code>.CSV</code> (Valores separados por comas).</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-slate-50/50 p-4">
            <Button 
              className="w-full gap-2 bg-dashboard-blue hover:bg-dashboard-blue/90" 
              onClick={handleExportCSV}
              disabled={isExporting}
            >
              {isExporting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generando Dataset...</>
              ) : (
                <><FileSpreadsheet className="h-4 w-4" /> Descargar Dataset Anonimizado (CSV)</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
