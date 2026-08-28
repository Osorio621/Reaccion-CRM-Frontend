import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPerfil, updatePerfil, cambiarPassword } from '../../api/auth.api';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import { extractErrorMessage } from '../../utils/errorHandler';
import { toast } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import { 
  User, 
  Mail, 
  Phone, 
  Image, 
  Shield, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Save,
  Key
} from 'lucide-react';
import styles from './PerfilPage.module.css';

const perfilSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(120),
  apellido: z.string().min(1, 'El apellido es obligatorio').max(120),
  telefono: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  fotoUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    passwordActual: z.string().min(1, 'Ingresa tu contraseña actual'),
    nuevaPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmarPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((d) => d.nuevaPassword === d.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export default function PerfilPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>
          <User size={28} className={styles.titleIcon} />
          Mi perfil
        </h1>
        <p className={styles.subtitle}>Gestiona tu información personal y seguridad</p>
      </div>
      <PerfilSection />
      <PasswordSection />
    </div>
  );
}

function PerfilSection() {
  const usuario = useAuthStore((s) => s.usuario);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const { data: perfil, isLoading } = useQuery({
    queryKey: ['perfil'],
    queryFn: () => getPerfil().then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombre: '', apellido: '', telefono: '', fotoUrl: '' },
  });

  const fotoPreview = watch('fotoUrl');
  const nombreCompleto = [watch('nombre'), watch('apellido')].filter(Boolean).join(' ');

  useEffect(() => {
    if (perfil) {
      reset({
        nombre: perfil.nombre ?? '',
        apellido: perfil.apellido ?? '',
        telefono: perfil.telefono ?? '',
        fotoUrl: perfil.fotoUrl ?? '',
      });
    }
  }, [perfil, reset]);

  const mutation = useMutation({ mutationFn: updatePerfil });

  const onSubmit = async (data) => {
    try {
      const { data: actualizado } = await mutation.mutateAsync(data);
      toast.success('✅ Perfil actualizado correctamente');
      setAuth({ accessToken, refreshToken, usuario: actualizado });
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingContainer}>
          <Spinner size={32} />
          <p className={styles.loadingText}>Cargando tu información...</p>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.cardIcon}>
            <User size={20} />
          </div>
          <h2 className={styles.cardTitle}>Datos personales</h2>
        </div>
        <span className={`${styles.statusBadge} ${styles.statusActive}`}>
          <CheckCircle size={14} />
          Activo
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              error={errors.nombre?.message}
              icon={<User size={16} />}
              {...register('nombre')}
            />
            <Input
              label="Apellido"
              placeholder="Tu apellido"
              error={errors.apellido?.message}
              icon={<User size={16} />}
              {...register('apellido')}
            />
          </div>

          <div className={styles.formRow}>
            <Input
              label="Teléfono"
              placeholder="+52 55 1234 5678"
              error={errors.telefono?.message}
              icon={<Phone size={16} />}
              {...register('telefono')}
            />
            <Input
              label="URL de foto"
              placeholder="https://ejemplo.com/foto.jpg"
              error={errors.fotoUrl?.message}
              icon={<Image size={16} />}
              {...register('fotoUrl')}
            />
          </div>
        </div>

        <div className={styles.avatarPreview}>
          <Avatar 
            src={fotoPreview || perfil?.fotoUrl} 
            nombre={nombreCompleto || usuario?.nombre} 
            size={56} 
            className={styles.avatarImage}
          />
          <div className={styles.avatarInfo}>
            <span className={styles.avatarName}>{nombreCompleto || usuario?.nombre}</span>
            <span className={styles.avatarHint}>
              <Image size={14} />
              Vista previa de tu foto de perfil
            </span>
          </div>
        </div>

        <div className={styles.emailInfo}>
          <Mail size={16} />
          <span>
            Correo: <strong>{usuario?.email}</strong>
          </span>
          <span className={styles.emailNote}>
            El correo y el rol solo se modifican desde Administración
          </span>
        </div>

        {errors.root && <ErrorMessage message={errors.root.message} />}

        <div className={styles.formActions}>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={!isDirty || isSubmitting}
            className={styles.saveButton}
          >
            <Save size={16} />
            Guardar cambios
          </Button>
          {!isDirty && !isSubmitting && (
            <span className={styles.noChanges}>No hay cambios para guardar</span>
          )}
        </div>
      </form>
    </section>
  );
}

function PasswordSection() {
  const navigate = useNavigate();
  const cerrarSesion = useAuthStore((s) => s.logout);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { passwordActual: '', nuevaPassword: '', confirmarPassword: '' },
  });

  const nuevaPassword = watch('nuevaPassword');

  // Validar fuerza de la contraseña en tiempo real
  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: 'Escribe una contraseña', color: '#6b7a8a' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    const levels = [
      { label: 'Muy débil', color: '#ef4444' },
      { label: 'Débil', color: '#f59e0b' },
      { label: 'Media', color: '#3b82f6' },
      { label: 'Fuerte', color: '#10b981' },
      { label: 'Muy fuerte', color: '#059669' },
    ];
    return { level: Math.min(score, 4), ...levels[Math.min(score, 4)] };
  };

  const strength = getPasswordStrength(nuevaPassword);

  const mutation = useMutation({ mutationFn: cambiarPassword });

  const onSubmit = async (data) => {
    try {
      await mutation.mutateAsync({
        passwordActual: data.passwordActual,
        nuevaPassword: data.nuevaPassword,
      });
      toast.success('🔒 Contraseña actualizada. Inicia sesión nuevamente.');
      reset();
      cerrarSesion();
      navigate('/login', { replace: true });
    } catch (error) {
      setError('root', { message: extractErrorMessage(error) });
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={`${styles.cardIcon} ${styles.cardIconLock}`}>
            <Lock size={20} />
          </div>
          <h2 className={styles.cardTitle}>Cambiar contraseña</h2>
        </div>
        <span className={styles.securityBadge}>
          <Shield size={14} />
          Seguridad
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          <PasswordInput
            label="Contraseña actual"
            placeholder="••••••••"
            error={errors.passwordActual?.message}
            icon={<Key size={16} />}
            {...register('passwordActual')}
          />

          <div className={styles.passwordContainer}>
            <PasswordInput
              label="Nueva contraseña"
              placeholder="••••••••"
              error={errors.nuevaPassword?.message}
              icon={<Lock size={16} />}
              {...register('nuevaPassword')}
            />

            {/* Indicador de fuerza */}
            {nuevaPassword && (
              <div className={styles.strengthIndicator}>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{
                      width: `${(strength.level + 1) * 20}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span style={{ color: strength.color, fontSize: '0.75rem', fontWeight: 600 }}>
                  {strength.label}
                </span>
              </div>
            )}

            {/* Requisitos de contraseña */}
            <div className={styles.passwordRequirements}>
              <p className={styles.requirementsTitle}>Requisitos:</p>
              <div className={styles.requirementsGrid}>
                <span className={nuevaPassword.length >= 8 ? styles.requirementMet : ''}>
                  {nuevaPassword.length >= 8 ? '✅' : '⬜'} 8+ caracteres
                </span>
                <span className={/[A-Z]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                  {/[A-Z]/.test(nuevaPassword) ? '✅' : '⬜'} Mayúscula
                </span>
                <span className={/[a-z]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                  {/[a-z]/.test(nuevaPassword) ? '✅' : '⬜'} Minúscula
                </span>
                <span className={/[0-9]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                  {/[0-9]/.test(nuevaPassword) ? '✅' : '⬜'} Número
                </span>
              </div>
            </div>
          </div>

          <PasswordInput
            label="Confirmar contraseña"
            placeholder="••••••••"
            error={errors.confirmarPassword?.message}
            icon={<Lock size={16} />}
            {...register('confirmarPassword')}
          />
        </div>

        <div className={styles.securityNote}>
          <AlertCircle size={16} />
          <span>
            Por seguridad, al cambiar la contraseña se cerrará tu sesión 
            y deberás iniciar sesión nuevamente.
          </span>
        </div>

        {errors.root && <ErrorMessage message={errors.root.message} />}

        <div className={styles.formActions}>
          <Button 
            type="submit" 
            loading={isSubmitting}
            className={styles.passwordButton}
          >
            <Key size={16} />
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </section>
  );
}