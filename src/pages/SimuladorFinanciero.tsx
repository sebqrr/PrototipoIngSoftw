import React, { useState } from 'react';
import { Calculator, DollarSign, PieChart } from 'lucide-react';

export default function SimuladorFinanciero() {
  const [costoBase, setCostoBase] = useState<number>(0);
  const [coberturaPorcentaje, setCoberturaPorcentaje] = useState<number>(0);

  const copago = costoBase - (costoBase * (coberturaPorcentaje / 100));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Calculator className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Simulador Financiero de Tratamientos</h2>
          <p className="text-gray-500 mt-1">Estimación de copagos según aranceles institucionales e Isapre/Fonasa</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Procedimiento / Tratamiento</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                <option>Consulta Cardiología</option>
                <option>Electrocardiograma de reposo</option>
                <option>Ecocardiograma Doppler</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Costo Base Arancel (CLP)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input 
                  type="number" 
                  onChange={(e) => setCostoBase(Number(e.target.value))}
                  className="w-full pl-9 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Ej: 50000" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cobertura Estimada Isapre/Fonasa (%)</label>
              <input 
                type="number" 
                onChange={(e) => setCoberturaPorcentaje(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Ej: 70" 
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex flex-col items-center justify-center text-center">
            <PieChart className="w-12 h-12 text-blue-300 mb-4" />
            <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Copago Estimado a Pagar</p>
            <span className="text-4xl font-black text-blue-900">
              ${copago > 0 ? copago.toLocaleString('es-CL') : '0'}
            </span>
            <p className="text-xs text-blue-600 mt-4 opacity-80">
              *Este es un cálculo referencial basado en simulaciones financieras. El valor final puede variar.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}