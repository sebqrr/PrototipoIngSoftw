import { createContext, useContext, useState, type ReactNode } from 'react';
import { db, type PatientRecord } from '../db/mockDb';

interface PatientContextType {
  currentPatientId: string | null;
  setCurrentPatientId: (id: string | null) => void;
  currentPatient: PatientRecord | undefined;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  // Inicializar estado desde localStorage si existe, o '1' por defecto
  const [currentPatientId, setPatientIdState] = useState<string | null>(() => {
    return localStorage.getItem('currentPatientId') || null;
  });

  // Función wrapper para actualizar estado y localStorage
  const setCurrentPatientId = (id: string | null) => {
    setPatientIdState(id);
    if (id) {
      localStorage.setItem('currentPatientId', id);
    } else {
      localStorage.removeItem('currentPatientId');
    }
  };

  const currentPatient = currentPatientId ? db.getById(currentPatientId) : undefined;

  return (
    <PatientContext.Provider value={{ currentPatientId, setCurrentPatientId, currentPatient }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient debe usarse dentro de un PatientProvider');
  }
  return context;
}
