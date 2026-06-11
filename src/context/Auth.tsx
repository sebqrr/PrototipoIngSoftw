import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'; // <-- Aquí está la corrección

type Role = 'MEDICO' | 'PACIENTE' | null;

interface AuthContextType {
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  const login = (selectedRole: Role) => setRole(selectedRole);
  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}