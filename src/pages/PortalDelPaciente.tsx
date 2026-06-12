import React, { useState, useEffect } from 'react';
import { Home, Bell, BookOpen, CheckCircle, Download, Activity, Heart, Calculator } from 'lucide-react';
import { db } from '@/db/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { calcularEdad, calcularRiesgoSCORE2, configRiesgo } from '@/lib/clinical';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { FichaPDF } from '@/components/pdf/FichaPDF';
import { toPng } from 'html-to-image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function PortalPaciente() {
  const [pacientes, setPacientes] = useState(db.getAll());
  const storedId = localStorage.getItem('currentPatientId') || pacientes[0]?.id;
  const [sis, setSis] = useState('');
  const [dia, setDia] = useState('');
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState(false);

  // Forzar recarga si la base de datos mock no tiene al menos 2 pacientes
  useEffect(() => {
    if (db.getAll().length < 2) {
      localStorage.removeItem('serverStartTime');
      window.location.reload();
    }
  }, []);

  const handleExportPDF = async (pacienteTarget: any, riesgoTarget: string) => {
    setIsExporting(true);
    try {
      const container = document.getElementById('charts-export-container');
      let chartsImage = undefined;
      if (container) {
        chartsImage = await toPng(container, { pixelRatio: 2, backgroundColor: '#ffffff' });
      }

      const blob = await pdf(
        <FichaPDF patient={pacienteTarget} mediciones={pacienteTarget.mediciones} riesgo={riesgoTarget} chartsImage={chartsImage} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Historia_Clinica_${pacienteTarget.rut}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      db.registrarAuditoriaDescarga(pacienteTarget.id);
      alert("Descarga autorizada e iniciada.\nEvento registrado con éxito en el Log de Auditoría Clínica.");
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Ocurrió un error al generar el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const paciente = pacientes.find(p => p.id === storedId);

  const handleGuardar = () => {
    if (!sis || !dia || !paciente) return;
    db.addMedicion(paciente.id, {
      fecha: new Date().toISOString(),
      peso: paciente.mediciones[paciente.mediciones.length - 1]?.peso || 70,
      talla: paciente.mediciones[paciente.mediciones.length - 1]?.talla || 1.70,
      presionSistolica: Number(sis),
      presionDiastolica: Number(dia),
      profesionalRegistro: 'Auto-reporte (Portal)'
    });
    setSis('');
    setDia('');
    setPacientes(db.getAll());
  };

  const handleMarcarTomado = (recetaId: string, medicamentoNombre: string) => {
    db.marcarMedicamentoTomado(paciente.id, recetaId, medicamentoNombre);
    setPacientes(db.getAll());
  };

  const haSidoTomadoHoy = (medicamentoNombre: string) => {
    const tomas = paciente.tomasMedicamentos || [];
    const hoy = new Date().toISOString().split('T')[0];
    return tomas.some(t => t.medicamentoNombre === medicamentoNombre && t.fechaHora.startsWith(hoy));
  };

  if (!paciente) return null;

  const mediciones = paciente.mediciones || [];
  const lastM = mediciones[mediciones.length - 1];
  const edad = calcularEdad(paciente.fechaNacimiento || '1970-01-01');
  const riesgo = lastM ? calcularRiesgoSCORE2(edad, lastM.presionSistolica) : 'BAJO';

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header Fijo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tu Portal de Salud</h2>
          <p className="text-sm text-muted-foreground mt-1">Revisa tus métricas, registra tu presión y aprende sobre tu condición.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="shrink-0 font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
            onClick={() => handleExportPDF(paciente, riesgo)}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" /> 
            {isExporting ? 'Generando PDF...' : 'Descargar Ficha Clínica (PDF)'}
          </Button>
        </div>
      </div>

      {/* Contenedor Oculto para capturar el gráfico en el PDF */}
      <div className="absolute -left-[9999px] top-0 w-[800px] h-[400px] bg-white p-8" id="charts-export-container">
        <h3 className="text-xl font-bold mb-4 text-slate-800">Evolución de Presión Arterial</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[...paciente.mediciones].reverse()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={['auto', 'auto']} />
            <Line type="monotone" dataKey="presionSistolica" stroke="#ef4444" strokeWidth={2} name="Sistólica" />
            <Line type="monotone" dataKey="presionDiastolica" stroke="#3b82f6" strokeWidth={2} name="Diastólica" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen Clínico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="p-4 pt-5 pb-3 bg-blue-500 text-white">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-4 w-4" /> Última Presión Registrada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {lastM ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">{lastM.presionSistolica}/{lastM.presionDiastolica}</span>
                <span className="text-xs text-muted-foreground font-medium">mmHg</span>
              </div>
            ) : <span className="text-sm text-muted-foreground">Sin registros</span>}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="p-4 pt-5 pb-3 bg-red-500 text-white">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Heart className="h-4 w-4" /> Riesgo Cardiovascular
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex items-center gap-3">
            <span className="text-2xl font-bold">{riesgo}</span>
            <Badge variant="outline" className={`font-bold ${configRiesgo[riesgo].color}`}>SCORE2</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500 overflow-hidden">
          <CardHeader className="p-4 pt-5 pb-3 bg-amber-500 text-white">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Simulación Financiera
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 bg-amber-50/50">
            <p className="text-xs text-amber-900/80 mb-3 font-medium">Calcula el copago de tus tratamientos según tu previsión.</p>
            <Button size="sm" onClick={() => navigate('/simulador')} className="w-full bg-amber-600 hover:bg-amber-700 shadow-sm text-white">
              Abrir Simulador
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registro Domiciliario (HU-07) */}
        <Card className="shadow-sm border-transparent overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <CardHeader className="p-4 pt-5 bg-violet-500 text-white border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" /> Registro en Casa
            </CardTitle>
            <CardDescription className="text-violet-100 font-medium">
              Ingresa tu presión arterial diaria para mantener a tu médico informado.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-semibold text-foreground">Sistólica (Alta)</label>
                  <Input type="number" value={sis} onChange={e => setSis(e.target.value)} placeholder="Ej: 120" className="bg-muted/20" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-semibold text-foreground">Diastólica (Baja)</label>
                  <Input type="number" value={dia} onChange={e => setDia(e.target.value)} placeholder="Ej: 80" className="bg-muted/20" />
                </div>
              </div>
              <Button onClick={handleGuardar} className="w-full font-semibold" disabled={!sis || !dia}>
                Guardar Registro
              </Button>
            </div>

            <div className="pt-5 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" /> Próximos Recordatorios
              </h4>
              <ul className="text-sm space-y-2">
                {paciente.recetas.length > 0 ? paciente.recetas[paciente.recetas.length - 1].medicamentos.map((med, i) => {
                  const tomadoHoy = haSidoTomadoHoy(med.nombre);
                  return (
                    <li key={i} className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${tomadoHoy ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-100'}`}>
                      <div className="flex items-start gap-3">
                        <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${tomadoHoy ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <div>
                          <p className={`font-bold leading-none ${tomadoHoy ? 'text-emerald-900 line-through opacity-70' : 'text-amber-900'}`}>{med.nombre}</p>
                          <p className={`text-xs font-medium mt-1 ${tomadoHoy ? 'text-emerald-700/80' : 'text-amber-700/80'}`}>{med.indicacion}</p>
                        </div>
                      </div>
                      {!tomadoHoy && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white text-amber-700 border-amber-200 hover:bg-amber-100 w-full sm:w-auto"
                          onClick={() => handleMarcarTomado(paciente.recetas[paciente.recetas.length - 1].id, med.nombre)}
                        >
                          Marcar Tomado
                        </Button>
                      )}
                      {tomadoHoy && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md text-center sm:text-left">Tomado hoy</span>
                      )}
                    </li>
                  );
                }) : (
                  <p className="text-xs font-medium text-muted-foreground p-3 bg-muted/20 rounded-lg border border-border">No tienes medicamentos activos en tu receta.</p>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Educación Cardiovascular (HU-13) */}
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="p-4 pt-5 bg-emerald-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Educación Cardiovascular
            </CardTitle>
            <CardDescription className="text-emerald-50 font-medium">
              Cápsulas de aprendizaje personalizadas para tu condición.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="p-4 border border-border rounded-lg flex items-center justify-between bg-emerald-50/30 hover:bg-emerald-50/80 cursor-pointer transition-colors" onClick={() => navigate('/educacion/sodio')}>
              <div>
                <h5 className="font-bold text-sm text-foreground">Nutrición Baja en Sodio</h5>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Video interactivo • 5 min</p>
              </div>
              {paciente.modulosEducativosCompletados?.includes('sodio') ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Comenzar</Badge>}
            </div>
            <div className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => navigate('/educacion/ejercicio')}>
              <div>
                <h5 className="font-bold text-sm text-foreground">Ejercicios para Hipertensos</h5>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Artículo ilustrado • 10 min</p>
              </div>
              {paciente.modulosEducativosCompletados?.includes('ejercicio') ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Comenzar</Badge>}
            </div>
            <div className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => navigate('/educacion/estres')}>
              <div>
                <h5 className="font-bold text-sm text-foreground">Manejo del Estrés en el Trabajo</h5>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Podcast relajante • 15 min</p>
              </div>
              {paciente.modulosEducativosCompletados?.includes('estres') ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Comenzar</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}