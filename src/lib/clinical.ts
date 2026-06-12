export type NivelRiesgo = 'BAJO' | 'MODERADO' | 'ALTO' | 'MUY_ALTO';

export const calcularEdad = (fechaNacimiento: string): number => {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return edad;
};

export const calcularRiesgoSCORE2 = (edad: number, presionSistolica: number): NivelRiesgo => {
  if (edad >= 65 && presionSistolica >= 160) return 'MUY_ALTO';
  if (edad >= 60 || presionSistolica >= 140) return 'ALTO';
  if (edad >= 50 || presionSistolica >= 130) return 'MODERADO';
  return 'BAJO';
};

export const configRiesgo = {
  BAJO: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Riesgo Bajo (<1%)' },
  MODERADO: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Riesgo Moderado (1-4%)' },
  ALTO: { color: 'bg-orange-100 text-orange-800 border-orange-300', text: 'Riesgo Alto (5-9%)' },
  MUY_ALTO: { color: 'bg-red-100 text-red-800 border-red-300', text: 'Riesgo Muy Alto (≥10%)' },
};
