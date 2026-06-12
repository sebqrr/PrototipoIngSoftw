import { useState, useMemo } from 'react';
import { usePatient } from '@/context/PatientContext';
import { db, type PatientRecord } from '@/db/mockDb';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarClock, Activity, AlertTriangle, UserPlus, HeartPulse, Stethoscope, Search, PlusCircle, ArrowRight, User, FileDown, BookOpen, Phone, ChevronRight, FileText, ExternalLink, CalendarIcon, CheckCircle2, Clock, ShieldCheck, Users, Mail, Send } from 'lucide-react';
import { calcularRiesgoSCORE2, configRiesgo, calcularEdad } from '@/lib/clinical';

interface HomeDashboardProps {
  pacientesDb: PatientRecord[];
}

export function HomeDashboard({ pacientesDb }: HomeDashboardProps) {
  const { setCurrentPatientId } = usePatient();
  const [searchTerm, setSearchTerm] = useState('');
  const [atrasoMeses, setAtrasoMeses] = useState(3);
  const [contactoOpen, setContactoOpen] = useState(false);
  const [contactoPatient, setContactoPatient] = useState<any>(null);
  const [mensajeContacto, setMensajeContacto] = useState('');

  const pacientesAtrasados = useMemo(() => {
    return pacientesDb.filter(p => {
      const edad = calcularEdad(p.fechaNacimiento || '1970-01-01');
      const mediciones = p.mediciones || [];
      if (mediciones.length === 0) return false;
      const lastM = mediciones[mediciones.length - 1];
      const riesgo = calcularRiesgoSCORE2(edad, lastM.presionSistolica);
      if (riesgo !== 'ALTO' && riesgo !== 'MUY_ALTO') return false;

      const lastDate = new Date(lastM.fecha).getTime();
      const diffMonths = (new Date().getTime() - lastDate) / (1000 * 60 * 60 * 24 * 30);
      
      return diffMonths >= atrasoMeses;
    }).map(p => {
      const lastDate = new Date(p.mediciones![p.mediciones!.length - 1].fecha).getTime();
      const diffMonths = (new Date().getTime() - lastDate) / (1000 * 60 * 60 * 24 * 30);
      return { ...p, mesesAtraso: Math.floor(diffMonths) };
    }).sort((a, b) => b.mesesAtraso - a.mesesAtraso);
  }, [pacientesDb, atrasoMeses]);

  const abrirModalContacto = (paciente: any) => {
    setContactoPatient(paciente);
    setMensajeContacto(`Estimado/a ${paciente.nombre}, le escribimos desde el Centro Médico Cardíaco. Notamos que hace ${paciente.mesesAtraso} meses no acude a su control cardiovascular de rutina. Debido a sus factores clínicos, es sumamente importante agendar una consulta a la brevedad para ajustar su tratamiento. Responda este mensaje para agendar su hora.`);
    setContactoOpen(true);
  };

  const enviarContacto = () => {
    alert('¡Notificación enviada exitosamente!');
    setContactoOpen(false);
  };

  const pacientesConAlerta = pacientesDb.filter(p => {
    const mediciones = p.mediciones || [];
    const lastM = mediciones[mediciones.length - 1];
    return lastM && (lastM.presionSistolica >= 140 || lastM.presionDiastolica >= 90);
  });
  const pacientesPrioritarios = pacientesDb.filter(p => {
    const mediciones = p.mediciones || [];
    const lastM = mediciones[mediciones.length - 1];
    return lastM && (lastM.presionSistolica >= 135 || (lastM.colesterolNoHDL && lastM.colesterolNoHDL > 130));
  }).slice(0, 5);
  const displayList = searchTerm
    ? pacientesDb.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    : pacientesDb.slice(-5).reverse();

  // Agenda for today
  const citasDelDia = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const citasHoy = db.getCitasByDate(today);
    
    return citasHoy.map(c => {
      const paciente = pacientesDb.find(p => p.id === c.patientId);
      return { ...c, paciente };
    }).filter(c => c.paciente);
  }, [pacientesDb]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">Bienvenido de vuelta. Aquí tienes un resumen de tu jornada.</p>
      </div>

      {/* ─── KPI Strip ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Pacientes',  value: pacientesDb.length, icon: User, bgClass: 'bg-dashboard-blue', fgClass: 'text-dashboard-blue-fg' },
          { label: 'Alertas Críticas', value: pacientesConAlerta.length, icon: AlertTriangle, bgClass: 'bg-dashboard-red', fgClass: 'text-dashboard-red-fg' },
          { label: 'Riesgo Elevado',   value: pacientesDb.filter(p => { 
            const mediciones = p.mediciones || [];
            const lastM = mediciones[mediciones.length - 1];
            if (!lastM) return false;
            const r = calcularRiesgoSCORE2(calcularEdad(p.fechaNacimiento || '1970-01-01'), lastM.presionSistolica); 
            return r === 'ALTO' || r === 'MUY_ALTO'; 
          }).length, icon: HeartPulse, bgClass: 'bg-dashboard-red', fgClass: 'text-dashboard-red-fg' },
          { label: 'Controles Hoy',    value: citasDelDia.length, icon: CalendarClock, bgClass: 'bg-dashboard-green', fgClass: 'text-dashboard-green-fg' },
        ].map((kpi) => (
          <Card key={kpi.label} className="shadow-sm border border-border overflow-hidden pt-0 [--card-spacing:0]">
            <CardHeader className={`p-5 ${kpi.bgClass} shadow-sm relative z-10`}>
              <CardTitle className={`flex items-center gap-2 ${kpi.fgClass}`}>
                <kpi.icon className="h-4 w-4" />
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Row 1: Agenda & Fichas ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ══════ Agenda del Día (2 cols) ══════ */}
        <Card className="lg:col-span-2 flex flex-col shadow-sm border border-border overflow-hidden pt-0 [--card-spacing:0]">
          <CardHeader className="p-5 bg-dashboard-green shadow-sm relative z-10">
            <CardTitle className="flex items-center gap-2 text-dashboard-green-fg">
              <CalendarIcon className="h-5 w-5" />
              Agenda Médica del Día
            </CardTitle>
            <CardDescription className="text-dashboard-green-fg/85 text-xs">
              Tus citas programadas para hoy
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border h-[280px] overflow-y-auto">
              { citasDelDia.length > 0 ? (
                citasDelDia.map((cita) => (
                  <div key={cita.hora} className={`flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                      cita.estado === 'en_curso' ? 'bg-dashboard-green/5' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center w-14 shrink-0">
                      <span className="text-sm font-semibold">{cita.hora}</span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
                        {cita.estado === 'completada' ? 'Finalizada' : cita.estado === 'en_curso' ? 'En Curso' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`flex items-center justify-center h-9 w-9 rounded-full text-xs font-bold shrink-0 ${
                        cita.estado === 'completada' ? 'bg-muted text-muted-foreground' : 'bg-dashboard-green/10 text-dashboard-green'
                      }`}>
                        {cita.paciente.nombre.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{cita.paciente.nombre}</p>
                        <p className="text-[11px] text-muted-foreground">{calcularEdad(cita.paciente.fechaNacimiento || '1970-01-01')} años</p>
                      </div>
                    </div>
                    <div className="shrink-0 pr-2">
                      {cita.estado === 'completada' ? (
                        <CheckCircle2 className="h-4 w-4 text-dashboard-green" />
                      ) : cita.estado === 'en_curso' ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-dashboard-green/10 text-dashboard-green text-[10px] font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dashboard-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-dashboard-green"></span>
                          </span>
                          AHORA
                        </div>
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground opacity-50" />
                      )}
                      {cita.estado === 'pendiente' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                  <CalendarClock className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Agenda libre</p>
                  <p className="text-xs opacity-70">No tienes más controles programados para hoy.</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t p-5 !pt-5 flex items-center justify-center bg-muted/20">
            <Button variant="outline" size="sm" className="w-full text-xs font-medium gap-2 border-dashboard-green/30 text-dashboard-green hover:bg-dashboard-green/10 hover:text-dashboard-green">
              <CalendarClock className="h-3.5 w-3.5" /> Ver Agenda Completa
            </Button>
          </CardFooter>
        </Card>

        {/* ══════ Fichas Clínicas (3 cols) ══════ */}
        <Card className="lg:col-span-3 flex flex-col shadow-sm border border-border overflow-hidden pt-0 [--card-spacing:0]">
          <CardHeader className="p-5 bg-dashboard-blue shadow-sm relative z-10">
            <CardTitle className="flex items-center gap-2 text-dashboard-blue-fg">
              <Stethoscope className="h-5 w-5" />
              Búsqueda de Fichas Clínicas
            </CardTitle>
            <CardDescription className="text-dashboard-blue-fg/85 text-xs">
              Busca un paciente o accede a las últimas fichas consultadas
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o RUT…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-col gap-2 flex-1 min-h-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 shrink-0">
                {searchTerm ? 'Resultados' : 'Fichas Recientes'}
              </p>
              
              <div className="overflow-y-auto pr-2 pb-2 -mr-2 max-h-[380px]">
                {displayList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayList.map(p => {
                      const edad = calcularEdad(p.fechaNacimiento || '1970-01-01');
                      const mediciones = p.mediciones || [];
                      const lastM = mediciones[mediciones.length - 1];
                      const riesgo = lastM ? calcularRiesgoSCORE2(edad, lastM.presionSistolica) : 'BAJO';
                      const isAlerta = lastM ? (lastM.presionSistolica >= 140 || lastM.presionDiastolica >= 90) : false;
                      
                      const borderColor = {
                        BAJO: 'border-green-200 hover:border-green-300 hover:shadow-green-100',
                        MODERADO: 'border-yellow-300 hover:border-yellow-400 hover:shadow-yellow-100',
                        ALTO: 'border-orange-300 hover:border-orange-400 hover:shadow-orange-100',
                        MUY_ALTO: 'border-red-300 hover:border-red-400 hover:shadow-red-100'
                      }[riesgo];

                      return (
                        <Card
                          key={p.id}
                          className={`cursor-pointer hover:shadow-md transition-all group shadow-sm flex flex-col border ${borderColor}`}
                          onClick={() => setCurrentPatientId(p.id)}
                        >
                          <CardContent className="px-3 py-1.5 flex flex-col gap-2 flex-1">
                            {/* Header: Avatar, Name, Demographics */}
                            <div className="flex items-start gap-2.5">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-dashboard-blue/10 text-dashboard-blue text-xs font-bold shrink-0 mt-0.5">
                                {p.nombre.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate group-hover:text-dashboard-blue transition-colors leading-tight">{p.nombre}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{edad} años • {p.sexo === 'M' ? 'Hombre' : 'Mujer'}</p>
                              </div>
                            </div>
                            
                            {/* Clinical Summary */}
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                              {lastM && (
                                <>
                                  <div className="flex flex-col text-center">
                                    <span className="text-[10px] text-muted-foreground mb-0.5 leading-none">P.A.</span>
                                    <span className={`text-xs font-bold leading-none ${isAlerta ? 'text-red-600' : 'text-foreground'}`}>
                                      {lastM.presionSistolica}/{lastM.presionDiastolica}
                                    </span>
                                  </div>
                                </>
                              )}
                              <div className="rounded-md bg-muted/40 p-1.5 text-center flex flex-col items-center justify-center">
                                <p className="text-[9px] text-muted-foreground uppercase font-semibold mb-0.5 tracking-wider">Riesgo CV</p>
                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${configRiesgo[riesgo].color}`}>
                                  {riesgo}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-6 text-center bg-muted/30 rounded-lg">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron pacientes.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t p-5 !pt-5 flex items-center justify-center">
            <Button variant="outline" size="sm" onClick={() => setCurrentPatientId('NUEVO')} className="w-full text-xs font-medium gap-2 border-dashboard-blue/30 text-dashboard-blue hover:bg-dashboard-blue/10 hover:text-dashboard-blue">
              <UserPlus className="h-3.5 w-3.5" /> Nuevo Ingreso
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ─── Row 2: Sugerencias & Reportes ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ══════ Agendamiento HU-04 (3 cols) ══════ */}
        <Card id="agendamiento" className="lg:col-span-3 flex flex-col shadow-sm border border-border overflow-hidden pt-0 [--card-spacing:0]">
          <CardHeader className="p-5 bg-dashboard-red shadow-sm relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-dashboard-red-fg">
                <CalendarClock className="h-5 w-5" />
                Agendamiento Proactivo
              </CardTitle>
              <CardDescription className="text-dashboard-red-fg/85 text-xs mt-1">
                Pacientes de Riesgo SCORE2 Elevado sin controles vigentes.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={atrasoMeses.toString()} onValueChange={(v) => setAtrasoMeses(Number(v))}>
                <SelectTrigger className="w-[140px] h-8 text-xs bg-white text-dashboard-red-fg">
                  <SelectValue placeholder="Filtro de Atraso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Atraso &gt; 3 meses</SelectItem>
                  <SelectItem value="6">Atraso &gt; 6 meses</SelectItem>
                  <SelectItem value="12">Atraso &gt; 12 meses</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="bg-white text-dashboard-red shrink-0 border-0 pointer-events-none">
                {pacientesAtrasados.length} casos
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            <div className="overflow-y-auto max-h-[220px]">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs hover:bg-transparent">
                    <TableHead className="h-8 pl-4">Paciente a Notificar</TableHead>
                    <TableHead className="h-8 text-right">Último Control</TableHead>
                    <TableHead className="h-8 w-28 text-right pr-4">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientesAtrasados.length > 0 ? (
                    pacientesAtrasados.map((p, i) => (
                      <TableRow key={p.id} className="text-xs">
                        <TableCell className="py-2 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-dashboard-red/10 text-dashboard-red text-[10px] font-bold shrink-0">
                              {p.nombre.charAt(0)}
                            </div>
                            <span className="font-medium truncate">{p.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground py-2 font-medium">Hace {p.mesesAtraso} meses</TableCell>
                        <TableCell className="py-2 pr-4 text-right">
                          <Button size="sm" variant="outline" className="h-7 text-xs border-dashboard-red/30 text-dashboard-red hover:bg-dashboard-red/10" onClick={() => abrirModalContacto(p)}>
                            <Mail className="h-3 w-3 mr-1" /> Contactar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                        No hay pacientes de riesgo atrasados con este filtro. ¡Excelente trabajo!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="border-t p-5 !pt-5 flex items-center justify-center">
            <Button variant="outline" size="sm" className="w-full text-xs font-medium gap-2 border-dashboard-red/30 text-dashboard-red hover:bg-dashboard-red/10 hover:text-dashboard-red" disabled={pacientesAtrasados.length === 0} onClick={() => alert("Simulando envío masivo a " + pacientesAtrasados.length + " pacientes...")}>
              <ArrowRight className="h-3.5 w-3.5" /> Enviar Notificaciones Masivas a Todos
            </Button>
          </CardFooter>
        </Card>

        {/* Dialog de Contacto (HU-04) */}
        <Dialog open={contactoOpen} onOpenChange={setContactoOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Generar Orden de Contacto
              </DialogTitle>
              <DialogDescription>
                Se enviará este mensaje preventivo por SMS/Email a {contactoPatient?.nombre}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <textarea
                className="w-full min-h-[140px] text-sm p-3 border rounded-md resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={mensajeContacto}
                onChange={(e) => setMensajeContacto(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContactoOpen(false)}>Cancelar</Button>
              <Button onClick={enviarContacto} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" /> Enviar Mensaje
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ══════ Reportes HU-10 (2 cols) ══════ */}
        <Card id="reportes" className="lg:col-span-2 shadow-sm border border-border overflow-hidden pt-0 [--card-spacing:0]">
          <CardHeader className="p-5 bg-dashboard-violet shadow-sm relative z-10">
            <CardTitle className="flex items-center gap-2 text-dashboard-violet-fg">
              <FileDown className="h-5 w-5" />
              Reportes Poblacionales
            </CardTitle>
            <CardDescription className="text-dashboard-violet-fg/85 text-xs">
              Exportación anonimizada para estudios (HU-10)
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <Card className="border-dashed shadow-none bg-muted/30">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-lg p-2 bg-dashboard-violet/10 text-dashboard-violet">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-xs text-muted-foreground flex-1">
                  Datos anonimizados conforme a la <span className="font-medium text-foreground">Ley 19.628</span>.
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/40">
              <span className="text-xs text-muted-foreground">Registros disponibles</span>
              <Badge variant="secondary">{pacientesDb.length}</Badge>
            </div>
          </CardContent>
          <CardFooter className="border-t p-5 !pt-5 flex items-center justify-center">
            <Button variant="outline" size="sm" className="w-full text-xs font-medium gap-2 border-dashboard-violet/30 text-dashboard-violet hover:bg-dashboard-violet/10 hover:text-dashboard-violet">
              <FileDown className="h-3.5 w-3.5" /> Descargar CSV Anonimizado
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ─── Guías Clínicas ─── */}
      <Card id="guias" className="shadow-sm border border-border overflow-hidden pt-0 [--card-spacing:0]">
        <CardHeader className="p-5 bg-dashboard-pink shadow-sm relative z-10">
          <CardTitle className="flex items-center gap-2 text-dashboard-pink-fg">
            <BookOpen className="h-5 w-5" />
            Soporte a la Decisión Clínica
          </CardTitle>
          <CardDescription className="text-dashboard-pink-fg/85 text-xs">
            Protocolos y guías médicas vigentes (HU-09)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Guía MINSAL 2026',  desc: 'Manejo de Hipertensión Arterial Primaria', icon: FileText,    bgClass: 'bg-dashboard-blue/10', fgClass: 'text-dashboard-blue' },
              { title: 'Protocolo SCORE2',   desc: 'Estratificación de Riesgo Cardiovascular', icon: HeartPulse,  bgClass: 'bg-dashboard-orange/10', fgClass: 'text-dashboard-orange' },
              { title: 'Guía Farmacológica', desc: 'Estatinas y terapia antihipertensiva',     icon: Stethoscope, bgClass: 'bg-dashboard-green/10', fgClass: 'text-dashboard-green' },
            ].map(g => (
              <Card key={g.title} className="cursor-pointer hover:shadow-md transition-all group shadow-sm border-border">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`rounded-lg p-2 ${g.bgClass} ${g.fgClass} shrink-0`}>
                    <g.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{g.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{g.desc}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
