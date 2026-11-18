import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { useLogoStore } from '../../store/logoStore';
import { solicitarCuenta as solicitarCuentaApi } from '../../api/auth.api';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const solicitarCuentaSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  email: z.string().email('Correo electrónico inválido'),
  cargo: z.enum(['EJECUTIVO', 'GERENTE'], { message: 'Selecciona un cargo' }),
});

export default function LoginPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { login } = useAuth();
  const { loginLogoUrl: logoUrl, logoAlt, logoWidth, logoHeight, logoMaxWidth, logoMaxHeight } = useLogoStore();
  const [solicitarCuentaOpen, setSolicitarCuentaOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    register: registerSolicitud,
    handleSubmit: handleSolicitudSubmit,
    setError: setSolicitudError,
    reset: resetSolicitud,
    formState: { errors: solicitudErrors, isSubmitting: isSolicitudSubmitting },
  } = useForm({
    resolver: zodResolver(solicitarCuentaSchema),
    defaultValues: {
      nombre: '',
      email: '',
      cargo: '',
    },
  });

  if (accessToken) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    const result = await login(data);
    if (!result.ok) {
      setError('root', { message: result.mensaje || 'Credenciales incorrectas' });
    }
  };

  const onSolicitudSubmit = async (data) => {
    try {
      await solicitarCuentaApi(data);
      toast.success('Solicitud enviada. Un administrador revisará tu solicitud.');
      resetSolicitud();
      setSolicitarCuentaOpen(false);
    } catch (error) {
      setSolicitudError('root', { message: extractErrorMessage(error) });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backgroundDecoration} />
      
      <form className={styles.card} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.header}>
          <img
            src={logoUrl}
            alt={logoAlt}
            className={styles.logo}
            style={{
              width: logoWidth,
              height: logoHeight,
              maxWidth: logoMaxWidth,
              maxHeight: logoMaxHeight,
            }}
            onError={(e) => {
              e.currentTarget.src = '/logo-reaccion-crm.png';
            }}
          />
          <h1 className={styles.title}>Reactivos del Valle</h1>
          <p className={styles.subtitle}>Bienvenido de nuevo</p>
        </div>

        {errors.root && (
          <div className={styles.formError} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            {errors.root.message}
          </div>
        )}

        <div className={styles.fields}>
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="usuario@reactivos.com"
            error={errors.email?.message}
            autoComplete="email"
            autoFocus
            {...register('email')}
          />

          <PasswordInput
            label="Contraseña"
            placeholder="••••••••"
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />
        </div>

        <div className={styles.options}>
          <label className={styles.rememberMe}>
            <input type="checkbox" />
            <span>Recordarme</span>
          </label>
          <Link to="/olvide-password" className={styles.forgotLink}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button 
          type="submit" 
          loading={isSubmitting} 
          className={styles.submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Entrar'}
        </Button>

        <p className={styles.footerText}>
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            className={styles.registerLink}
            onClick={() => setSolicitarCuentaOpen(true)}
          >
            Solicitar cuenta
          </button>
        </p>
      </form>

      <Modal
        open={solicitarCuentaOpen}
        title="Solicitar cuenta"
        onClose={() => { setSolicitarCuentaOpen(false); resetSolicitud(); }}
      >
        <form onSubmit={handleSolicitudSubmit(onSolicitudSubmit)} noValidate className={styles.solicitudForm}>
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            error={solicitudErrors.nombre?.message}
            {...registerSolicitud('nombre')}
          />

          <Input
            label="Correo electrónico"
            type="email"
            placeholder="juan.perez@empresa.com"
            error={solicitudErrors.email?.message}
            {...registerSolicitud('email')}
          />

          <Select
            label="Cargo"
            error={solicitudErrors.cargo?.message}
            {...registerSolicitud('cargo')}
          >
            <option value="">— Selecciona un cargo —</option>
            <option value="EJECUTIVO">Ejecutivo</option>
            <option value="GERENTE">Gerente</option>
          </Select>

          {solicitudErrors.root && (
            <div className={styles.formError} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              {solicitudErrors.root.message}
            </div>
          )}

          <div className={styles.solicitudActions}>
            <Button type="button" variant="secondary" onClick={() => { setSolicitarCuentaOpen(false); resetSolicitud(); }}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSolicitudSubmitting} className={styles.submit}>
              {isSolicitudSubmitting ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}