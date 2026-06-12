import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, HeartPulse, Stethoscope, Download } from "lucide-react";

export default function GuiasPage() {
  const guias = [
    { title: 'Guía MINSAL 2026 - Manejo HTA', category: 'Nacional', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', file: '/pdf/guia_hta.pdf' },
    { title: 'Protocolo SCORE2 Europeo', category: 'Internacional', icon: HeartPulse, color: 'text-orange-600', bg: 'bg-orange-100', file: '/pdf/protocolo_score2.pdf' },
    { title: 'Guía Farmacológica Consolidada', category: 'Terapéutica', icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-100', file: '/pdf/manual_farmacologia.pdf' },
    { title: 'Manejo de Dislipidemia', category: 'Metabólico', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100', file: '/pdf/displidemia.pdf' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Guías Clínicas y Protocolos</h1>
        <p className="text-sm text-muted-foreground">Repositorio centralizado de soporte a la decisión clínica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guias.map((g, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 p-5 pb-4">
              <div className={`p-3 rounded-lg ${g.bg} ${g.color}`}>
                <g.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight">{g.title}</CardTitle>
                <CardDescription className="text-xs uppercase font-bold mt-1">{g.category}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex border-t bg-muted/20">
              <a href={g.file} download className="w-full">
                <Button variant="default" className="w-full text-xs gap-2">
                  <Download className="h-4 w-4" /> Descargar PDF
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
