import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, ArrowLeft, Info, ShieldCheck, Activity, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

// Diccionario de Aranceles Base
const aranceles = [
  { id: 'consulta', nombre: 'Consulta Cardiología', precio: 55000 },
  { id: 'ecg', nombre: 'Electrocardiograma de Reposo', precio: 35000 },
  { id: 'ecocardio', nombre: 'Ecocardiograma Doppler', precio: 85000 },
  { id: 'holter_ritmo', nombre: 'Holter de Arritmia (24 hrs)', precio: 65000 },
  { id: 'holter_presion', nombre: 'Holter de Presión Arterial', precio: 50000 },
  { id: 'test_esfuerzo', nombre: 'Test de Esfuerzo', precio: 75000 },
];

// Diccionario de Coberturas Base
const previsiones = [
  { id: 'fonasa_a', nombre: 'Fonasa Tramo A', cobertura: 0 },
  { id: 'fonasa_bcd', nombre: 'Fonasa Tramo B, C, D (MLE)', cobertura: 40 },
  { id: 'isapre_banmedica', nombre: 'Isapre Banmédica', cobertura: 60 },
  { id: 'isapre_colmena', nombre: 'Isapre Colmena', cobertura: 70 },
  { id: 'isapre_consalud', nombre: 'Isapre Consalud', cobertura: 55 },
  { id: 'isapre_cruzblanca', nombre: 'Isapre CruzBlanca', cobertura: 65 },
  { id: 'particular', nombre: 'Particular (Sin Previsión)', cobertura: 0 },
];

const COLORS = ['#3b82f6', '#10b981']; // Azul para Copago, Verde para Cobertura

export default function SimuladorFinanciero() {
  const navigate = useNavigate();
  const [procedimiento, setProcedimiento] = useState(aranceles[0].id);
  const [prevision, setPrevision] = useState(previsiones[2].id);
  
  const [costoBase, setCostoBase] = useState<number>(aranceles[0].precio);
  const [coberturaPorcentaje, setCoberturaPorcentaje] = useState<number>(previsiones[2].cobertura);

  // Sincronizar selectores con los inputs manuales
  useEffect(() => {
    const p = aranceles.find(x => x.id === procedimiento);
    if (p) setCostoBase(p.precio);
  }, [procedimiento]);

  useEffect(() => {
    const p = previsiones.find(x => x.id === prevision);
    if (p) setCoberturaPorcentaje(p.cobertura);
  }, [prevision]);

  // Motor de cálculo
  const montoCobertura = Math.round(costoBase * (coberturaPorcentaje / 100));
  const copago = costoBase - montoCobertura;

  const dataGrafico = [
    { name: 'Copago (A pagar)', value: copago },
    { name: 'Cobertura Previsión', value: montoCobertura }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/paciente')} className="shrink-0 bg-white shadow-sm border border-border hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" /> Simulador Financiero
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Calcula los copagos estimados de tus próximos procedimientos cardiológicos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel de Entradas (Formulario) */}
        <Card className="lg:col-span-7 shadow-sm border-border">
          <CardHeader className="bg-slate-50 border-b border-border p-6 pb-5">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5" /> Configuración del Procedimiento
            </CardTitle>
            <CardDescription>
              Selecciona el estudio médico y tu plan de salud para obtener una simulación de los costos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Procedimiento Clínico
                </label>
                <Select value={procedimiento} onValueChange={setProcedimiento}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Seleccionar procedimiento">
                      {aranceles.find(a => a.id === procedimiento)?.nombre}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {aranceles.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> Costo Base Arancel (CLP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">$</span>
                  <Input 
                    type="number" 
                    value={costoBase}
                    onChange={(e) => setCostoBase(Number(e.target.value))}
                    className="pl-7 font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Info className="w-3 h-3" /> Arancel referencial de la clínica. Puedes ajustarlo manualmente si tienes otra cotización.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" /> Previsión de Salud
                </label>
                <Select value={prevision} onValueChange={setPrevision}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Seleccionar previsión">
                      {previsiones.find(p => p.id === prevision)?.nombre}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {previsiones.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">Cobertura Estimada (%)</label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={coberturaPorcentaje}
                    onChange={(e) => setCoberturaPorcentaje(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                  />
                  <div className="w-20 text-center font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 py-1.5 rounded-md">
                    {coberturaPorcentaje}%
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Panel de Resultados (Dashboard) */}
        <Card className="lg:col-span-5 shadow-sm border-blue-200 bg-gradient-to-b from-blue-50/50 to-white overflow-hidden">
          <CardHeader className="bg-blue-600 text-white p-6 pb-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Resumen de Simulación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 -mt-4">
            
            <Card className="shadow-lg border-0 bg-white w-full">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Copago Estimado a Pagar</p>
                <div className="text-5xl font-black text-blue-700 tracking-tight flex items-start justify-center">
                  <span className="text-2xl mt-1 mr-1 text-blue-500">$</span>
                  {copago > 0 ? copago.toLocaleString('es-CL') : '0'}
                </div>
                {coberturaPorcentaje > 0 && (
                  <Badge variant="outline" className="mt-4 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                    Ahorraste ${montoCobertura.toLocaleString('es-CL')}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {costoBase > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-700 text-center mb-4">Distribución del Financiamiento</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataGrafico}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {dataGrafico.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => `$${value.toLocaleString('es-CL')}`}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50/80 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                * Este es un cálculo referencial basado en simulaciones financieras. El valor final puede variar dependiendo de los topes de su plan, deducibles o convenios corporativos específicos al momento de emitir el bono.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}