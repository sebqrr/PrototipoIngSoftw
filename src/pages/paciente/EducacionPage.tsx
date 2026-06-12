import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, FileText, CheckCircle } from 'lucide-react';
import { db } from '@/db/mockDb';

const contenidos = {
  sodio: {
    titulo: 'Nutrición Baja en Sodio',
    tipo: 'Video Interactivo',
    duracion: '5 min',
    descripcion: 'Aprende cómo reducir el consumo de sal sin perder el sabor de tus comidas favoritas.',
    texto: 'El sodio es necesario para el cuerpo, pero en exceso puede aumentar tu presión arterial. Un solo pan marraqueta puede contener hasta 400mg de sodio. En esta cápsula exploraremos estrategias para reemplazar la sal por especias, leer el etiquetado nutricional (los octógonos) y elegir alimentos frescos por sobre los ultraprocesados.',
    icon: PlayCircle
  },
  ejercicio: {
    titulo: 'Ejercicios para Hipertensos',
    tipo: 'Artículo Ilustrado',
    duracion: '10 min',
    descripcion: 'Guía segura de ejercicios aeróbicos y de resistencia para mantener tu corazón fuerte.',
    texto: 'El ejercicio regular es como un medicamento para tu corazón. Se recomienda realizar al menos 150 minutos de actividad moderada a la semana (como caminar a paso rápido). Antes de comenzar, recuerda siempre calentar 5 minutos. Si sientes mareos o dolor en el pecho, detente inmediatamente. Los ejercicios isométricos muy intensos (como levantar pesas muy pesadas) pueden elevar temporalmente tu presión, así que prefiere pesos ligeros y más repeticiones.',
    icon: FileText
  },
  estres: {
    titulo: 'Manejo del Estrés en el Trabajo',
    tipo: 'Podcast / Audio',
    duracion: '15 min',
    descripcion: 'Técnicas de respiración y mindfulness para evitar alzas de presión durante la jornada laboral.',
    texto: 'El estrés laboral libera cortisol y adrenalina, lo que hace que tu corazón lata más rápido y tus vasos sanguíneos se contraigan, elevando tu presión arterial. En este audio guiado de 15 minutos, aprenderemos la técnica de respiración 4-7-8, ideal para realizar en tu escritorio o durante el trayecto a casa, ayudándote a calmar el sistema nervioso parasimpático.',
    icon: PlayCircle
  }
};

export default function EducacionPage() {
  const { tema } = useParams<{ tema: string }>();
  const navigate = useNavigate();
  const contenido = contenidos[tema as keyof typeof contenidos] || contenidos.sodio;
  const Icono = contenido.icon;

  const currentPatientId = localStorage.getItem('currentPatientId');
  const patient = currentPatientId ? db.getById(currentPatientId) : null;
  
  const yaCompletado = patient?.modulosEducativosCompletados?.includes(tema || '') || false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/paciente')} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{contenido.titulo}</h2>
          <p className="text-sm text-muted-foreground">{contenido.tipo} • {contenido.duracion}</p>
        </div>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-emerald-600 text-white p-8">
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <Icono className="w-16 h-16 text-emerald-100 opacity-80" />
            <CardTitle className="text-2xl">{contenido.titulo}</CardTitle>
            <CardDescription className="text-emerald-50 text-lg max-w-lg mx-auto">
              {contenido.descripcion}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="prose prose-emerald max-w-none text-foreground text-lg leading-relaxed space-y-4">
            <p>{contenido.texto}</p>
            <div className="bg-muted p-4 rounded-xl border border-border mt-8 flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground">
                  {yaCompletado ? '¡Módulo Completado!' : '¿Has completado esta cápsula?'}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {yaCompletado 
                    ? 'Ya has marcado esta lección como completada. Tu médico tiene registro de tu avance.' 
                    : 'Marca esta lección como completada para registrar tu avance en tu ficha médica.'}
                </p>
                {!yaCompletado && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => {
                    if (patient && tema) {
                      db.completarModulo(patient.id, tema);
                    }
                    navigate('/paciente');
                  }}>
                    Completar Lección
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
