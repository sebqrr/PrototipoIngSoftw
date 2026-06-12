import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { RecetaPDF } from '@/components/pdf/RecetaPDF';
import { EcgPDF } from '@/components/pdf/EcgPDF';
import { FichaPDF } from '@/components/pdf/FichaPDF';
import { toPng } from 'html-to-image';
import { ecgNormalData, ecgAbnormalData } from '@/db/ecgSamples';
import { db } from '@/db/mockDb';
import { Activity, AlertTriangle, Heart, Pill, Download, FileText, ShieldCheck, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ComposedChart, Bar } from 'recharts';
import { configRiesgo } from '@/lib/clinical';
import type { Medicion, PatientRecord } from '@/db/mockDb';

const CustomBPBar = (props: any) => {
  const { x, y, width, height } = props;
  const centerX = x + width / 2;
  return (
    <g>
      <rect x={centerX - 1} y={y} width={2} height={height} fill="url(#bpGradient)" />
      <circle cx={centerX} cy={y} r={6} fill="#ef4444" />
      <circle cx={centerX} cy={y + height} r={6} fill="#3b82f6" />
    </g>
  );
};

interface PatientTabsProps {
  currentPatient: PatientRecord;
  mediciones: Medicion[];
  edadActual: number;
  riesgoActual: keyof typeof configRiesgo;
  onRecordSaved: () => void;
}

export function PatientTabs({ currentPatient, mediciones, edadActual, riesgoActual, onRecordSaved }: PatientTabsProps) {
  const lastM = mediciones[mediciones.length - 1];
  
  const [examOpen, setExamOpen] = useState(false);
  const [examTipo, setExamTipo] = useState('Electrocardiograma Reposo');
  const [examResultado, setExamResultado] = useState<'Normal' | 'Anormal' | ''>('Normal');
  const [examFecha, setExamFecha] = useState(new Date().toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const container = document.getElementById('charts-export-container');
      let chartsImage = undefined;
      if (container) {
        chartsImage = await toPng(container, {
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
      }

      const blob = await pdf(
        <FichaPDF 
          patient={currentPatient} 
          mediciones={filteredMediciones} 
          riesgo={riesgoActual} 
          chartsImage={chartsImage} 
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ficha_Clinica_${currentPatient.rut}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar ficha:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSimulateExam = () => {
    db.addExamenDicom(currentPatient.id, {
      fecha: examFecha,
      tipo: examTipo,
      resultado: examResultado === '' ? undefined : examResultado as any,
      ecgData: examTipo === 'Electrocardiograma Reposo' ? (examResultado === 'Normal' ? ecgNormalData : ecgAbnormalData) : undefined,
      imageUrl: examTipo !== 'Electrocardiograma Reposo' ? 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=1000' : undefined
    });
    onRecordSaved();
    setExamOpen(false);
  };

  const [timeFilter, setTimeFilter] = useState<'all' | '1y' | '6m' | '3m'>('all');

  const filteredMediciones = useMemo(() => {
    if (timeFilter === 'all') return mediciones;
    const now = new Date().getTime();
    const mapFilter = {
      '1y': 365 * 24 * 60 * 60 * 1000,
      '6m': 180 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - mapFilter[timeFilter];
    return mediciones.filter(m => new Date(m.fecha).getTime() >= cutoff);
  }, [mediciones, timeFilter]);

  let bpData: any[] = [];
  for (let i = 0; i < filteredMediciones.length; i++) {
    const m = filteredMediciones[i];
    const timestamp = new Date(m.fecha).getTime();
    const media = Math.round(m.presionDiastolica + (m.presionSistolica - m.presionDiastolica) / 3);
    
    let current = {
      fecha: m.fecha,
      timestamp,
      rango: [m.presionDiastolica, m.presionSistolica],
      sistolica: m.presionSistolica,
      diastolica: m.presionDiastolica,
      media,
      peso: m.peso,
      media_gap: null,
      peso_gap: null
    };

    if (i > 0) {
      let prevReal = filteredMediciones[i-1];
      let prevRealTime = new Date(prevReal.fecha).getTime();
      let diffDays = (timestamp - prevRealTime) / (1000 * 3600 * 24);
      
      if (diffDays > 40) {
        let prev = bpData[bpData.length - 1];
        prev.media_gap = prev.media;
        prev.peso_gap = prev.peso;
        current.media_gap = current.media;
        current.peso_gap = current.peso;
        
        bpData.push({
          fecha: 'Gap',
          timestamp: prevRealTime + (timestamp - prevRealTime) / 2,
          rango: null,
          media: null, peso: null,
          media_gap: (prev.media + current.media) / 2,
          peso_gap: (prev.peso + current.peso) / 2
        });
      }
    }
    bpData.push(current);
  }

  const processGaps = (dataArray: any[], valueFn: (m: any) => number) => {
    let result: any[] = [];
    for (let i = 0; i < dataArray.length; i++) {
      const val = valueFn(dataArray[i]);
      const timestamp = new Date(dataArray[i].fecha).getTime();
      let current: any = { fecha: dataArray[i].fecha, timestamp, val, val_gap: null };
      
      if (i > 0) {
        let prevRealTime = new Date(dataArray[i-1].fecha).getTime();
        let diffDays = (timestamp - prevRealTime) / (1000 * 3600 * 24);
        
        if (diffDays > 40) {
          let prev = result[result.length - 1];
          prev.val_gap = prev.val;
          current.val_gap = current.val;
          result.push({
            fecha: 'Gap',
            timestamp: prevRealTime + (timestamp - prevRealTime) / 2,
            val: null,
            val_gap: (prev.val + current.val) / 2
          });
        }
      }
      result.push(current);
    }
    return result;
  };

  const cholData = processGaps(filteredMediciones.filter(m => m.colesterol), m => m.colesterol!);
  const imcData = processGaps(filteredMediciones.filter(m => m.peso && m.talla), m => Number((m.peso / (m.talla! * m.talla!)).toFixed(1)));

  const formatDate = (val: any) => {
    if (!val) return '';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="graficos" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1">
          <TabsTrigger value="graficos" className="flex gap-2 text-xs"><TrendingUp className="h-4 w-4" /> Evolución</TabsTrigger>
          <TabsTrigger value="score2" className="flex gap-2 text-xs"><Heart className="h-4 w-4" /> SCORE2</TabsTrigger>
          <TabsTrigger value="historial" className="flex gap-2 text-xs"><Activity className="h-4 w-4" /> Tabular</TabsTrigger>
          <TabsTrigger value="recetas" className="flex gap-2 text-xs"><FileText className="h-4 w-4" /> Recetas</TabsTrigger>
          <TabsTrigger value="examenes" className="flex gap-2 text-xs"><ShieldCheck className="h-4 w-4" /> Exámenes</TabsTrigger>
        </TabsList>

        <TabsContent value="graficos" className="mt-4 space-y-6">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
            <Button onClick={handleExportPDF} disabled={isExporting} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? 'Generando PDF...' : 'Exportar Ficha Clínica'}
            </Button>
            <div className="flex gap-2">
              <Button variant={timeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('all')} className="text-xs h-7">Todo Histórico</Button>
              <Button variant={timeFilter === '1y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('1y')} className="text-xs h-7">Último Año</Button>
              <Button variant={timeFilter === '6m' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('6m')} className="text-xs h-7">6 Meses</Button>
              <Button variant={timeFilter === '3m' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('3m')} className="text-xs h-7">3 Meses</Button>
            </div>
          </div>

          <div id="charts-export-container" className="space-y-6 bg-white p-1 rounded-xl">
            {filteredMediciones.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                No hay controles registrados en este período de tiempo.
              </div>
            ) : (
              <>
                <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" /> Historial de Presión Arterial
              </CardTitle>
              <CardDescription className="text-xs">
                La barra representa la P.A. (Sistólica/Diastólica). La línea gris es la P.A. Media. La línea morada es el Peso Corporal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ChartContainer config={{}} className="h-full w-full">
                  <ComposedChart data={bpData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                    <defs>
                      <linearGradient id="bpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={formatDate} className="text-[10px]" tickMargin={10} label={{ value: 'Fecha de Control', position: 'insideBottom', offset: -15, className: 'text-[10px] fill-muted-foreground' }} />
                    <YAxis yAxisId="left" domain={['auto', 'auto']} className="text-[10px]" label={{ value: 'P. Arterial (mmHg)', angle: -90, position: 'insideLeft', offset: 10, style: {textAnchor: 'middle'} }} />
                    <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} className="text-[10px]" label={{ value: 'Peso (kg)', angle: 90, position: 'insideRight', offset: 10, style: {textAnchor: 'middle'} }} />
                    <ChartTooltip content={<ChartTooltipContent labelFormatter={formatDate} />} />
                    <Bar yAxisId="left" dataKey="rango" shape={<CustomBPBar />} name="Rango PA" isAnimationActive={false} />
                    <Line yAxisId="left" type="monotone" dataKey="media" stroke="#9ca3af" strokeWidth={1.5} dot={{ fill: '#9ca3af', strokeWidth: 0, r: 3 }} name="PA Media" connectNulls={false} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="peso" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} name="Peso (kg)" connectNulls={false} isAnimationActive={false} />
                    <Line yAxisId="left" type="monotone" dataKey="media_gap" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} name="Inasistencia >40d" connectNulls={false} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="peso_gap" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} name="Inasistencia >40d" connectNulls={false} isAnimationActive={false} />
                  </ComposedChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {cholData.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                  <Activity className="h-4 w-4" /> Evolución Colesterol no-HDL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] w-full">
                  <ChartContainer config={{}} className="h-full w-full">
                    <LineChart data={cholData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={formatDate} className="text-[10px]" tickMargin={10} label={{ value: 'Fecha de Control', position: 'insideBottom', offset: -15, className: 'text-[10px] fill-muted-foreground' }} />
                      <YAxis className="text-[10px]" domain={['auto', 'auto']} label={{ value: 'Colesterol no-HDL (mg/dL)', angle: -90, position: 'insideLeft', offset: 15, style: {textAnchor: 'middle'} }} />
                      <ChartTooltip content={<ChartTooltipContent labelFormatter={formatDate} />} />
                      <Line type="monotone" dataKey="val" stroke="#d97706" strokeWidth={3} dot={{ r: 5, fill: '#d97706' }} name="Colesterol" connectNulls={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="val_gap" stroke="#d97706" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={false} name="Inasistencia >40d" connectNulls={false} isAnimationActive={false} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {imcData.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-600">
                  <Activity className="h-4 w-4" /> Evolución Índice de Masa Corporal (IMC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] w-full">
                  <ChartContainer config={{}} className="h-full w-full">
                    <LineChart data={imcData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={formatDate} className="text-[10px]" tickMargin={10} label={{ value: 'Fecha de Control', position: 'insideBottom', offset: -15, className: 'text-[10px] fill-muted-foreground' }} />
                      <YAxis className="text-[10px]" domain={['auto', 'auto']} label={{ value: 'IMC (kg/m²)', angle: -90, position: 'insideLeft', offset: 15, style: {textAnchor: 'middle'} }} />
                      <ChartTooltip content={<ChartTooltipContent labelFormatter={formatDate} />} />
                      <Line type="monotone" dataKey="val" stroke="#9333ea" strokeWidth={3} dot={{ r: 5, fill: '#9333ea' }} name="IMC" connectNulls={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="val_gap" stroke="#9333ea" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={false} name="Inasistencia >40d" connectNulls={false} isAnimationActive={false} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="score2" className="mt-4 space-y-6 fade-in">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" /> Detalle de Riesgo SCORE2
              </CardTitle>
              <CardDescription>
                Evaluación del riesgo cardiovascular a 10 años.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg flex flex-col justify-center">
                  <p className="text-sm text-muted-foreground mb-1">Resultado de la Última Medición</p>
                  <div className={`text-2xl font-black ${configRiesgo[riesgoActual].color.replace('border', 'text').split(' ')[0]}`}>
                    {configRiesgo[riesgoActual].text}
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg flex flex-col justify-center text-sm space-y-1">
                  <p><strong>Edad al momento del cálculo:</strong> {edadActual} años</p>
                  <p><strong>P.A. Sistólica (última):</strong> {lastM?.presionSistolica} mmHg</p>
                  
                  <div className="mt-3 p-3 bg-white border rounded-md">
                    <p className="font-semibold text-[11px] mb-1.5 text-slate-700 uppercase tracking-wider">Desglose del Árbol de Decisión</p>
                    <ul className="text-xs space-y-1 text-slate-600">
                      <li className={edadActual >= 65 && (lastM?.presionSistolica || 0) >= 160 ? 'font-bold text-red-600 bg-red-50 p-1 rounded' : 'p-1'}>
                        {edadActual >= 65 && (lastM?.presionSistolica || 0) >= 160 ? '➡️' : '⬜'} Si Edad ≥ 65 y PAS ≥ 160 → <strong>MUY ALTO</strong>
                      </li>
                      <li className={riesgoActual === 'ALTO' ? 'font-bold text-orange-600 bg-orange-50 p-1 rounded' : 'p-1'}>
                        {riesgoActual === 'ALTO' ? '➡️' : '⬜'} Si Edad ≥ 60 o PAS ≥ 140 → <strong>ALTO</strong>
                      </li>
                      <li className={riesgoActual === 'MODERADO' ? 'font-bold text-yellow-600 bg-yellow-50 p-1 rounded' : 'p-1'}>
                        {riesgoActual === 'MODERADO' ? '➡️' : '⬜'} Si Edad ≥ 50 o PAS ≥ 130 → <strong>MODERADO</strong>
                      </li>
                      <li className={riesgoActual === 'BAJO' ? 'font-bold text-green-600 bg-green-50 p-1 rounded' : 'p-1'}>
                        {riesgoActual === 'BAJO' ? '➡️' : '⬜'} Ninguna de las anteriores → <strong>BAJO</strong>
                      </li>
                    </ul>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                    * Nota: Esta es una abstracción determinística simplificada del algoritmo europeo SCORE2 adaptada para el prototipo base.
                  </p>
                </div>
              </div>
              
              {(riesgoActual === 'ALTO' || riesgoActual === 'MUY_ALTO') && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 shadow-sm mt-4">
                  <AlertTriangle className="h-5 w-5 !text-red-600 top-3" />
                  <AlertTitle className="font-bold flex items-center gap-2 text-red-800 text-sm">
                    Protocolo Clínico Sugerido
                    <Badge variant="outline" className="bg-white text-[10px] border-red-200 text-red-800 h-5">MINSAL</Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-1 text-xs">
                    <ul className="list-disc pl-4 font-medium space-y-0.5">
                      <li>Iniciar terapia combinada antihipertensiva.</li>
                      <li>Evaluar inicio de terapia con estatinas de alta intensidad.</li>
                      <li>Derivación prioritaria a especialista.</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-4 space-y-6 fade-in">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" /> Registro Tabular de Mediciones
              </CardTitle>
              <CardDescription>
                Historial detallado en bruto de todas las tomas de signos vitales registradas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Altura</TableHead>
                    <TableHead>IMC</TableHead>
                    <TableHead>P.A. (Sis/Dia)</TableHead>
                    <TableHead>F. Cardíaca</TableHead>
                    <TableHead>Colesterol</TableHead>
                    <TableHead>HbA1c</TableHead>
                    <TableHead>Comentario Clínico</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...mediciones].reverse().map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.fecha}</TableCell>
                      <TableCell>{m.peso} kg</TableCell>
                      <TableCell>{m.talla} m</TableCell>
                      <TableCell>{(m.peso / (m.talla * m.talla)).toFixed(1)}</TableCell>
                      <TableCell>{m.presionSistolica}/{m.presionDiastolica}</TableCell>
                      <TableCell>{m.frecuenciaCardiaca ? `${m.frecuenciaCardiaca} lpm` : '-'}</TableCell>
                      <TableCell>{m.colesterol ? `${m.colesterol} mg/dL` : '-'}</TableCell>
                      <TableCell>{m.hba1c ? `${m.hba1c}%` : '-'}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={m.comentarioMedico}>{m.comentarioMedico || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examenes" className="mt-4 space-y-6 fade-in">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-500" /> Exámenes Complementarios
                </CardTitle>
                <CardDescription>
                  Visor de imágenes, estudios DICOM y trazados eléctricos.
                </CardDescription>
              </div>
              <Dialog open={examOpen} onOpenChange={setExamOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    + Registrar Examen (Simulado)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Simular Registro de Examen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold">Fecha de Examen</label>
                      <Input type="date" value={examFecha} onChange={e => setExamFecha(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold">Tipo de Estudio</label>
                      <Select value={examTipo} onValueChange={setExamTipo}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electrocardiograma Reposo">Electrocardiograma Reposo (Kaggle)</SelectItem>
                          <SelectItem value="Radiografía de Tórax (AP)">Radiografía de Tórax (AP)</SelectItem>
                          <SelectItem value="Tomografía Axial Computarizada">Tomografía Axial Computarizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {examTipo === 'Electrocardiograma Reposo' && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Resultado Esperado (Dataset)</label>
                        <Select value={examResultado} onValueChange={(v: any) => setExamResultado(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Normal">Target 1.0 (Sinus Rhythm / Normal)</SelectItem>
                            <SelectItem value="Anormal">Target 0.0 (Arrhythmia / Anormal)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button className="w-full" onClick={handleSimulateExam}>Procesar y Guardar Examen</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {(!currentPatient.examenesDicom || currentPatient.examenesDicom.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay exámenes registrados.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {[...currentPatient.examenesDicom].reverse().map(ex => (
                    <div key={ex.id} className="border rounded-lg overflow-hidden flex flex-col group">
                      <div className="bg-slate-900 h-[250px] relative flex items-center justify-center overflow-hidden">
                        {ex.ecgData ? (
                          <div className="w-full h-full p-4">
                            <ChartContainer config={{}} className="h-full w-full">
                              <LineChart data={Array(10).fill(ex.ecgData).flat().map((val, idx) => ({ time: idx * 4, voltage: val }))} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                                <ChartTooltip 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-black/80 text-white p-2 text-xs rounded border border-slate-700">
                                          Voltaje: {Number(payload[0].value).toFixed(3)} mV
                                        </div>
                                      );
                                    }
                                    return null;
                                  }} 
                                />
                                <Line type="monotone" dataKey="voltage" stroke="#38bdf8" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ChartContainer>
                          </div>
                        ) : (
                          <img src={ex.imageUrl} alt={ex.tipo} className="object-contain h-full w-full opacity-70 group-hover:opacity-100 transition-opacity" />
                        )}
                        {ex.resultado && (
                          <div className="absolute top-2 left-2">
                            {ex.resultado === 'Anormal' ? (
                              <Badge variant="destructive" className="bg-red-500/90 text-[10px] text-white hover:bg-red-600/90 backdrop-blur-md">Anormal</Badge>
                            ) : (
                              <Badge className="bg-green-500/90 text-[10px] text-white hover:bg-green-600/90 backdrop-blur-md">Normal</Badge>
                            )}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">DICOM/ECG</div>
                      </div>
                      <div className="p-3 bg-muted/30">
                        <h4 className="font-bold text-sm text-foreground">{ex.tipo}</h4>
                        <p className="text-xs text-muted-foreground">{new Date(ex.fecha).toLocaleDateString()}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 p-1.5 rounded border border-green-200">
                            <CheckCircle2 className="h-3 w-3" /> Hash Original Valido (SHA-256)
                          </div>
                          {ex.ecgData && (
                            <PDFDownloadLink
                              document={<EcgPDF paciente={currentPatient.nombre} rut={currentPatient.rut} fecha={ex.fecha} tipo={ex.tipo} resultado={ex.resultado} ecgData={ex.ecgData} />}
                              fileName={`ecg_${currentPatient.rut}_${ex.fecha}.pdf`}
                            >
                              {({ loading }) => (
                                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1">
                                  {loading ? 'Cargando...' : <><Download className="h-3 w-3" /> Exportar PDF</>}
                                </Button>
                              )}
                            </PDFDownloadLink>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recetas" className="mt-4 space-y-6 fade-in">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" /> Historial de Recetas Emitidas
              </CardTitle>
              <CardDescription>
                Registro histórico de prescripciones farmacológicas emitidas para este paciente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!currentPatient.recetas || currentPatient.recetas.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay recetas emitidas aún.</p>
              ) : (
                <div className="space-y-4">
                  {[...currentPatient.recetas].reverse().map(r => (
                    <div key={r.id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{r.folio}</Badge>
                          <span className="text-sm font-medium">{new Date(r.fechaHora).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Por: {r.medico}</p>
                        <div className="flex gap-2 flex-wrap">
                          {(r.medicamentos || []).map((m, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{m.nombre}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <PDFDownloadLink 
                          document={<RecetaPDF paciente={currentPatient.nombre} rut={currentPatient.rut} medico={r.medico} medicamentos={r.medicamentos || []} folio={r.folio} fechaHora={r.fechaHora} />} 
                          fileName={`receta_${currentPatient.rut}_${r.folio}.pdf`}
                        >
                          {({ loading }) => (
                            <Button size="sm" variant="outline" className="gap-2">
                              {loading ? 'Cargando...' : <><Download className="h-3 w-3" /> Descargar PDF</>}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
