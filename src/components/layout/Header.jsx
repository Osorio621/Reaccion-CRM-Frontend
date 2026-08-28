import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LogOut,
  Menu,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, APP_VERSION } from '../../config';
import Avatar from '../ui/Avatar';
import styles from './Header.module.css';

export default function Header({ onMenuClick, menuOpen, collapsed }) {
  const location = useLocation();
  const usuario = useAuthStore((s) => s.usuario);
  const rol = useAuthStore((s) => s.rol);
  const { cerrarSesion } = useAuth();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'light'
  );
  const [notifications, setNotifications] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserMenu) setShowUserMenu(false);
      if (showNotifications) setShowNotifications(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu, showNotifications]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
    if (notifications > 0) setNotifications(0);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/pipeline') return 'Pipeline';
    if (path === '/clientes') return 'Clientes';
    if (path === '/oportunidades') return 'Oportunidades';
    if (path === '/reportes') return 'Reportes';
    if (path === '/perfil') return 'Mi Perfil';
    if (path.startsWith('/cliente/')) return 'Detalle Cliente';
    if (path.startsWith('/oportunidad/')) return 'Detalle Oportunidad';
    return '';
  };

  const nombreCompleto = [usuario?.nombre, usuario?.apellido]
    .filter(Boolean)
    .join(' ') || 'Usuario';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onMenuClick}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : menuOpen ? (
            <PanelLeftClose size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>

        <Link to="/dashboard" className={styles.brand}>
          <span className={styles.brandLogo}>📊</span>
          <span className={styles.brandName}>{APP_NAME}</span>
          <span className={styles.version}>{APP_VERSION}</span>
        </Link>

        {getPageTitle() && (
          <span className={styles.pageTitle}>{getPageTitle()}</span>
        )}
      </div>

      <div className={styles.right}>
        {/* Botón de tema */}
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.themeBtn}`}
          onClick={toggleTheme}
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notificaciones */}
        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.notificationBtn}`}
            onClick={toggleNotifications}
            aria-label="Notificaciones"
          >
            <Bell size={18} />
            {notifications > 0 && (
              <span className={styles.notificationBadge}>{notifications}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownTitle}>Notificaciones</span>
                <button className={styles.dropdownAction}>Marcar todas como leídas</button>
              </div>
              <div className={styles.dropdownList}>
                <div className={styles.notificationItem}>
                  <span className={styles.notificationDot} />
                  <div className={styles.notificationContent}>
                    <p className={styles.notificationText}>
                      Nueva oportunidad asignada a Juan Pérez
                    </p>
                    <span className={styles.notificationTime}>Hace 5 min</span>
                  </div>
                </div>
                <div className={styles.notificationItem}>
                  <span className={`${styles.notificationDot} ${styles.notificationDotWarning}`} />
                  <div className={styles.notificationContent}>
                    <p className={styles.notificationText}>
                      Seguimiento vencido: Cliente ABC Corp
                    </p>
                    <span className={styles.notificationTime}>Hace 2 horas</span>
                  </div>
                </div>
                <div className={styles.notificationItem}>
                  <span className={`${styles.notificationDot} ${styles.notificationDotSuccess}`} />
                  <div className={styles.notificationContent}>
                    <p className={styles.notificationText}>
                      Meta mensual alcanzada 🎉
                    </p>
                    <span className={styles.notificationTime}>Hace 1 día</span>
                  </div>
                </div>
              </div>
              <div className={styles.dropdownFooter}>
                <Link to="/notificaciones" className={styles.dropdownFooterLink}>
                  Ver todas las notificaciones
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Usuario */}
        <div className={styles.userWrapper}>
          <button
            type="button"
            className={styles.userInfo}
            onClick={toggleUserMenu}
            aria-label="Menú de usuario"
          >
            <Avatar
              src={usuario?.fotoUrl}
              nombre={nombreCompleto}
              size={32}
              className={styles.userAvatar}
            />
            <div className={styles.userDetails}>
              <span className={styles.userName}>{nombreCompleto}</span>
              <span className={styles.userRol}>{rol || 'Usuario'}</span>
            </div>
            <ChevronDown size={16} className={styles.userChevron} />
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.dropdownUserInfo}>
                <Avatar
                  src={usuario?.fotoUrl}
                  nombre={nombreCompleto}
                  size={48}
                  className={styles.dropdownAvatar}
                />
                <div className={styles.dropdownUserDetails}>
                  <span className={styles.dropdownUserName}>{nombreCompleto}</span>
                  <span className={styles.dropdownUserEmail}>{usuario?.email}</span>
                  <span className={styles.dropdownUserRol}>{rol || 'Usuario'}</span>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link to="/perfil" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                <User size={16} />
                Mi Perfil
              </Link>
              <Link to="/configuracion" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                <Settings size={16} />
                Configuración
              </Link>
              <Link to="/ayuda" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                <HelpCircle size={16} />
                Ayuda
              </Link>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                onClick={cerrarSesion}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Botón de logout (versión simplificada en móvil) */}
        <button
          type="button"
          className={styles.logoutMobile}
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}