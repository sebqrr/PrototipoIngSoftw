import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';


import IngresoDatos from './pages/hu01';
import CalculoRiesgo from './pages/CalculoRiesgo';
import PanelAlertas from './pages/PanelDeAlertas';
import EvolucionGrafica from './pages/EvolucuionGrafica';
import VisorDicom from './pages/VisorDicom';
import RecetaElectronica from './pages/RecetaElectronica';
import PortalPaciente from './pages/PortalDelPaciente';
import SimuladorFinanciero from './pages/SimuladorFinanciero';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<IngresoDatos />} />
          <Route path="/riesgo" element={<CalculoRiesgo />} />
          <Route path="/alertas" element={<PanelAlertas />} />
          <Route path="/evolucion" element={<EvolucionGrafica />} />
          <Route path="/visor" element={<VisorDicom />} />
          <Route path="/recetas" element={<RecetaElectronica />} />
          <Route path="/paciente" element={<PortalPaciente />} />
          <Route path="/simulador" element={<SimuladorFinanciero />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;