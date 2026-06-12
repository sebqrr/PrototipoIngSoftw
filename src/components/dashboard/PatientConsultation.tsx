import { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { db } from '@/db/mockDb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { User, Pill, Download, Heart } from 'lucide-react';
import { calcularEdad, calcularRiesgoSCORE2, configRiesgo } from '@/lib/clinical';
import { RecetaPDF } from '@/components/pdf/RecetaPDF';
import { PatientForm } from '@/components/dashboard/patient/PatientForm';
import { PatientTabs } from '@/components/dashboard/patient/PatientTabs';
import { ClinicalAlerts } from '@/components/dashboard/patient/ClinicalAlerts';

interface PatientConsultationProps {
  onRecordSaved: () => void;
}

export function PatientConsultation({ onRecordSaved }: PatientConsultationProps) {
  const { currentPatientId } = usePatient();
  const isNew = currentPatientId === 'NUEVO';
  const currentPatient = !isNew ? db.getById(currentPatientId!) : null;

  // Estado para la receta
  const [medicamentosReceta, setMedicamentosReceta] = useState<{nombre: string, indicacion: string, diasTratamiento?: number}[]>([{ nombre: '', indicacion: '', diasTratamiento: 30 }]);
  const [recetaOpen, setRecetaOpen] = useState(false);
  const [folioActual, setFolioActual] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
  const [fechaHoraReceta, setFechaHoraReceta] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (currentPatient && !isNew) {
      db.logAction('Médico (Dr. Andrés Silva)', 'Acceso a Ficha Clínica', `Visualizó la ficha del paciente ${currentPatient.rut}.`, '10.0.0.45');
    }
  }, [currentPatient?.id, isNew]);

  const handleAddMed = () => setMedicamentosReceta([...medicamentosReceta, { nombre: '', indicacion: '', diasTratamiento: 30 }]);
  const handleRemoveMed = (index: number) => setMedicamentosReceta(medicamentosReceta.filter((_, i) => i !== index));
  const updateMed = (index: number, field: 'nombre' | 'indicacion' | 'diasTratamiento', value: string | number) => {
    const newMeds = [...medicamentosReceta];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMedicamentosReceta(newMeds);
  };

  const edadActual = currentPatient?.fechaNacimiento ? calcularEdad(currentPatient.fechaNacimiento) : 0;
  const mediciones = currentPatient?.mediciones || [];
  const lastM = mediciones[mediciones.length - 1];
  const riesgoActual = (lastM && edadActual) ? calcularRiesgoSCORE2(edadActual, lastM.presionSistolica) : 'BAJO';

  return (
    <div className="space-y-6 fade-in duration-300">

      {/* HEADER ESTÁTICO DEL PACIENTE */}
      {!isNew && currentPatient && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{currentPatient.nombre}</h2>
              <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                <span>RUT: {currentPatient.rut}</span>
                <span>•</span>
                <span>{edadActual} años</span>
                <span>•</span>
                <span>{currentPatient.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                <span>•</span>
                <span className={currentPatient.tabaquismo ? 'text-red-500 font-semibold' : ''}>
                  {currentPatient.tabaquismo ? 'Fumador' : 'No Fumador'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Botón de Emitir Receta Médica */}
            <Dialog open={recetaOpen} onOpenChange={setRecetaOpen}>
              <DialogTrigger render={
                <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50" />
              }>
                <Pill className="h-4 w-4" /> Emitir Receta
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" /> Nueva Receta Médica
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    {medicamentosReceta.map((med, index) => (
                      <div key={index} className="flex gap-2 items-start border p-3 rounded-lg bg-muted/30">
                        <div className="flex-grow space-y-2">
                          <Input placeholder="Nombre del medicamento (Ej. Losartán 50mg)" value={med.nombre} onChange={(e) => updateMed(index, 'nombre', e.target.value)} />
                          <Input placeholder="Indicación (Ej. 1 comprimido cada 12 horas)" value={med.indicacion} onChange={(e) => updateMed(index, 'indicacion', e.target.value)} />
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Días de Tratamiento:</span>
                            <Input type="number" min="1" max="365" placeholder="Ej. 30" value={med.diasTratamiento || ''} onChange={(e) => updateMed(index, 'diasTratamiento', parseInt(e.target.value) || 0)} className="w-24" />
                          </div>
                        </div>
                        {medicamentosReceta.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveMed(index)} className="text-red-500 hover:text-red-700 shrink-0">✕</Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddMed} className="w-full mt-2">+ Añadir otro medicamento</Button>
                  </div>

                  {medicamentosReceta[0].nombre ? (
                    <PDFDownloadLink
                      document={<RecetaPDF paciente={currentPatient.nombre} rut={currentPatient.rut} medico="Dr. Andrés Silva" medicamentos={medicamentosReceta} folio={folioActual} fechaHora={fechaHoraReceta} />}
                      fileName={`receta_${currentPatient.rut}_${folioActual}.pdf`}
                    >
                      {({ loading }) => (
                        <Button className="w-full gap-2" onClick={() => {
                          db.addReceta(currentPatient.id, {
                            folio: folioActual,
                            fechaHora: fechaHoraReceta,
                            medico: "Dr. Andrés Silva",
                            medicamentos: medicamentosReceta.filter(m => m.nombre)
                          });
                          db.logAction('Médico (Dr. Andrés Silva)', 'Emisión de Receta', `Emitió receta folio ${folioActual} para paciente ${currentPatient.rut}.`, '10.0.0.45');
                          onRecordSaved();
                          setTimeout(() => {
                            setRecetaOpen(false);
                            setMedicamentosReceta([{ nombre: '', indicacion: '', diasTratamiento: 30 }]);
                            setFolioActual(Math.random().toString(36).substring(2, 10).toUpperCase());
                            setFechaHoraReceta(new Date().toISOString());
                          }, 500);
                        }}>
                          {loading ? 'Generando...' : <><Download className="h-4 w-4" /> Generar y Guardar Receta</>}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <Button disabled className="gap-2"><Download className="h-4 w-4" /> Generar y Guardar Receta</Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {lastM && (
              <div className={`px-4 py-2 rounded-lg border ${configRiesgo[riesgoActual].color} bg-white flex items-center gap-3`}>
                <Heart className="h-6 w-6" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Riesgo SCORE2</span>
                  <span className="font-extrabold text-lg leading-none">{configRiesgo[riesgoActual].text}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALERTAS CLÍNICAS Y SOPORTE A LA DECISIÓN */}
      {!isNew && currentPatient && (
        <ClinicalAlerts patient={currentPatient} riesgoActual={riesgoActual} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-4 space-y-4">
          <PatientForm onRecordSaved={onRecordSaved} />
        </div>

        {/* COLUMNA DERECHA: RESULTADOS E HISTÓRICO */}
        <div className="lg:col-span-8 space-y-6">
          {mediciones.length > 0 && currentPatient && (
            <PatientTabs 
              currentPatient={currentPatient} 
              mediciones={mediciones} 
              edadActual={edadActual} 
              riesgoActual={riesgoActual} 
              onRecordSaved={onRecordSaved}
            />
          )}
        </div>
      </div>
    </div>
  );
}
