import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export default function LoginPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { login } = useAuth();

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

  if (accessToken) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    const result = await login(data);
    if (!result.ok) {
      setError('root', { message: result.mensaje || 'Credenciales incorrectas' });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backgroundDecoration} />
      
      <form className={styles.card} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.header}>
          <img src="/logo-reaccion-crm.png" alt="Reactivos del Valle" className={styles.logo} />
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
          ¿No tienes cuenta? <Link to="/registro" className={styles.registerLink}>Regístrate</Link>
        </p>
      </form>
    </div>
  );
}