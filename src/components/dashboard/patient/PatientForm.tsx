import { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { db, type Sexo } from '@/db/mockDb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, User, Save, CalendarIcon } from 'lucide-react';

interface PatientFormProps {
  onRecordSaved: () => void;
}

export function PatientForm({ onRecordSaved }: PatientFormProps) {
  const { currentPatientId, setCurrentPatientId } = usePatient();
  const isNew = currentPatientId === 'NUEVO';
  const currentPatient = !isNew ? db.getById(currentPatientId!) : null;

  // Estado del paciente (Estático)
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState<Sexo | ''>('');
  const [tabaquismo, setTabaquismo] = useState(false);

  // Estado de la nueva medición
  const [fechaMedicion, setFechaMedicion] = useState(new Date().toISOString().split('T')[0]);
  const [peso, setPeso] = useState<number | ''>('');
  const [talla, setTalla] = useState<number | ''>('');
  const [presionSistolica, setPresionSistolica] = useState<number | ''>('');
  const [presionDiastolica, setPresionDiastolica] = useState<number | ''>('');
  const [colesterol, setColesterol] = useState<number | ''>('');
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState<number | ''>('');
  const [hba1c, setHba1c] = useState<number | ''>('');
  const [comentarioMedico, setComentarioMedico] = useState('');

  useEffect(() => {
    if (currentPatient) {
      setRut(currentPatient.rut);
      setNombre(currentPatient.nombre);
      setFechaNacimiento(currentPatient.fechaNacimiento);
      setSexo(currentPatient.sexo);
      setTabaquismo(currentPatient.tabaquismo || false);
    } else {
      setRut(''); setNombre(''); setFechaNacimiento(''); setSexo(''); setTabaquismo(false);
    }
    // Reiniciar inputs de medición
    setFechaMedicion(new Date().toISOString().split('T')[0]);
    setPeso(''); setTalla(''); setPresionSistolica(''); setPresionDiastolica(''); setColesterol('');
    setFrecuenciaCardiaca(''); setHba1c(''); setComentarioMedico('');
  }, [currentPatientId, currentPatient]);

  const isValidacionBasica = peso && talla && presionSistolica && presionDiastolica && comentarioMedico;
  const isRangosValidos = (peso && peso >= 20 && peso <= 300) && 
                          (talla && talla >= 0.5 && talla <= 2.5) &&
                          (presionSistolica && presionSistolica >= 60 && presionSistolica <= 250) &&
                          (presionDiastolica && presionDiastolica >= 30 && presionDiastolica <= 150);

  const handleGuardar = () => {
    if (isNew) {
      if (!rut || !nombre || !fechaNacimiento || !sexo || !isValidacionBasica) {
        alert("Faltan campos obligatorios");
        return;
      }
      if (!isRangosValidos) {
        alert("Hay valores clínicos fuera de rangos posibles (revisar peso, talla o presión).");
        return;
      }
      const newRecord = db.save({
        rut, nombre, fechaNacimiento, sexo, tabaquismo
      });
      db.addMedicion(newRecord.id, {
        fecha: fechaMedicion,
        peso: Number(peso),
        talla: Number(talla),
        presionSistolica: Number(presionSistolica),
        presionDiastolica: Number(presionDiastolica),
        colesterol: Number(colesterol) || undefined,
        frecuenciaCardiaca: Number(frecuenciaCardiaca) || undefined,
        hba1c: Number(hba1c) || undefined,
        comentarioMedico,
        profesionalRegistro: "Dr. Andrés Silva"
      });
      setCurrentPatientId(newRecord.id);
    } else {
      if (!isValidacionBasica) {
        alert("Faltan datos de la medición o comentario médico");
        return;
      }
      if (!isRangosValidos) {
        alert("Hay valores clínicos fuera de rangos posibles (revisar peso, talla o presión).");
        return;
      }
      db.addMedicion(currentPatientId!, {
        fecha: fechaMedicion,
        peso: Number(peso),
        talla: Number(talla),
        presionSistolica: Number(presionSistolica),
        presionDiastolica: Number(presionDiastolica),
        colesterol: Number(colesterol) || undefined,
        frecuenciaCardiaca: Number(frecuenciaCardiaca) || undefined,
        hba1c: Number(hba1c) || undefined,
        comentarioMedico,
        profesionalRegistro: "Dr. Andrés Silva"
      });
    }
    onRecordSaved();
    alert("Datos guardados exitosamente");
    // Limpiar medición
    setPeso(''); setTalla(''); setPresionSistolica(''); setPresionDiastolica(''); setColesterol('');
    setFrecuenciaCardiaca(''); setHba1c(''); setComentarioMedico('');
  };

  return (
    <div className="space-y-4">
      {isNew && (
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" /> Datos Demográficos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">RUT</label>
              <Input value={rut} onChange={e => setRut(e.target.value)} placeholder="Ej: 12.345.678-9" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Nombre Completo</label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">F. Nacimiento</label>
                <Input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Sexo Biológico</label>
                <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Tabaquismo</label>
                <Select value={tabaquismo ? 'SI' : 'NO'} onValueChange={(v) => setTabaquismo(v === 'SI')}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO">No Fumador</SelectItem>
                    <SelectItem value="SI">Fumador Activo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" /> Registrar Medición
          </CardTitle>
          <CardDescription>Nueva toma de signos vitales.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">

          <div className="space-y-1">
            <label className="text-xs font-semibold flex items-center gap-2">
              <CalendarIcon className="h-3 w-3" /> Fecha de Medición
            </label>
            <Input type="date" value={fechaMedicion} onChange={e => setFechaMedicion(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-purple-700">Peso (kg)</label>
              <Input type="number" value={peso} onChange={e => setPeso(Number(e.target.value))} className="border-purple-200 focus-visible:ring-purple-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-teal-700">Altura (m)</label>
              <Input type="number" step="0.01" value={talla} onChange={e => setTalla(Number(e.target.value))} className="border-teal-200 focus-visible:ring-teal-500" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <label className="text-xs font-semibold">Presión Arterial (Sis/Dia)</label>
            <div className="flex gap-2 items-center">
              <Input type="number" value={presionSistolica} onChange={e => setPresionSistolica(Number(e.target.value))} placeholder="Max (Sistólica)" className="border-red-200 focus-visible:ring-red-500 text-red-700" />
              <span className="text-gray-400">/</span>
              <Input type="number" value={presionDiastolica} onChange={e => setPresionDiastolica(Number(e.target.value))} placeholder="Min (Diastólica)" className="border-blue-200 focus-visible:ring-blue-500 text-blue-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-rose-600">Frecuencia Cardíaca</label>
              <Input type="number" value={frecuenciaCardiaca} onChange={e => setFrecuenciaCardiaca(Number(e.target.value))} placeholder="lpm" className="border-rose-200 focus-visible:ring-rose-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-amber-600">Colesterol no-HDL</label>
              <Input type="number" value={colesterol} onChange={e => setColesterol(Number(e.target.value))} placeholder="mg/dL" className="border-amber-200 focus-visible:ring-amber-500" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-fuchsia-600">Hemoglobina Glicosilada (HbA1c %)</label>
              <Input type="number" step="0.1" value={hba1c} onChange={e => setHba1c(Number(e.target.value))} placeholder="Ej: 5.7" className="border-fuchsia-200 focus-visible:ring-fuchsia-500" />
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t">
            <label className="text-xs font-semibold">Comentario Médico de Evolución <span className="text-red-500">*</span></label>
            <textarea 
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Justifique los cambios clínicos, evolución del paciente y adherencia..."
              value={comentarioMedico}
              onChange={e => setComentarioMedico(e.target.value)}
            />
          </div>

          <Button onClick={handleGuardar} disabled={!isValidacionBasica} className="w-full mt-4 shadow-sm">
            <Save className="mr-2 h-4 w-4" /> Guardar Registro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
