import React from 'react';
import { TrendingUp, Activity, Calendar } from 'lucide-react';

export default function EvolucionGrafica() {
  // Datos simulados del paciente a lo largo de los últimos meses
  const historialPresion = [
    { mes: 'Ene', sis: 150, dia: 95 },
    { mes: 'Feb', sis: 145, dia: 90 },
    { mes: 'Mar', sis: 140, dia: 85 },
    { mes: 'Abr', sis: 135, dia: 82 },
    { mes: 'May', sis: 130, dia: 80 },
  ];

  const historialLaboratorio = [
    { mes: 'Ene', colesterol: 240, glucosa: 110 },
    { mes: 'Mar', colesterol: 220, glucosa: 105 },
    { mes: 'May', colesterol: 190, glucosa: 95 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Evolución Longitudinal del Paciente</h2>
        <p className="text-gray-500 mt-1">Monitoreo continuo de presión arterial, colesterol y glucosa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Presión Arterial (CA-06-01) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              Presión Arterial (mmHg)
            </h3>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Últimos 5 meses
            </span>
          </div>
          
          <div className="flex items-end justify-between h-48 mt-4 space-x-2">
            {historialPresion.map((registro, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex justify-center gap-1 items-end h-full">
                  {/* Barra Sistólica */}
                  <div 
                    className="w-1/2 bg-red-400 rounded-t-sm hover:bg-red-500 transition-colors relative group"
                    style={{ height: `${(registro.sis / 160) * 100}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {registro.sis}
                    </span>
                  </div>
                  {/* Barra Diastólica */}
                  <div 
                    className="w-1/2 bg-blue-400 rounded-t-sm hover:bg-blue-500 transition-colors relative group"
                    style={{ height: `${(registro.dia / 160) * 100}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {registro.dia}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 mt-2 font-medium">{registro.mes}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-6 text-sm text-gray-600">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-full"></div> Sistólica</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rounded-full"></div> Diastólica</span>
          </div>
        </div>

        {/* Gráfico 2: Colesterol y Glucosa (CA-06-02) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Metabolismo (mg/dL)
            </h3>
          </div>

          <div className="space-y-6">
            {historialLaboratorio.map((registro, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Control {registro.mes}</span>
                  <span className="text-gray-500">Colesterol: <strong className={registro.colesterol > 200 ? 'text-red-500' : 'text-green-500'}>{registro.colesterol}</strong> | Glucosa: <strong>{registro.glucosa}</strong></span>
                </div>
                {/* Barra de progreso compuesta para Colesterol */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${registro.colesterol > 200 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${(registro.colesterol / 300) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-sm text-yellow-800 font-medium">
              Nota Clínica: Se observa una tendencia positiva en la reducción del colesterol total durante el último trimestre.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}