import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Activity, ShieldCheck, Trash2 } from 'lucide-react';

export default function VisorDicom() {
  const [archivo, setArchivo] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Visor de Trazados (DICOM / PDF)</h2>
          <p className="text-gray-500 mt-1">Análisis de actividad cardíaca e intervalos</p>
        </div>
        {archivo && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-md border border-green-200">
            <ShieldCheck className="w-4 h-4" /> Hash SHA-256 Verificado
          </div>
        )}
      </div>

      {!archivo ? (
        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-white flex flex-col items-center justify-center p-12 min-h-[400px]">
          <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Importar Estudio</h3>
          <p className="text-gray-500 mb-6 text-center max-w-sm">Arrastra un archivo DICOM o PDF aquí, o haz clic para examinar. Carga optimizada en menos de 3 segundos.</p>
          <button 
            onClick={() => setArchivo('simulacion.dcm')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Cargar Estudio de Prueba
          </button>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-4 gap-6 min-h-[500px]">
          {/* Panel Lateral de Herramientas */}
          <div className="col-span-1 bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
            <h4 className="font-bold text-gray-700 border-b pb-2">Herramientas</h4>
            <button className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 hover:bg-gray-100 transition text-sm font-medium text-gray-700">
              <Activity className="w-4 h-4 text-blue-600" /> Medir Intervalo QT
            </button>
            <button className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 hover:bg-gray-100 transition text-sm font-medium text-gray-700">
              <Activity className="w-4 h-4 text-red-600" /> Medir Segmento ST
            </button>
            
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button 
                onClick={() => setArchivo(null)}
                className="flex items-center justify-center gap-2 w-full text-red-600 hover:bg-red-50 p-2 rounded transition text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Mover a Papelera Lógica
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Retención mínima: 15 años (Normativa Ficha Clínica)
              </p>
            </div>
          </div>

          {/* Área Principal del Visor */}
          <div className="col-span-3 bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
            <div className="absolute top-4 left-4 text-white text-xs space-y-1 opacity-70">
              <p>Paciente: JUAN PEREZ</p>
              <p>ID: 10.111.222-3</p>
              <p>Fecha: 23/04/2026</p>
            </div>
            <Activity className="w-32 h-32 text-green-500 opacity-50" />
            <div className="absolute bottom-4 right-4 text-white text-xs opacity-70">
              Zoom: 100% | W: 256 L: 128
            </div>
          </div>
        </div>
      )}
    </div>
  );
}