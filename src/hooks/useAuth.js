import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login as loginApi, logout as logoutApi } from '../api/auth.api';
import { extractErrorMessage } from '../utils/errorHandler';

export function useAuth() {
  const navigate = useNavigate();
  const { accessToken, usuario, rol, setAuth, setTokens, logout } = useAuthStore();

  const login = async (credenciales) => {
    try {
      const { data } = await loginApi(credenciales);
      setAuth(data);
      navigate('/dashboard', { replace: true });
      return { ok: true };
    } catch (error) {
      return { ok: false, mensaje: extractErrorMessage(error) };
    }
  };

  const cerrarSesion = async () => {
    try {
      await logoutApi();
    } catch {
      // el backend puede fallar; cerramos sesión local igual
    }
    logout();
    navigate('/login', { replace: true });
  };

  return { accessToken, usuario, rol, setTokens, login, cerrarSesion };
}
