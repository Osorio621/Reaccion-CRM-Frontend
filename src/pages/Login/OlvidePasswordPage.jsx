import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { olvidePassword } from '../../api/auth.api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { extractErrorMessage } from '../../utils/errorHandler';
import styles from './LoginPage.module.css'; // 👈 MISMO CSS que el login

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export default function OlvidePasswordPage() {
  const [enviado, setEnviado] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async ({ email }) => {
    try {
      await olvidePassword({ email });
      setEmailEnviado(email);
      setEnviado(true);
      reset();
    } catch (error) {
      setError('root', { 
        message: extractErrorMessage(error) || 'Error al enviar el enlace. Intenta nuevamente.' 
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backgroundDecoration} />
      
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🔐</div>
          <h1 className={styles.title}>Recuperar contraseña</h1>
          <p className={styles.subtitle}>
            {enviado 
              ? '¡Revisa tu correo!' 
              : 'Te ayudaremos a recuperar el acceso a tu cuenta'}
          </p>
        </div>

        {enviado ? (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>✅</div>
            <p className={styles.successMessage}>
              Hemos enviado un enlace de recuperación a
            </p>
            <p className={styles.successEmail}>{emailEnviado}</p>
            <div className={styles.successDetails}>
              <span>📩</span>
              <p>
                El enlace es válido por <strong>30 minutos</strong>. 
                Revisa también tu carpeta de <strong>spam</strong>.
              </p>
            </div>
            <div className={styles.actionButtons}>
              <Link to="/login" className={styles.primaryLink}>
                Volver al inicio de sesión
              </Link>
              <button 
                onClick={() => setEnviado(false)} 
                className={styles.secondaryLink}
              >
                Reenviar correo
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
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
            </div>

            <div className={styles.infoBox}>
              <span>💡</span>
              <p>Recibirás un enlace para restablecer tu contraseña</p>
            </div>

            <Button 
              type="submit" 
              loading={isSubmitting} 
              className={styles.submitForgot}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
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