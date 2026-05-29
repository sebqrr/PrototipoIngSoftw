import React from 'react';
import { AlertTriangle, Clock, Activity, Droplets, ArrowRight } from 'lucide-react';

export default function PanelAlertas() {
  // Simulamos los datos basados en los Criterios de Aceptación (CA-03-1 y CA-08-1)
  const alertas = [
    {
      id: 1,
      paciente: 'Ana Gómez',
      rut: '12.345.678-9',
      tipo: 'CRÍTICA',
      mensaje: 'Presión arterial registrada en 145/95 mmHg (≥ 140/90).',
      fecha: 'Hace 10 min',
      icon: Activity,
      color: 'bg-red-50 border-red-200',
      badgeColor: 'bg-red-100 text-red-800',
      iconColor: 'text-red-600'
    },
    {
      id: 2,
      paciente: 'Carlos Ruiz',
      rut: '15.987.654-3',
      tipo: 'ADVERTENCIA',
      mensaje: 'Aumento de peso de 2.5 kg en 24h. Posible retención de líquidos.',
      fecha: 'Hace 1 hora',
      icon: Droplets,
      color: 'bg-orange-50 border-orange-200',
      badgeColor: 'bg-orange-100 text-orange-800',
      iconColor: 'text-orange-600'
    },
    {
      id: 3,
      paciente: 'Juan Pérez',
      rut: '10.111.222-3',
      tipo: 'ADVERTENCIA',
      mensaje: 'Hemoglobina glicosilada (HbA1c) en 7.5% (> 7%).',
      fecha: 'Hace 3 horas',
      icon: AlertTriangle,
      color: 'bg-yellow-50 border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    {
      id: 4,
      paciente: 'María Soto',
      rut: '9.876.543-2',
      tipo: 'ATENCIÓN',
      mensaje: 'Paciente sin controles registrados en los últimos 7 meses.',
      fecha: 'Hace 1 día',
      icon: Clock,
      color: 'bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel de Alertas Clínicas</h2>
          <p className="text-gray-500 mt-1">Monitoreo activo de anomalías físicas y resultados de laboratorio</p>
        </div>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {alertas.filter(a => a.tipo === 'CRÍTICA').length} Alertas Críticas
        </div>
      </div>

      <div className="grid gap-4">
        {alertas.map((alerta) => {
          const Icono = alerta.icon;
          return (
            <div key={alerta.id} className={`p-4 rounded-xl border ${alerta.color} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-hover hover:shadow-md`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-white shadow-sm ${alerta.iconColor}`}>
                  <Icono className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{alerta.paciente}</span>
                    <span className="text-sm text-gray-500">({alerta.rut})</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${alerta.badgeColor}`}>
                      {alerta.tipo}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">{alerta.mensaje}</p>
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {alerta.fecha}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end w-full md:w-auto">
                <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                  Revisar Ficha <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}