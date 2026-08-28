import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { restablecerPassword } from '../../api/auth.api';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import { extractErrorMessage } from '../../utils/errorHandler';
import styles from './LoginPage.module.css'; // 👈 MISMO CSS

const schema = z
  .object({
    nuevaPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmarPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((d) => d.nuevaPassword === d.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export default function RestablecerPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [listo, setListo] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nuevaPassword: '',
      confirmarPassword: '',
    },
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

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.backgroundDecoration} />
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logo}>❌</div>
            <h1 className={styles.title}>Enlace no válido</h1>
            <p className={styles.subtitle}>
              El enlace de restablecimiento no contiene un token válido.
            </p>
          </div>
          <Link to="/olvide-password" className={styles.link}>
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async ({ nuevaPassword }) => {
    try {
      await restablecerPassword({ token, nuevaPassword });
      setListo(true);
      reset();
    } catch (error) {
      const code = error?.response?.data?.error;
      if (code === 'TOKEN_INVALIDO' || code === 'TOKEN_EXPIRADO') {
        setTokenError(true);
        setError('root', {
          message: 'El enlace es inválido o ya expiró. Solicita uno nuevo.',
        });
      } else {
        setError('root', { message: extractErrorMessage(error) || 'Error al restablecer la contraseña' });
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backgroundDecoration} />
      
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🔑</div>
          <h1 className={styles.title}>
            {listo ? '¡Contraseña actualizada!' : 'Crear nueva contraseña'}
          </h1>
          <p className={styles.subtitle}>
            {listo 
              ? 'Ya puedes iniciar sesión con tu nueva contraseña' 
              : 'Ingresa tu nueva contraseña (mínimo 8 caracteres)'}
          </p>
        </div>

        {listo ? (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✅</div>
            <p className={styles.successMessage}>
              Tu contraseña ha sido actualizada exitosamente.
            </p>
            <div className={styles.successDetails}>
              <span>💡</span>
              <p>
                Ahora puedes iniciar sesión con tu nueva contraseña.
                Recomendamos no compartirla con nadie.
              </p>
            </div>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className={styles.primaryLink}
            >
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
            {errors.root && (
              <div className={styles.formError} role="alert">
                <span className={styles.errorIcon}>⚠️</span>
                {errors.root.message}
              </div>
            )}

            {tokenError && (
              <Link to="/olvide-password" className={styles.link}>
                Solicitar un nuevo enlace
              </Link>
            )}

            <div className={styles.fields}>
              <div className={styles.passwordContainer}>
                <PasswordInput
                  label="Nueva contraseña"
                  placeholder="••••••••"
                  error={errors.nuevaPassword?.message}
                  autoComplete="new-password"
                  autoFocus
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
                          transition: 'width 0.3s ease, background 0.3s ease',
                        }}
                      />
                    </div>
                    <span style={{ color: strength.color, fontSize: '0.8rem', fontWeight: 500 }}>
                      {strength.label}
                    </span>
                  </div>
                )}

                {/* Requisitos de contraseña */}
                <div className={styles.passwordRequirements}>
                  <p className={styles.requirementsTitle}>La contraseña debe tener:</p>
                  <ul className={styles.requirementsList}>
                    <li className={nuevaPassword.length >= 8 ? styles.requirementMet : ''}>
                      {nuevaPassword.length >= 8 ? '✅' : '⬜'} Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                      {/[A-Z]/.test(nuevaPassword) ? '✅' : '⬜'} Al menos una mayúscula
                    </li>
                    <li className={/[a-z]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                      {/[a-z]/.test(nuevaPassword) ? '✅' : '⬜'} Al menos una minúscula
                    </li>
                    <li className={/[0-9]/.test(nuevaPassword) ? styles.requirementMet : ''}>
                      {/[0-9]/.test(nuevaPassword) ? '✅' : '⬜'} Al menos un número
                    </li>
                  </ul>
                </div>
              </div>

              <PasswordInput
                label="Confirmar contraseña"
                placeholder="••••••••"
                error={errors.confirmarPassword?.message}
                autoComplete="new-password"
                {...register('confirmarPassword')}
              />
            </div>

            <Button 
              type="submit" 
              loading={isSubmitting} 
              className={styles.submitReset}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Actualizando...' : 'Restablecer contraseña'}
            </Button>

            <Link to="/login" className={styles.backLink}>
              ← Volver al inicio de sesión
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}