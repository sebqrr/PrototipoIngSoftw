import React from 'react';
import { FileText, PenTool, Printer } from 'lucide-react';

export default function RecetaElectronica() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Emisión de Receta Electrónica</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded border border-blue-200">
          Estándar MINSAL
        </span>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          
          {/* Datos del Prescriptor (CA-12-1) */}
          <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-100">
            <div className="col-span-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Datos del Prescriptor</h3>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">RUT Médico</label>
              <input type="text" defaultValue="15.123.456-7" className="w-full bg-gray-50 rounded-md border-gray-300 shadow-sm p-2 text-sm border" readOnly />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Especialidad</label>
              <input type="text" defaultValue="Cardiología" className="w-full bg-gray-50 rounded-md border-gray-300 shadow-sm p-2 text-sm border" readOnly />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Registro SIS</label>
              <input type="text" defaultValue="123456" className="w-full bg-gray-50 rounded-md border-gray-300 shadow-sm p-2 text-sm border" readOnly />
            </div>
          </div>

          {/* Prescripción */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Fármacos y Posología</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 border-b">Medicamento</th>
                    <th className="px-4 py-2 border-b">Dosis</th>
                    <th className="px-4 py-2 border-b">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2"><input type="text" placeholder="Ej: Atorvastatina 20mg" className="w-full p-1 border-gray-300 border rounded" /></td>
                    <td className="px-4 py-2"><input type="text" placeholder="1 comp. en la noche" className="w-full p-1 border-gray-300 border rounded" /></td>
                    <td className="px-4 py-2"><input type="text" placeholder="30 días" className="w-full p-1 border-gray-300 border rounded" /></td>
                  </tr>
                </tbody>
              </table>
              <button className="w-full bg-gray-50 p-2 text-blue-600 text-sm font-medium hover:bg-gray-100 transition">
                + Añadir otro medicamento
              </button>
            </div>
          </div>

          {/* Botones de Acción (CA-12-2) */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition">
              <Printer className="w-4 h-4" /> Vista Previa PDF
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm">
              <PenTool className="w-4 h-4" /> Firmar Electrónicamente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}