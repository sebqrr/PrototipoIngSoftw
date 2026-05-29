import React, { useState } from 'react';
import { ShieldAlert, Info, ArrowRight } from 'lucide-react';

export default function CalculoRiesgo() {
  // En una versión final, estos datos vendrían del estado global o de la API tras guardar en HU-01
  const [riesgoNivel] = useState<'BAJO' | 'MODERADO' | 'ALTO' | 'MUY_ALTO'>('ALTO');

  const configuracionRiesgo = {
    BAJO: { color: 'bg-green-100 text-green-800 border-green-200', titulo: 'Riesgo Bajo (< 1%)' },
    MODERADO: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', titulo: 'Riesgo Moderado (1% - 4%)' },
    ALTO: { color: 'bg-orange-100 text-orange-800 border-orange-200', titulo: 'Riesgo Alto (5% - 9%)' },
    MUY_ALTO: { color: 'bg-red-100 text-red-800 border-red-200', titulo: 'Riesgo Muy Alto (≥ 10%)' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Motor de Estratificación SCORE2</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
          Paciente: Juan Pérez (55 años)
        </span>
      </div>

      <div className={`p-6 rounded-xl border-2 ${configuracionRiesgo[riesgoNivel].color} flex flex-col items-center justify-center text-center space-y-4 shadow-sm transition-all`}>
        <ShieldAlert className="w-16 h-16 opacity-80" />
        <div>
          <h3 className="text-3xl font-extrabold tracking-tight">{configuracionRiesgo[riesgoNivel].titulo}</h3>
          <p className="mt-2 text-lg opacity-90 font-medium">Probabilidad estimada de un evento cardiovascular fatal y no fatal a 10 años.</p>
        </div>
      </div>

      {/* Explicación del cálculo (CA-02-3) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          Desglose del Cálculo
        </h3>
        <p className="text-gray-600 mb-4">
          El nivel de riesgo se ha calculado utilizando el modelo matemático <strong>SCORE2</strong>, calibrado para regiones de riesgo cardiovascular alto.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Variables Ponderadas</h4>
            <ul className="space-y-2 text-gray-700 font-medium">
              <li className="flex justify-between"><span>Edad:</span> <span>55 años</span></li>
              <li className="flex justify-between"><span>Sexo:</span> <span>Masculino</span></li>
              <li className="flex justify-between"><span>Tabaquismo:</span> <span>No fumador</span></li>
              <li className="flex justify-between text-orange-600"><span>P. Arterial Sistólica:</span> <span>145 mmHg</span></li>
              <li className="flex justify-between"><span>Colesterol no-HDL:</span> <span>130 mg/dL</span></li>
            </ul>
          </div>
          
          <div className="flex flex-col justify-center space-y-3">
            <button className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-medium">
              Ver Sugerencias Clínicas <ArrowRight className="w-4 h-4" />
            </button>
            <button className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 border border-blue-200 p-3 rounded-lg hover:bg-blue-50 transition font-medium">
              Exportar Explicación (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}