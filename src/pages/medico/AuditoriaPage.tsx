import { useState, useEffect } from 'react';
import { db, type AuditLog } from '@/db/mockDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShieldAlert, Download, Eye, Home } from 'lucide-react';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Cargar logs al montar el componente
    setLogs(db.getLogs());
    
    // Y registrar que un administrador/médico entró a ver la auditoría
    db.logAction('Administrador/Médico', 'Acceso a Auditoría', 'Visualizó el registro central de logs del sistema.', '10.0.0.45');
    // Actualizamos de nuevo para incluir este mismo log en la vista actual
    setLogs(db.getLogs());
  }, []);

  const filteredLogs = logs.filter(log => 
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detalles.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (accion: string) => {
    if (accion.includes('Descarga')) return <Download className="h-4 w-4 text-blue-500" />;
    if (accion.includes('Acceso') || accion.includes('Visualizó')) return <Eye className="h-4 w-4 text-emerald-500" />;
    if (accion.includes('Registro')) return <Home className="h-4 w-4 text-violet-500" />;
    return <ShieldAlert className="h-4 w-4 text-amber-500" />;
  };

  const formatFecha = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-slate-700" />
          Registro de Auditoría (Logs Clínicos)
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitoreo de accesos, modificaciones y descargas de información de pacientes según la Ley de Derechos y Deberes.
        </p>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="bg-slate-50 border-b border-border py-6 px-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Historial de Eventos del Sistema</CardTitle>
              <CardDescription>Eventos registrados automáticamente de forma inalterable.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por actor, acción o detalle..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[180px]">Fecha / Hora</TableHead>
                <TableHead className="w-[200px]">Actor (Usuario)</TableHead>
                <TableHead className="w-[200px]">Acción</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead className="w-[120px] text-right">Dirección IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatFecha(log.fechaHora)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.actor.includes('Paciente') ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{log.actor}</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{log.actor}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.accion)}
                        <span className="text-sm font-medium">{log.accion}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.detalles}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-muted-foreground">
                      {log.ip}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No se encontraron registros de auditoría.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
