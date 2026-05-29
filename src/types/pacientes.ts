export interface Paciente {
  id?: string;
  nombre: string;
  edad: number;
  sexo: 'M' | 'F';
  peso: number;
  talla: number;
  presionArterialSis: number;
  presionArterialDia: number;
  frecuenciaCardiaca: number;
  colesterol?: number;
  hba1c?: number;
}