import { usePatient } from '@/context/PatientContext';
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

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardMedico() {
  const { currentPatientId } = usePatient();
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
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
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
