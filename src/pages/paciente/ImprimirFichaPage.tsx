import { useEffect, useState } from 'react';
import { db } from '@/db/mockDb';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calcularRiesgoSCORE2, calcularEdad } from '@/lib/clinical';

export default function ImprimirFichaPage() {
  const [paciente, setPaciente] = useState<any>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('currentPatientId') || db.getAll()[0]?.id;
    const p = db.getById(storedId);
    setPaciente(p);
  }, []);

  if (!paciente) return <div className="p-10 text-center">Cargando...</div>;

  const handlePrint = () => {
    db.logAction(`Paciente (${paciente.rut})`, 'Descarga de Datos Clínicos', `Paciente generó impresión/PDF de su historia clínica y gráficos.`, '192.168.1.55');
    window.print();
  };

  const edad = calcularEdad(paciente.fechaNacimiento);
  const mediciones = paciente.mediciones || [];
  const lastM = mediciones[mediciones.length - 1];
  const riesgo = (lastM && edad) ? calcularRiesgoSCORE2(edad, lastM.presionSistolica) : 'BAJO';

  const cholData = mediciones.filter((m: any) => m.colesterol).map((m: any) => ({ fecha: new Date(m.fecha).toLocaleDateString(), colesterol: m.colesterol })).reverse();
  const imcData = mediciones.filter((m: any) => m.peso && m.talla).map((m: any) => ({ fecha: new Date(m.fecha).toLocaleDateString(), imc: Number((m.peso / (m.talla * m.talla)).toFixed(1)) })).reverse();

  // Función para estimar adherencia simple para impresión
  const getAdherencia = (recetaId: string, medNombre: string, fechaEmision: string) => {
    if (!paciente.historialTomas) return 0;
    const tomas = paciente.historialTomas.filter((t: any) => t.recetaId === recetaId && t.medicamento === medNombre);
    const tomasUnicas = new Set(tomas.map((t: any) => new Date(t.fechaRegistro).toLocaleDateString())).size;
    
    const inicio = new Date(fechaEmision).getTime();
    const transcurridos = Math.max(1, Math.ceil((Date.now() - inicio) / (1000 * 60 * 60 * 24)));
    return Math.min(Math.round((tomasUnicas / transcurridos) * 100), 100);
  };



  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans p-8 print:p-0">
      {/* Botones Flotantes (Se ocultan al imprimir) */}
      <div className="flex justify-center gap-4 mb-8 print:hidden">
        <Button 
          onClick={handlePrint} 
          className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg text-lg px-8 py-6 rounded-full flex items-center gap-3"
        >
          <Printer className="w-5 h-5" />
          Imprimir Ficha
        </Button>
        <Button 
          onClick={handlePrint} 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-lg px-8 py-6 rounded-full flex items-center gap-3"
        >
          <Download className="w-5 h-5" />
          Descargar PDF
        </Button>
      </div>

      {/* Contenido a imprimir */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="border-b-4 border-blue-600 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ficha Clínica Electrónica</h1>
            <p className="text-slate-500 mt-1">Generado el {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString()} (CLT)</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-600 tracking-tighter">PrevenciónCardio UANDES</h2>
            <p className="text-sm text-slate-500 font-medium">Plataforma Médica Avanzada</p>
          </div>
        </div>

        {/* Datos Paciente */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 border-l-4 border-blue-500 mb-4">Identificación del Paciente</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold">Nombre Completo:</span> {paciente.nombre} {paciente.apellidos}</div>
            <div><span className="font-bold">RUT:</span> {paciente.rut}</div>
            <div><span className="font-bold">Fecha de Nacimiento:</span> {new Date(paciente.fechaNacimiento).toLocaleDateString()} ({edad} años)</div>
            <div><span className="font-bold">Género:</span> {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>
            <div className="col-span-2 mt-2 pt-2 border-t"><span className="font-bold text-slate-700">Riesgo Cardiovascular (SCORE2):</span> <span className="font-bold text-red-600 text-lg ml-2">{riesgo}</span> <span className="text-xs text-slate-500 ml-2">Estimación a 10 años basada en los parámetros actuales.</span></div>
          </div>
        </section>

        {/* Historial de Controles Médicos */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 border-l-4 border-indigo-500 mb-4">Historial de Controles Médicos</h3>
          <table className="w-full text-sm border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-2 text-left w-1/4">Fecha</th>
                <th className="border border-slate-200 p-2 text-left w-1/4">Parámetros Físicos/Bioquímicos</th>
                <th className="border border-slate-200 p-2 text-left w-1/2">Evolución / Justificación Médica</th>
              </tr>
            </thead>
            <tbody>
              {mediciones.map((m: any, i: number) => (
                <tr key={`med-${i}`}>
                  <td className="border border-slate-200 p-2 align-top">{new Date(m.fecha).toLocaleDateString()}</td>
                  <td className="border border-slate-200 p-2 align-top text-xs space-y-1">
                    <div><span className="font-bold">PA:</span> {m.presionSistolica}/{m.presionDiastolica} mmHg</div>
                    <div><span className="font-bold">Peso:</span> {m.peso} kg</div>
                    {m.colesterol && <div><span className="font-bold">Chol:</span> {m.colesterol} mg/dL</div>}
                    {(m.talla && m.peso) && <div><span className="font-bold">IMC:</span> {(m.peso / (m.talla * m.talla)).toFixed(1)}</div>}
                  </td>
                  <td className="border border-slate-200 p-2 align-top">{m.comentarioMedico || 'Sin justificación registrada.'}</td>
                </tr>
              ))}
              {mediciones.length === 0 && (
                <tr>
                  <td colSpan={3} className="border border-slate-200 p-4 text-center italic text-slate-500">No hay controles en este período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Gráficos (PA, IMC, Colesterol) */}
        <section className="print:break-inside-avoid">
          <h3 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 border-l-4 border-emerald-500 mb-4">Análisis de Evolución y Tendencias</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-sm text-slate-700 mb-2">Presión Arterial</h4>
              <div className="w-full flex justify-center border border-slate-200 py-2">
                <LineChart width={750} height={200} data={[...mediciones].reverse()} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <YAxis domain={['auto', 'auto']} />
                  <Line type="monotone" dataKey="presionSistolica" stroke="#ef4444" strokeWidth={2} name="Sistólica" isAnimationActive={false} />
                  <Line type="monotone" dataKey="presionDiastolica" stroke="#3b82f6" strokeWidth={2} name="Diastólica" isAnimationActive={false} />
                </LineChart>
              </div>
            </div>

            {imcData.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-slate-700 mb-2">Índice de Masa Corporal (IMC)</h4>
                <div className="w-full flex justify-center border border-slate-200 py-2">
                  <LineChart width={750} height={150} data={imcData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis domain={['auto', 'auto']} />
                    <Line type="monotone" dataKey="imc" stroke="#9333ea" strokeWidth={2} name="IMC" isAnimationActive={false} />
                  </LineChart>
                </div>
              </div>
            )}

            {cholData.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-slate-700 mb-2">Colesterol no-HDL</h4>
                <div className="w-full flex justify-center border border-slate-200 py-2">
                  <LineChart width={750} height={150} data={cholData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis domain={['auto', 'auto']} />
                    <Line type="monotone" dataKey="colesterol" stroke="#d97706" strokeWidth={2} name="Colesterol" isAnimationActive={false} />
                  </LineChart>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Exámenes (Tabla) */}
        <section className="print:break-inside-avoid">
          <h3 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 border-l-4 border-teal-500 mb-4">Exámenes (ECG / Imágenes)</h3>
          <table className="w-full text-sm border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-2 text-left w-1/4">Fecha</th>
                <th className="border border-slate-200 p-2 text-left w-1/4">Tipo de Estudio</th>
                <th className="border border-slate-200 p-2 text-left w-1/2">Resultado / Informe</th>
              </tr>
            </thead>
            <tbody>
              {paciente.examenesDicom?.map((e: any, i: number) => (
                <tr key={`ex-${i}`}>
                  <td className="border border-slate-200 p-2">{new Date(e.fecha).toLocaleDateString()}</td>
                  <td className="border border-slate-200 p-2">{e.tipo}</td>
                  <td className="border border-slate-200 p-2">{e.resultado}</td>
                </tr>
              ))}
              {(!paciente.examenesDicom || paciente.examenesDicom.length === 0) && (
                <tr>
                  <td colSpan={3} className="border border-slate-200 p-4 text-center italic text-slate-500">No existen exámenes adjuntos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Gráficos ECG */}
        {paciente.examenesDicom?.filter((e: any) => e.ecgData).map((ex: any, idx: number) => (
          <section key={idx} className="print:break-inside-avoid mt-8">
            <h3 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 border-l-4 border-red-500 mb-4">Trazado ECG: {new Date(ex.fecha).toLocaleDateString()}</h3>
            <div className="w-full flex justify-center border border-red-200 bg-red-50/20 p-2" style={{ backgroundImage: 'linear-gradient(to right, #fecaca 1px, transparent 1px), linear-gradient(to bottom, #fecaca 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              <LineChart width={750} height={150} data={Array(10).fill(ex.ecgData).flat().map((val: any, i: number) => ({ time: i * 4, voltage: val }))} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <YAxis domain={[-1.5, 1.5]} hide />
                <Line type="monotone" dataKey="voltage" stroke="#ef4444" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </div>
          </section>
        ))}

        {/* Recetas */}
        <section className="print:break-inside-avoid mt-8">
          <h3 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 border-l-4 border-purple-500 mb-4">Tratamiento Activo y Adherencia</h3>
          {paciente.recetas?.length > 0 ? (
            <div className="space-y-4">
              {paciente.recetas.map((r: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded p-4">
                  <div className="font-bold border-b pb-2 mb-2 bg-slate-50 px-2 rounded">Receta del {new Date(r.fechaHora || r.fecha).toLocaleDateString()}</div>
                  <table className="w-full text-sm mt-2">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 w-1/3">Medicamento</th>
                        <th className="text-left pb-2 w-1/3">Indicación</th>
                        <th className="text-center pb-2 w-1/3">Adherencia Estimada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.medicamentos.map((m: any, j: number) => {
                        const adh = getAdherencia(r.id, m.nombre, r.fechaHora || r.fecha);
                        return (
                          <tr key={j} className="border-b border-slate-100">
                            <td className="py-2 font-bold">{m.nombre} <span className="font-normal text-slate-500">({m.diasTratamiento ? `${m.diasTratamiento} días` : 'Continuo'})</span></td>
                            <td className="py-2 text-slate-700">{m.indicacion}</td>
                            <td className="py-2 text-center">
                              <span className={`px-2 py-1 rounded font-bold text-xs ${adh >= 80 ? 'bg-emerald-100 text-emerald-800' : adh >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                {adh}% Adherencia a la fecha
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No existen recetas emitidas.</p>
          )}
        </section>

        <footer className="pt-10 pb-4 text-center text-xs text-slate-400 border-t mt-8">
          Documento generado confidencialmente mediante el Sistema Médico. Válido como copia de Historia Clínica.
        </footer>
      </div>
    </div>
  );
}
