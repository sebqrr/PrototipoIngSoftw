import { usePatient } from '@/context/PatientContext';
import { useAuth } from '@/context/Auth';
import { db } from '@/db/mockDb';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardMedico() {
  const { currentPatientId } = usePatient();
  const { logout } = useAuth();
  const location = useLocation();

  const currentName = currentPatientId
    ? db.getById(currentPatientId)?.nombre || 'Nuevo Ingreso'
    : null;

  // Lógica simple de breadcrumbs basada en la ruta actual
  const getPageTitle = () => {
    if (location.pathname.includes('pacientes')) return 'Pacientes';
    if (location.pathname.includes('agenda')) return 'Agenda Médica';
    if (location.pathname.includes('reportes')) return 'Reportes Poblacionales';
    if (location.pathname.includes('guias')) return 'Guías Clínicas';
    return 'Panel de Control';
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar />

        <SidebarInset>
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/">
                      {getPageTitle()}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentName && location.pathname.includes('pacientes') && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{currentName}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Simulated Medical Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-sm font-bold leading-none">Dr. Andrés Silva</span>
                  <span className="text-[10px] font-medium text-muted-foreground mt-0.5">Jefe de Cardiología</span>
                </div>
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">AS</AvatarFallback>
                </Avatar>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                title="Cerrar Sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
