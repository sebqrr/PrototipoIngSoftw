export type Sexo = 'M' | 'F';
import { ecgNormalData, ecgAbnormalData } from './ecgSamples';

export interface PresionEvolucion {
  fecha: string;
  sistolica: number;
  diastolica: number;
}

export interface MedicamentoReceta {
  nombre: string;
  indicacion: string;
  diasTratamiento?: number;
}

export interface TomaMedicamento {
  id: string;
  recetaId: string;
  medicamentoNombre: string;
  fechaHora: string;
}

export interface Receta {
  id: string;
  folio: string;
  fechaHora: string;
  medico: string;
  medicamentos: MedicamentoReceta[];
}

export interface ExamenDICOM {
  id: string;
  fecha: string;
  tipo: string;
  imageUrl?: string;
  ecgData?: number[];
  resultado?: 'Normal' | 'Anormal';
}

export interface CitaMedica {
  id: string;
  patientId: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  estado: 'pendiente' | 'completada' | 'en_curso' | 'ausente';
}

export interface Medicion {
  id: string;
  fecha: string;
  peso: number;
  talla: number;
  presionSistolica: number;
  presionDiastolica: number;
  colesterolNoHDL?: number;
  colesterol?: number;
  frecuenciaCardiaca?: number;
  hba1c?: number;
  comentarioMedico?: string;
  profesionalRegistro?: string;
}

export interface PatientRecord {
  id: string;
  rut: string;
  nombre: string;
  fechaNacimiento: string;
  sexo: Sexo;
  tabaquismo?: boolean;
  fechaRegistro: string;
  
  mediciones: Medicion[];
  recetas: Receta[];
  examenesDicom: ExamenDICOM[];
  modulosEducativosCompletados?: string[];
  logAuditoria?: { accion: string, fecha: string, ip: string }[];
  tomasMedicamentos?: TomaMedicamento[];
}

declare const __SERVER_START_TIME__: number;

class MockDatabase {
  private records: PatientRecord[] = [];
  private citas: CitaMedica[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private getInitialPatient(): PatientRecord {
    return {
      id: '1',
      rut: '12.345.678-9',
      nombre: 'Juan Pérez',
      fechaNacimiento: '1971-05-15',
      sexo: 'M',
      tabaquismo: false,
      fechaRegistro: new Date().toISOString(),
      mediciones: [
        { id: 'm1', fecha: '2025-10-01', peso: 88, talla: 1.75, presionSistolica: 155, presionDiastolica: 95, colesterol: 135, frecuenciaCardiaca: 82, hba1c: 6.8, comentarioMedico: 'Paciente ingresa por control preventivo. Se detecta hipertensión no tratada.', profesionalRegistro: 'Dr. Andrés Silva' },
        { id: 'm2', fecha: '2025-12-15', peso: 87, talla: 1.75, presionSistolica: 150, presionDiastolica: 92, colesterol: 130, frecuenciaCardiaca: 78, hba1c: 6.7, comentarioMedico: 'Baja leve de peso, persiste hipertensión grado 1.', profesionalRegistro: 'Dr. Andrés Silva' },
        { id: 'm3', fecha: '2026-03-10', peso: 86, talla: 1.75, presionSistolica: 148, presionDiastolica: 90, colesterol: 125, frecuenciaCardiaca: 76, hba1c: 6.5, comentarioMedico: 'Responde bien a la medicación inicial, ajuste de dosis.', profesionalRegistro: 'Dr. Andrés Silva' },
        { id: 'm4', fecha: new Date().toISOString().split('T')[0], peso: 85, talla: 1.75, presionSistolica: 145, presionDiastolica: 90, colesterol: 120, frecuenciaCardiaca: 72, hba1c: 6.4, comentarioMedico: 'Mejora en parámetros lipídicos y peso. Se recomienda mantener dieta y ejercicio.', profesionalRegistro: 'Dr. Andrés Silva' }
      ],
      recetas: [
        { 
          id: 'rec-1', 
          folio: 'FOL-0001', 
          fechaHora: '2025-10-01T10:30:00Z', 
          medico: 'Dr. Andrés Silva', 
          medicamentos: [
            { nombre: 'Losartán 50mg', indicacion: '1 comprimido cada 12 horas', diasTratamiento: 30 }
          ] 
        },
        { 
          id: 'rec-2', 
          folio: 'FOL-0002', 
          fechaHora: '2026-03-10T11:15:00Z', 
          medico: 'Dr. Andrés Silva', 
          medicamentos: [
            { nombre: 'Amlodipino 5mg', indicacion: '1 comprimido al día', diasTratamiento: 30 },
            { nombre: 'Atorvastatina 20mg', indicacion: '1 comprimido en la noche', diasTratamiento: 60 }
          ] 
        }
      ],
      examenesDicom: [
        { id: 'ecg-1', fecha: '2025-10-01', tipo: 'Electrocardiograma Reposo', ecgData: ecgNormalData, resultado: 'Normal' },
        { id: 'ecg-2', fecha: '2026-03-10', tipo: 'Electrocardiograma Reposo', ecgData: ecgAbnormalData, resultado: 'Anormal' }
      ],
      modulosEducativosCompletados: [],
      logAuditoria: [],
      tomasMedicamentos: [
        { id: 'toma-1', recetaId: 'rec-2', medicamentoNombre: 'Amlodipino 5mg', fechaHora: new Date(Date.now() - 86400000).toISOString() }
      ]
    };
  }

  private getSecondPatient(): PatientRecord {
    return {
      id: '2',
      rut: '18.999.888-7',
      nombre: 'María González',
      fechaNacimiento: '1995-08-20',
      sexo: 'F',
      tabaquismo: false,
      fechaRegistro: new Date().toISOString(),
      mediciones: [
        { id: 'm5', fecha: new Date().toISOString().split('T')[0], peso: 60, talla: 1.65, presionSistolica: 115, presionDiastolica: 75, colesterol: 110, frecuenciaCardiaca: 68, hba1c: 5.2, comentarioMedico: 'Paciente sana, chequeo preventivo general.', profesionalRegistro: 'Dr. Andrés Silva' }
      ],
      recetas: [],
      examenesDicom: [],
      modulosEducativosCompletados: [],
      logAuditoria: [],
      tomasMedicamentos: []
    };
  }

  private loadFromStorage() {
    // __SERVER_START_TIME__ es inyectado por Vite
    const serverTimeStr = typeof __SERVER_START_TIME__ !== 'undefined' ? __SERVER_START_TIME__.toString() : '0';
    const storedTime = localStorage.getItem('serverStartTime');

    if (storedTime !== serverTimeStr) {
      // El servidor se reinició: limpiar datos
      localStorage.removeItem('patientsDb');
      localStorage.removeItem('citasDb');
      localStorage.removeItem('currentPatientId');
      localStorage.setItem('serverStartTime', serverTimeStr);
      this.records = [this.getInitialPatient(), this.getSecondPatient()];
      
      // Crear citas de prueba iniciales para el día actual
      const today = new Date().toISOString().split('T')[0];
      this.citas = [
        { id: 'c1', patientId: '1', fecha: today, hora: '09:00', estado: 'completada' },
        { id: 'c2', patientId: '1', fecha: today, hora: '10:30', estado: 'en_curso' },
        { id: 'c3', patientId: '1', fecha: today, hora: '11:45', estado: 'pendiente' },
        { id: 'c4', patientId: '1', fecha: today, hora: '15:00', estado: 'pendiente' }
      ];

      this.saveToStorage();
    } else {
      // El servidor sigue siendo el mismo, cargar datos persistentes
      const storedData = localStorage.getItem('patientsDb');
      const storedCitas = localStorage.getItem('citasDb');
      
      if (storedData) {
        this.records = JSON.parse(storedData);
      } else {
        this.records = [this.getInitialPatient(), this.getSecondPatient()];
      }
      
      if (storedCitas) {
        this.citas = JSON.parse(storedCitas);
      } else {
        const today = new Date().toISOString().split('T')[0];
        this.citas = [
          { id: 'c1', patientId: '1', fecha: today, hora: '09:00', estado: 'completada' },
          { id: 'c2', patientId: '1', fecha: today, hora: '10:30', estado: 'en_curso' }
        ];
      }
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('patientsDb', JSON.stringify(this.records));
    localStorage.setItem('citasDb', JSON.stringify(this.citas));
  }

  getAll(): PatientRecord[] {
    return this.records;
  }

  getById(id: string): PatientRecord | undefined {
    return this.records.find(p => p.id === id);
  }

  savePatient(patient: PatientRecord) {
    const idx = this.records.findIndex(p => p.id === patient.id);
    if (idx !== -1) {
      this.records[idx] = patient;
    } else {
      this.records.push(patient);
    }
    this.saveToStorage();
  }

  marcarMedicamentoTomado(patientId: string, recetaId: string, medicamentoNombre: string) {
    const p = this.getById(patientId);
    if (!p) return;
    if (!p.tomasMedicamentos) p.tomasMedicamentos = [];
    
    p.tomasMedicamentos.push({
      id: `toma-${Date.now()}`,
      recetaId,
      medicamentoNombre,
      fechaHora: new Date().toISOString()
    });
    this.savePatient(p);
  }

  save(record: Omit<PatientRecord, 'id' | 'fechaRegistro' | 'mediciones' | 'recetas' | 'examenesDicom'>): PatientRecord {
    const newRecord: PatientRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 9),
      fechaRegistro: new Date().toISOString(),
      mediciones: [],
      recetas: [],
      examenesDicom: [],
      logAuditoria: [],
      tomasMedicamentos: []
    };
    this.records.push(newRecord);
    this.saveToStorage();
    return newRecord;
  }
  
  addMedicion(patientId: string, medicion: Omit<Medicion, 'id'>) {
    const patient = this.getById(patientId);
    if (patient) {
      patient.mediciones.push({
        ...medicion,
        id: Math.random().toString(36).substring(2, 9)
      });
      this.saveToStorage();
    }
  }

  addReceta(patientId: string, receta: Omit<Receta, 'id'>) {
    const patient = this.getById(patientId);
    if (patient) {
      patient.recetas.push({
        ...receta,
        id: Math.random().toString(36).substring(2, 9)
      });
      this.saveToStorage();
    }
  }

  addExamenDicom(patientId: string, examen: Omit<ExamenDICOM, 'id'>) {
    const patient = this.getById(patientId);
    if (patient) {
      if (!patient.examenesDicom) patient.examenesDicom = [];
      patient.examenesDicom.push({
        ...examen,
        id: Math.random().toString(36).substring(2, 9)
      });
      this.saveToStorage();
    }
  }

  clear() {
    this.records = [];
    this.saveToStorage();
  }

  completarModulo(patientId: string, moduloId: string) {
    const patient = this.getById(patientId);
    if (patient) {
      if (!patient.modulosEducativosCompletados) {
        patient.modulosEducativosCompletados = [];
      }
      if (!patient.modulosEducativosCompletados.includes(moduloId)) {
        patient.modulosEducativosCompletados.push(moduloId);
        this.saveToStorage();
      }
    }
  }

  registrarAuditoriaDescarga(patientId: string) {
    const patient = this.getById(patientId);
    if (patient) {
      if (!patient.logAuditoria) {
        patient.logAuditoria = [];
      }
      patient.logAuditoria.push({
        accion: "Descarga de Ficha Clínica PDF Inalterable",
        fecha: new Date().toISOString(),
        ip: "127.0.0.1"
      });
      this.saveToStorage();
    }
  }

  // AGENDA METHODS
  getAllCitas(): CitaMedica[] {
    return [...this.citas];
  }

  getCitasByDate(fecha: string): CitaMedica[] {
    return this.citas.filter(c => c.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora));
  }

  addCita(patientId: string, fecha: string, hora: string): CitaMedica {
    const newCita: CitaMedica = {
      id: Math.random().toString(36).substring(2, 9),
      patientId,
      fecha,
      hora,
      estado: 'pendiente'
    };
    this.citas.push(newCita);
    this.saveToStorage();
    return newCita;
  }

  updateCitaStatus(citaId: string, estado: 'pendiente' | 'completada' | 'en_curso' | 'ausente'): void {
    const cita = this.citas.find(c => c.id === citaId);
    if (cita) {
      cita.estado = estado;
      this.saveToStorage();
    }
  }

  rescheduleCita(citaId: string, nuevaFecha: string, nuevaHora: string): void {
    const cita = this.citas.find(c => c.id === citaId);
    if (cita) {
      cita.fecha = nuevaFecha;
      cita.hora = nuevaHora;
      this.saveToStorage();
    }
  }
}

// Singleton instance
export const db = new MockDatabase();
