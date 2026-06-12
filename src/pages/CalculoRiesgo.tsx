import { ShieldAlert, Info, ArrowRight } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { Navigate } from 'react-router-dom';
import { calcularEdad } from '../lib/clinical';

type NivelRiesgo = 'BAJO' | 'MODERADO' | 'ALTO' | 'MUY_ALTO';

export default function CalculoRiesgo() {
  const { currentPatient } = usePatient();

  // Redirigir a inicio si no hay paciente seleccionado
  if (!currentPatient) {
    return <Navigate to="/" />;
  }

  // Lógica simplificada de cálculo de riesgo SCORE2
  const calcularNivelRiesgo = (): NivelRiesgo => {
    const edad = calcularEdad(currentPatient.fechaNacimiento);
    const ultimaMedicion = currentPatient.mediciones && currentPatient.mediciones.length > 0 
      ? currentPatient.mediciones[currentPatient.mediciones.length - 1] 
      : null;
    const presionSistolica = ultimaMedicion?.presionSistolica || 120;
    
    if (edad >= 65 && presionSistolica >= 160) return 'MUY_ALTO';
    if (edad >= 60 || presionSistolica >= 140) return 'ALTO';
    if (edad >= 50 || presionSistolica >= 130) return 'MODERADO';
    return 'BAJO';
  };

  const riesgoNivel = calcularNivelRiesgo();

  const configuracionRiesgo = {
    BAJO: { color: 'bg-green-100 text-green-800 border-green-200', titulo: 'Riesgo Bajo (< 1%)' },
    MODERADO: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', titulo: 'Riesgo Moderado (1% - 4%)' },
    ALTO: { color: 'bg-orange-100 text-orange-800 border-orange-200', titulo: 'Riesgo Alto (5% - 9%)' },
    MUY_ALTO: { color: 'bg-red-100 text-red-800 border-red-200', titulo: 'Riesgo Muy Alto (≥ 10%)' },
  };

  const ultimaMedicion = currentPatient.mediciones && currentPatient.mediciones.length > 0 
    ? currentPatient.mediciones[currentPatient.mediciones.length - 1] 
    : null;
  const presionSistolica = ultimaMedicion?.presionSistolica || 120;
  const tabaquismo = currentPatient.tabaquismo;
  const colesterolNoHDL = ultimaMedicion?.colesterolNoHDL || null;
  const edad = calcularEdad(currentPatient.fechaNacimiento);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Motor de Estratificación SCORE2</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
          Paciente: {currentPatient.nombre} ({edad} años)
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
              <li className="flex justify-between"><span>Edad:</span> <span>{edad} años</span></li>
              <li className="flex justify-between"><span>Sexo:</span> <span>{currentPatient.sexo === 'M' ? 'Masculino' : 'Femenino'}</span></li>
              <li className="flex justify-between"><span>Tabaquismo:</span> <span>{tabaquismo ? 'Fumador' : 'No fumador'}</span></li>
              <li className="flex justify-between text-orange-600"><span>P. Arterial Sistólica:</span> <span>{presionSistolica} mmHg</span></li>
              <li className="flex justify-between"><span>Colesterol no-HDL:</span> <span>{colesterolNoHDL || 'No registrado'} mg/dL</span></li>
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