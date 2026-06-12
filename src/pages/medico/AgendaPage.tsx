import { useState, useMemo } from 'react';
import { usePatient } from '@/context/PatientContext';
import { db } from '@/db/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { CalendarClock, PlusCircle, Clock } from 'lucide-react';
import { calcularRiesgoSCORE2, calcularEdad } from '@/lib/clinical';

export default function AgendaPage() {
  const { setCurrentPatientId } = usePatient();
  const pacientesDb = useMemo(() => db.getAll(), []);

  // Estado del Calendario y Citas
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [triggerCount, setTriggerCount] = useState(0); // Trigger re-render after DB write
  
  // Estado para Agendar
  const [isAgendarOpen, setIsAgendarOpen] = useState(false);
  const [newCitaPatient, setNewCitaPatient] = useState('');
  const [newCitaDate, setNewCitaDate] = useState('');
  const [newCitaTime, setNewCitaTime] = useState('');

  // Agendamiento Proactivo
  const [atrasoMeses, setAtrasoMeses] = useState(3);

  const citasDelDia = useMemo(() => {
    if (selectedDate) {
      // Ajuste de Timezone para YYYY-MM-DD correcto
      const offset = selectedDate.getTimezoneOffset();
      const dateLocal = new Date(selectedDate.getTime() - (offset * 60 * 1000));
      const dateStr = dateLocal.toISOString().split('T')[0];
      return db.getCitasByDate(dateStr);
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, triggerCount]);

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

  const handleAgendarSubmit = () => {
    if (newCitaPatient && newCitaDate && newCitaTime) {
      db.addCita(newCitaPatient, newCitaDate, newCitaTime);
      setIsAgendarOpen(false);
      setNewCitaPatient('');
      setNewCitaDate('');
      setNewCitaTime('');
      setSelectedDate(new Date(newCitaDate + 'T12:00:00'));
      setTriggerCount(c => c + 1);
    }
  };

  const updateEstado = (citaId: string, estado: string) => {
    db.updateCitaStatus(citaId, estado as 'pendiente' | 'completada' | 'en_curso' | 'ausente');
    setTriggerCount(c => c + 1);
  };

  const agendarProactivo = (pacienteId: string) => {
    setNewCitaPatient(pacienteId);
    setNewCitaDate('');
    setNewCitaTime('');
    setIsAgendarOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda Médica y Gestión</h1>
          <p className="text-muted-foreground mt-1">Calendario de citas y rescate preventivo de pacientes.</p>
        </div>
        <Button onClick={() => setIsAgendarOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="h-4 w-4" /> Agendar Cita
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CALENDARIO Y CITAS */}
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-6">
          <Card className="flex-shrink-0 h-fit shadow-sm border border-border">
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card className="flex-1 shadow-sm border border-border flex flex-col min-h-[400px]">
            <CardHeader className="p-5 bg-dashboard-green shadow-sm relative z-10">
              <CardTitle className="flex items-center gap-2 text-dashboard-green-fg">
                <Clock className="h-5 w-5" />
                Citas del {selectedDate ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }) : 'día'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-20">Hora</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="text-right pr-6">Estado / Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citasDelDia.length > 0 ? (
                    citasDelDia.map((cita) => {
                      const paciente = pacientesDb.find(p => p.id === cita.patientId);
                      return (
                        <TableRow key={cita.id} className="hover:bg-muted/30">
                          <TableCell className="pl-6 font-medium text-muted-foreground cursor-pointer" onClick={() => paciente && setCurrentPatientId(paciente.id)}>{cita.hora}</TableCell>
                          <TableCell className="font-semibold text-foreground cursor-pointer" onClick={() => paciente && setCurrentPatientId(paciente.id)}>
                            {paciente?.nombre || 'Desconocido'}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Select value={cita.estado} onValueChange={(v) => updateEstado(cita.id, v)}>
                              <SelectTrigger className="w-[130px] h-8 text-xs ml-auto border-0 bg-transparent hover:bg-muted font-medium justify-end space-x-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="en_curso">En Curso</SelectItem>
                                <SelectItem value="completada">Completada</SelectItem>
                                <SelectItem value="ausente">No asiste</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        No hay citas agendadas para este día.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* AGENDAMIENTO PROACTIVO */}
        <div className="lg:col-span-4">
          <Card className="flex flex-col h-full shadow-sm border border-border">
            <CardHeader className="p-5 bg-dashboard-red shadow-sm relative z-10 space-y-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-dashboard-red-fg">
                  <CalendarClock className="h-5 w-5" />
                  Agendamiento Proactivo
                </CardTitle>
                <CardDescription className="text-dashboard-red-fg/85 text-xs mt-1">
                  Rescate preventivo de Alto Riesgo.
                </CardDescription>
              </div>
              <Select value={atrasoMeses.toString()} onValueChange={(v) => setAtrasoMeses(Number(v))}>
                <SelectTrigger className="w-full h-8 text-xs bg-white text-dashboard-red-fg">
                  <SelectValue placeholder="Filtro de Atraso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Atraso &gt; 3 meses</SelectItem>
                  <SelectItem value="6">Atraso &gt; 6 meses</SelectItem>
                  <SelectItem value="12">Atraso &gt; 12 meses</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="overflow-y-auto max-h-[350px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Paciente a Rescatar</TableHead>
                      <TableHead className="text-right pr-4">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pacientesAtrasados.length > 0 ? (
                      pacientesAtrasados.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="pl-4">
                            <div className="font-semibold">{p.nombre}</div>
                            <div className="text-xs text-muted-foreground font-medium">Hace {p.mesesAtraso} meses</div>
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <Button size="sm" variant="outline" className="h-7 text-xs border-dashboard-red/30 text-dashboard-red hover:bg-dashboard-red/10" onClick={() => agendarProactivo(p.id)}>
                              Agendar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground text-sm">
                          Agenda al día.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
