import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Toaster from './components/ui/Toaster';
import LoginPage from './pages/Login/LoginPage';
import OlvidePasswordPage from './pages/Login/OlvidePasswordPage';
import RestablecerPasswordPage from './pages/Login/RestablecerPasswordPage';
import PerfilPage from './pages/Perfil/PerfilPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PipelinePage from './pages/Pipeline/PipelinePage';
import ClientesPage from './pages/Clientes/ClientesPage';
import ClienteDetallePage from './pages/Clientes/ClienteDetallePage';
import ProspectosPage from './pages/Prospectos/ProspectosPage';
import OportunidadesPage from './pages/Oportunidades/OportunidadesPage';
import VisitasPage from './pages/Visitas/VisitasPage';
import SeguimientosPage from './pages/Seguimientos/SeguimientosPage';
import VentasPage from './pages/Ventas/VentasPage';
import ReportesPage from './pages/Reportes/ReportesPage';
import AdminPage from './pages/Admin/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/olvide-password" element={<OlvidePasswordPage />} />
        <Route path="/restablecer-password" element={<RestablecerPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/clientes/:id" element={<ClienteDetallePage />} />
            <Route path="/prospectos" element={<ProspectosPage />} />
            <Route path="/oportunidades" element={<OportunidadesPage />} />
            <Route path="/visitas" element={<VisitasPage />} />
            <Route path="/seguimientos" element={<SeguimientosPage />} />
            <Route path="/ventas" element={<VentasPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            {/* Solo ADMIN */}
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
