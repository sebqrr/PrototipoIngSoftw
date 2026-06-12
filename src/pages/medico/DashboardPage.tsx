import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { db } from '@/db/mockDb';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [pacientesDb, setPacientesDb] = useState(db.getAll());

  useEffect(() => {
    // Escuchar si hay cambios
    const interval = setInterval(() => setPacientesDb(db.getAll()), 2000);
    return () => clearInterval(interval);
  }, []);

  return <HomeDashboard pacientesDb={pacientesDb} />;
}
