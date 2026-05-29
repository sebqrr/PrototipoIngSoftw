import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export default function IngresoDatos() {
  const [peso, setPeso] = useState<number | ''>('');
  const [talla, setTalla] = useState<number | ''>('');

  const calcularIMC = () => {
    if (peso && talla) {
      return (Number(peso) / (Number(talla) * Number(talla))).toFixed(2);
    }
    return '-';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mt-8 border border-gray-100">
      <div className="bg-blue-800 p-4 flex items-center gap-3">
        <Activity className="text-white w-6 h-6" />
        <h2 className="text-xl font-bold text-white">Ingreso de Datos Clínicos</h2>
      </div>
      
      <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
        {/* Información General */}
        <div className="space-y-5">
          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Información General</h3>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
            <input type="text" className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Edad</label>
              <input type="number" className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sexo</label>
              <select className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Seleccione...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>
        </div>

        {/* Biometría y Signos */}
        <div className="space-y-5">
          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Biometría y Signos Vitales</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Peso (kg)</label>
              <input 
                type="number" 
                value={peso} 
                onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Talla (m)</label>
              <input 
                type="number" 
                step="0.01"
                value={talla} 
                onChange={(e) => setTalla(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" required />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">IMC Calculado:</span>
            <span className="text-2xl font-bold text-blue-900">{calcularIMC()}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">P. Arterial (Sis/Dia)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="120" className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" required />
                <span className="text-gray-400 self-center">/</span>
                <input type="number" placeholder="80" className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Frec. Cardíaca (lpm)</label>
              <input type="number" className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500" required />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-4 border-t mt-2 flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
            Guardar y Evaluar Riesgo SCORE2
          </button>
        </div>
      </form>
    </div>
  );
}