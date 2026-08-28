import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ roles }) {
  const { accessToken, rol } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(rol)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
