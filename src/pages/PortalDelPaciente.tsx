import React from 'react';
import { Home, Bell, BookOpen, CheckCircle, Download } from 'lucide-react';

export default function PortalPaciente() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Portal de Autocuidado</h2>
        <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition">
          <Download className="w-4 h-4" /> Exportar Ficha (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Registro Domiciliario (HU-07) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">Registro en Casa</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Ingresa tu presión arterial diaria para mantener a tu médico informado.</p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="number" placeholder="Sistólica (Ej: 120)" className="w-full p-2 border border-gray-300 rounded" />
              <input type="number" placeholder="Diastólica (Ej: 80)" className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <button className="w-full bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700 transition">
              Guardar Registro Auto-reportado
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-500" /> Próximos Recordatorios</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="bg-yellow-50 p-2 rounded border border-yellow-100">Tomar <strong>Atorvastatina 20mg</strong> - Hoy 21:00 hrs</li>
            </ul>
          </div>
        </div>

        {/* Educación Cardiovascular (HU-13) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">Educación Cardiovascular</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Aprende sobre tu condición y mejora tus hábitos.</p>

          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div>
                <h5 className="font-bold text-gray-800 text-sm">Nutrición Baja en Sodio</h5>
                <p className="text-xs text-gray-500">Video • 5 min</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div>
                <h5 className="font-bold text-gray-800 text-sm">Ejercicios para Hipertensos</h5>
                <p className="text-xs text-gray-500">Artículo • 10 min</p>
              </div>
              <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">Comenzar</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}