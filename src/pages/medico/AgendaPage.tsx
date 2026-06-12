import { useState, useMemo, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { db, type CitaMedica, type PatientRecord } from '@/db/mockDb';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, PlusCircle, Search, User, CheckCircle2 } from 'lucide-react';
import { calcularRiesgoSCORE2, calcularEdad } from '@/lib/clinical';

// Configuración de horas para la vista semanal (08:00 a 20:00)
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

export default function AgendaPage() {
  const pacientesDb = useMemo(() => db.getAll(), []);

  const [triggerCount, setTriggerCount] = useState(0);
  const citasTotales = useMemo(() => db.getAllCitas(), [triggerCount]);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar a Lunes
    return new Date(d.setDate(diff));
  });

  const [searchPatient, setSearchPatient] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(() => new Set(db.getAll().map(p => p.id)));

  const togglePatientFilter = (id: string) => {
    const newSet = new Set(selectedPatients);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPatients(newSet);
  };

  const citasFiltradas = useMemo(() => {
    return citasTotales.filter(c => selectedPatients.has(c.patientId));
  }, [citasTotales, selectedPatients]);

  // Modals
  const [isAgendarOpen, setIsAgendarOpen] = useState(false);
  const [selectedProactivoId, setSelectedProactivoId] = useState<string | null>(null);
  const [newCitaPatient, setNewCitaPatient] = useState('');
  const [newCitaDate, setNewCitaDate] = useState('');
  const [newCitaTime, setNewCitaTime] = useState('');

  // Reschedule state
  const [citaToReschedule, setCitaToReschedule] = useState<CitaMedica | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Removed useEffect in favor of useMemo para citasTotales

  const pacientesAtrasados = useMemo(() => {
    return pacientesDb.filter(p => {
      const edad = calcularEdad(p.fechaNacimiento || '1970-01-01');
      const mediciones = p.mediciones || [];
      if (mediciones.length === 0) return false;
      const lastM = mediciones[mediciones.length - 1];
      const riesgo = calcularRiesgoSCORE2(edad, lastM.presionSistolica);
      if (riesgo !== 'ALTO' && riesgo !== 'MUY_ALTO') return false;
      return true;
    }).map(p => {
      const lastDate = new Date(p.mediciones![p.mediciones!.length - 1].fecha).getTime();
      const diffMonths = (new Date().getTime() - lastDate) / (1000 * 60 * 60 * 24 * 30);
      return { ...p, mesesAtraso: Math.floor(diffMonths) };
    }).sort((a, b) => b.mesesAtraso - a.mesesAtraso);
  }, [pacientesDb]);

  const handleAgendarSubmit = () => {
    if ((selectedProactivoId || newCitaPatient) && newCitaDate && newCitaTime) {
      db.addCita(selectedProactivoId || newCitaPatient, newCitaDate, newCitaTime);
      setIsAgendarOpen(false);
      setSelectedProactivoId(null);
      setNewCitaPatient('');
      setNewCitaDate('');
      setNewCitaTime('');
      setTriggerCount(c => c + 1);
    }
  };

  const agendarProactivo = (pacienteId: string) => {
    setSelectedProactivoId(pacienteId);
    setNewCitaDate('');
    setNewCitaTime('');
    setIsAgendarOpen(true);
  };

  const updateEstado = (id: string, newEstado: string) => {
    db.updateCitaStatus(id, newEstado as 'pendiente' | 'completada' | 'en_curso' | 'ausente');
    setTriggerCount(c => c + 1);
  };

  const handleReschedule = () => {
    if (citaToReschedule && rescheduleDate && rescheduleTime) {
      db.rescheduleCita(citaToReschedule.id, rescheduleDate, rescheduleTime);
      setCitaToReschedule(null);
      setRescheduleDate('');
      setRescheduleTime('');
      setTriggerCount(c => c + 1);
    }
  };

  const handlePrev = () => {
    const d = new Date(currentWeekStart);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNext = () => {
    const d = new Date(currentWeekStart);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const endOfWeek = new Date(currentWeekStart);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const title = view === 'month'
    ? currentWeekStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())
    : `${currentWeekStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())} (Del ${currentWeekStart.getDate()} al ${endOfWeek.getDate()})`;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300 overflow-hidden">

      {/* ─── LEFT COLUMN: MANAGEMENT PANELS ─── */}
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pb-2">

        {/* Búsqueda Rápida y Filtros */}
        <Card className="shadow-sm border-border flex flex-col max-h-[400px]">
          <CardHeader className="p-4 pb-3 shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" /> Filtro de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1 flex flex-col overflow-hidden">
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nombre o RUT..."
                className="pl-9 h-9 text-sm"
                value={searchPatient}
                onChange={e => setSearchPatient(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 border rounded-md p-2">
              {pacientesDb
                .filter(p => !searchPatient || p.nombre.toLowerCase().includes(searchPatient.toLowerCase()) || p.rut.includes(searchPatient))
                .map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      id={`chk-${p.id}`}
                      checked={selectedPatients.has(p.id)}
                      onChange={() => togglePatientFilter(p.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor={`chk-${p.id}`} className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                        {p.nombre.charAt(0)}
                      </div>
                      <span className="text-sm font-medium truncate">{p.nombre}</span>
                    </label>
                  </div>
                ))}
              {pacientesDb.length > 0 && pacientesDb.filter(p => !searchPatient || p.nombre.toLowerCase().includes(searchPatient.toLowerCase()) || p.rut.includes(searchPatient)).length === 0 && (
                <div className="text-center p-4 text-sm text-muted-foreground">No se encontraron resultados.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agendamiento Proactivo */}
        <Card className="flex-1 shadow-sm border-border flex flex-col min-h-[300px]">
          <CardHeader className="p-5 bg-dashboard-red shadow-sm relative z-10">
            <CardTitle className="flex items-center gap-2 text-dashboard-red-fg">
              <CalendarClock className="h-5 w-5" />
              Rescate Proactivo
            </CardTitle>
            <CardDescription className="text-dashboard-red-fg/85 text-xs mt-1">
              Pacientes críticos (SCORE2 Alto/Muy Alto) sin controles.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0 flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="3m" className="h-full flex flex-col">
              <TabsList variant="line" className="w-full grid grid-cols-3 mb-2 shrink-0 border-b">
                <TabsTrigger value="3m" className="text-xs">&gt; 3 Meses</TabsTrigger>
                <TabsTrigger value="6m" className="text-xs">&gt; 6 Meses</TabsTrigger>
                <TabsTrigger value="12m" className="text-xs">&gt; 12 Meses</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-3">
                {['3m', '6m', '12m'].map(tab => {
                  const limit = tab === '3m' ? 3 : tab === '6m' ? 6 : 12;
                  const filtrados = pacientesAtrasados.filter(p => p.mesesAtraso >= limit);
                  return (
                    <TabsContent key={tab} value={tab} className="m-0 h-full">
                      {filtrados.length > 0 ? filtrados.map(p => (
                        <div key={p.id} className="flex flex-col p-3 rounded-lg border border-border bg-card shadow-sm mb-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-sm leading-tight">{p.nombre}</div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                              Hace {p.mesesAtraso}m
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" /> RUT: {p.rut.split('-')[0]}
                            </span>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => agendarProactivo(p.id)}>
                              Agendar
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                          <CheckCircle2 className="h-8 w-8 mb-2" />
                          <p className="text-sm">No hay pacientes rezagados</p>
                        </div>
                      )}
                    </TabsContent>
                  )
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* ─── RIGHT COLUMN: CALENDAR (Fills space) ─── */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden min-w-0">
        {/* Calendar Header */}
        <div className="h-16 shrink-0 border-b flex items-center justify-between px-6 bg-muted/20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-tight">
              {title}
            </h2>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handlePrev}>‹</Button>
              <Button variant="outline" size="sm" onClick={handleNext}>›</Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-muted p-1 rounded-lg flex text-sm items-center">
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${view === 'week' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >Semana</button>
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${view === 'month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >Mes</button>
            </div>

            <div className="h-6 w-px bg-border mx-1"></div>

            <Button variant="outline" size="sm" onClick={() => {
              const d = new Date();
              const day = d.getDay();
              setCurrentWeekStart(new Date(d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))));
            }}>Hoy</Button>

            <Button onClick={() => setIsAgendarOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 ml-2">
              <PlusCircle className="h-4 w-4" /> Agendar
            </Button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-y-auto overflow-x-auto relative bg-background custom-scrollbar">
          {view === 'week' ? (
            <WeeklyView citas={citasFiltradas} currentWeekStart={currentWeekStart} pacientes={pacientesDb} onUpdateEstado={updateEstado} onReschedule={(cita) => {
              setCitaToReschedule(cita);
              setRescheduleDate(cita.fecha);
              setRescheduleTime(cita.hora);
            }} />
          ) : (
            <MonthlyView citas={citasFiltradas} currentMonthStart={currentWeekStart} pacientes={pacientesDb} />
          )}
        </div>
      </div>

      {/* Modal Agendar Cita */}
      <Dialog open={isAgendarOpen} onOpenChange={setIsAgendarOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              Programar Nueva Cita
            </DialogTitle>
            <DialogDescription>
              Seleccione al paciente, fecha y hora para ingresarlo al calendario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paciente</label>
              <Select value={newCitaPatient} onValueChange={setNewCitaPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {pacientesDb.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre} (RUT: {p.rut})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input type="date" value={newCitaDate} onChange={e => setNewCitaDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <Input type="time" value={newCitaTime} onChange={e => setNewCitaTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAgendarOpen(false)}>Cancelar</Button>
            <Button onClick={handleAgendarSubmit} disabled={!newCitaPatient || !newCitaDate || !newCitaTime} className="bg-blue-600 hover:bg-blue-700">
              Confirmar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Reagendar Cita */}
      <Dialog open={!!citaToReschedule} onOpenChange={(open) => !open && setCitaToReschedule(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reagendar Cita</DialogTitle>
            <DialogDescription>
              Seleccione la nueva fecha y hora para la cita de {pacientesDb.find(p => p.id === citaToReschedule?.patientId)?.nombre}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="res-date" className="text-right">Fecha</Label>
              <Input id="res-date" type="date" className="col-span-3" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="res-time" className="text-right">Hora</Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione hora" />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map(h => (
                    <SelectItem key={h} value={`${h.toString().padStart(2, '0')}:00`}>
                      {h.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCitaToReschedule(null)}>Cancelar</Button>
            <Button onClick={handleReschedule} className="bg-blue-600">Reagendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY VIEW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ViewProps {
  citas: CitaMedica[];
  pacientes: PatientRecord[];
}

interface WeeklyViewProps extends ViewProps {
  currentWeekStart: Date;
  onUpdateEstado: (id: string, estado: string) => void;
  onReschedule: (cita: CitaMedica) => void;
}

function WeeklyView({ citas, currentWeekStart, pacientes, onUpdateEstado, onReschedule }: WeeklyViewProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update line every minute
    return () => clearInterval(timer);
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getCitasForDay = (date: Date) => {
    const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return citas.filter((c: CitaMedica) => c.fecha === dateStr);
  };

  const getTopPosition = (hora: string) => {
    const [h, m] = hora.split(':').map(Number);
    if (h < 8 || h > 20) return 0;
    return ((h - 8) * 80) + (m * 80 / 60);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="min-w-[800px] h-full flex flex-col">
      {/* Grid Header (Days) */}
      <div className="flex border-b sticky top-0 bg-background z-20">
        <div className="w-16 shrink-0 border-r" /> {/* Time axis corner */}
        <div className="flex-1 grid grid-cols-7">
          {days.map((day, i) => (
            <div key={i} className={`py-3 text-center border-r last:border-r-0 ${isToday(day) ? 'bg-blue-50/50' : ''}`}>
              <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                {day.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div className={`text-xl font-light ${isToday(day) ? 'text-blue-600 font-bold bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-foreground'}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Body */}
      <div className="flex-1 flex relative">
        <div className="w-16 shrink-0 border-r bg-muted/5 z-10 flex flex-col">
          {HOURS.map(h => (
            <div key={h} className="h-[80px] relative">
              <span className="absolute -top-3 right-2 text-xs font-medium text-muted-foreground">
                {h.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Days Columns */}
        <div className="flex-1 grid grid-cols-7 relative">
          <div className="absolute inset-0 pointer-events-none flex flex-col">
            {HOURS.map(h => (
              <div key={h} className="h-[80px] border-b border-border/50" />
            ))}
          </div>

          {/* Daily Slots & Appointments */}
          {days.map((day, dayIndex) => {
            const dayCitas = getCitasForDay(day);
            return (
              <div key={dayIndex} className={`relative border-r last:border-r-0 ${isToday(day) ? 'bg-blue-50/20' : ''}`}>

                {isToday(day) && now.getHours() >= 8 && now.getHours() <= 20 && (
                  <div
                    className="absolute left-0 right-0 h-px bg-red-500 z-20 pointer-events-none shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                    style={{ top: `${((now.getHours() - 8) * 80) + (now.getMinutes() * 80 / 60)}px` }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                )}
                {dayCitas.map((cita: CitaMedica) => {
                  const paciente = pacientes.find((p: PatientRecord) => p.id === cita.patientId);
                  const top = getTopPosition(cita.hora);

                  // Color codes
                  let bgClass = 'bg-blue-100 border-blue-200 text-blue-900';
                  if (cita.estado === 'completada') bgClass = 'bg-green-100 border-green-200 text-green-900 opacity-70';
                  if (cita.estado === 'en_curso') bgClass = 'bg-yellow-100 border-yellow-200 text-yellow-900 shadow-md ring-1 ring-yellow-400';
                  if (cita.estado === 'ausente') bgClass = 'bg-red-100 border-red-200 text-red-900 opacity-60 line-through';

                  return (
                    <div
                      key={cita.id}
                      className={`absolute left-1 right-1 rounded-md border p-1.5 text-[11px] leading-tight overflow-hidden cursor-pointer hover:shadow-md transition-all z-10 flex flex-col justify-between ${bgClass}`}
                      style={{ top: `${top}px`, height: '78px' }} // 78px fills the 80px hour slot cleanly
                      onClick={() => onReschedule(cita)}
                    >
                      <div className="font-bold line-clamp-2">
                        {cita.hora} - {paciente ? `${paciente.nombre} (${calcularEdad(paciente.fechaNacimiento)})` : 'Desconocido'}
                      </div>
                      <div className="flex justify-between items-center mt-auto" onClick={e => e.stopPropagation()}>
                        <span className="text-[9px] uppercase font-bold opacity-80 truncate pr-1">{cita.estado.replace('_', ' ')}</span>
                        <div className="flex items-center">
                          <Select value={cita.estado} onValueChange={(v) => onUpdateEstado(cita.id, v)}>
                            <SelectTrigger className="h-4 w-4 p-0 border-0 bg-transparent text-current shadow-none focus:ring-0 [&>svg]:hidden flex-shrink-0">
                              <div className="h-4 w-4 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center">▾</div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="en_curso">En Curso</SelectItem>
                              <SelectItem value="completada">Completada</SelectItem>
                              <SelectItem value="ausente">Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY VIEW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface MonthlyViewProps extends ViewProps {
  currentMonthStart: Date;
}

function MonthlyView({ citas, currentMonthStart, pacientes }: MonthlyViewProps) {
  // Generar cuadrícula de 5 semanas para el mes actual
  const { setCurrentPatientId } = usePatient();
  const monthStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth(), 1);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1)); // Lunes previo

  const gridDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const getCitasForDay = (date: Date) => {
    const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return citas.filter((c: CitaMedica) => c.fecha === dateStr).sort((a: CitaMedica, b: CitaMedica) => a.hora.localeCompare(b.hora));
  };

  return (
    <div className="min-w-[600px] h-full flex flex-col">
      {/* Header Días */}
      <div className="grid grid-cols-7 border-b shrink-0 bg-muted/20">
        {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-bold text-muted-foreground tracking-wider border-r last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Grid Mensual */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5">
        {gridDays.map((day, i) => {
          const dayCitas = getCitasForDay(day);
          const isCurrentMonth = day.getMonth() === currentMonthStart.getMonth();

          return (
            <div key={i} className={`border-r border-b p-1 overflow-hidden flex flex-col ${!isCurrentMonth ? 'bg-muted/10 opacity-50' : ''} ${isToday(day) ? 'bg-blue-50/30' : ''}`}>
              <div className={`text-xs font-medium text-right p-1 mb-1 ${isToday(day) ? 'text-blue-600 font-bold' : ''}`}>
                {isToday(day) ? <span className="bg-blue-600 text-white rounded-full w-5 h-5 inline-flex items-center justify-center">{day.getDate()}</span> : day.getDate()}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {dayCitas.map((cita: CitaMedica) => {
                  const paciente = pacientes.find((p: PatientRecord) => p.id === cita.patientId);
                  return (
                    <div
                      key={cita.id}
                      onClick={() => paciente && setCurrentPatientId(paciente.id)}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80
                        ${cita.estado === 'completada' ? 'bg-green-100 text-green-800' :
                          cita.estado === 'en_curso' ? 'bg-yellow-100 text-yellow-800 font-bold ring-1 ring-yellow-400' :
                            cita.estado === 'ausente' ? 'bg-red-100 text-red-800 line-through' :
                              'bg-blue-100 text-blue-800'}`}
                    >
                      {cita.hora} {paciente?.nombre.split(' ')[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
