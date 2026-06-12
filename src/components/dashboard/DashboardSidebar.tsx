import { usePatient } from '@/context/PatientContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { HeartPulse, LayoutDashboard, UserPlus, CalendarClock, FileBarChart, BookOpen } from 'lucide-react';

import { useLocation, useNavigate } from 'react-router-dom';

export function DashboardSidebar() {
  const { setCurrentPatientId } = usePatient();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setCurrentPatientId(null);
    navigate(path);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-5 border-b border-sidebar-border">
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => handleNavigation('/')}
        >
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-sidebar-foreground">PrevenciónCardio</span>
            <span className="text-[10px] text-muted-foreground">Sistema Clínico v1.0</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Gestión Clínica</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={location.pathname === '/'} onClick={() => handleNavigation('/')} tooltip="Panel de Control">
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel de Control</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={location.pathname === '/pacientes'} onClick={() => handleNavigation('/pacientes')} tooltip="Pacientes">
                <UserPlus className="h-4 w-4" />
                <span>Pacientes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={location.pathname === '/agenda'} onClick={() => handleNavigation('/agenda')} tooltip="Agendamiento">
                <CalendarClock className="h-4 w-4" />
                <span>Agendamiento</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={location.pathname === '/reportes'} onClick={() => handleNavigation('/reportes')} tooltip="Reportes">
                <FileBarChart className="h-4 w-4" />
                <span>Reportes Poblacionales</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={location.pathname === '/guias'} onClick={() => handleNavigation('/guias')} tooltip="Guías Clínicas">
                <BookOpen className="h-4 w-4" />
                <span>Guías Clínicas</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
