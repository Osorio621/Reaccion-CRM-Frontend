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
  ShieldCheck,
  Languages,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, APP_VERSION } from '../../config';
import { useT } from '../../i18n/useT';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import styles from './Header.module.css';

export default function Header({ onMenuClick, menuOpen, collapsed }) {
  const location = useLocation();
  const usuario = useAuthStore((s) => s.usuario);
  const rol = useAuthStore((s) => s.rol);
  const { cerrarSesion } = useAuth();
  const { t, lang, setLang } = useT();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'light'
  );
  const [notifications, setNotifications] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserMenu) setShowUserMenu(false);
      if (showNotifications) setShowNotifications(false);
      if (showLangMenu) setShowLangMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu, showNotifications, showLangMenu]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
    if (showLangMenu) setShowLangMenu(false);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
    if (showLangMenu) setShowLangMenu(false);
    if (notifications > 0) setNotifications(0);
  };

  const toggleLangMenu = (e) => {
    e.stopPropagation();
    setShowLangMenu(!showLangMenu);
    if (showUserMenu) setShowUserMenu(false);
    if (showNotifications) setShowNotifications(false);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return t('pages.dashboard');
    if (path === '/pipeline') return t('pages.pipeline');
    if (path === '/clientes') return t('pages.clientes');
    if (path === '/oportunidades') return t('pages.oportunidades');
    if (path === '/reportes') return t('pages.reportes');
    if (path === '/perfil') return t('pages.perfil');
    if (path.startsWith('/clientes/')) return t('pages.clienteDetalle');
    if (path.startsWith('/oportunidad/')) return t('pages.oportunidadDetalle');
    return '';
  };

  const nombreCompleto = [usuario?.nombre, usuario?.apellido]
    .filter(Boolean)
    .join(' ') || 'Usuario';

  const LANGUAGES = [
    { code: 'es', label: 'Español', flag: 'col' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onMenuClick}
          aria-label={collapsed ? t('header.expandMenu') : t('header.collapseMenu')}
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
          aria-label={t('header.toggleTheme')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Selector de idioma */}
        <div className={styles.langWrapper}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.langBtn}`}
            onClick={toggleLangMenu}
            aria-label={t('header.language')}
            title={t('header.language')}
          >
            <Languages size={18} />
            <span className={styles.langCode}>{lang.toUpperCase()}</span>
          </button>

          {showLangMenu && (
            <div className={styles.langDropdown}>
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownTitle}>{t('header.language')}</span>
              </div>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`${styles.langOption} ${lang === l.code ? styles.langOptionActive : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLang(l.code);
                    setShowLangMenu(false);
                  }}
                >
                  <span className={styles.langFlag}>{l.flag}</span>
                  <span className={styles.langLabel}>{l.label}</span>
                  {lang === l.code && (
                    <span className={styles.langCheck}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notificaciones */}
        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.notificationBtn}`}
            onClick={toggleNotifications}
            aria-label={t('header.notifications')}
          >
            <Bell size={18} />
            {notifications > 0 && (
              <span className={styles.notificationBadge}>{notifications}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownTitle}>{t('header.notifications')}</span>
                <button className={styles.dropdownAction}>{t('header.markAllRead')}</button>
              </div>
              <div className={styles.dropdownList}>
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  <Bell size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>{t('header.noNotifications')}</p>
                </div>
              </div>
              <div className={styles.dropdownFooter}>
                <Link to="/notificaciones" className={styles.dropdownFooterLink}>
                  {t('header.viewAll')}
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
            aria-label={t('header.userMenu')}
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
                {t('pages.dashboard')}
              </Link>
              <Link to="/perfil" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                <User size={16} />
                {t('header.myProfile')}
              </Link>
              {(rol === 'ADMIN' || rol === 'GERENTE') && (
                <Link to="/admin" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                  <ShieldCheck size={16} />
                  {t('header.systemAdmin')}
                </Link>
              )}
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  setShowUserMenu(false);
                  setShowHelpModal(true);
                }}
              >
                <HelpCircle size={16} />
                {t('header.helpSupport')}
              </button>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                onClick={cerrarSesion}
              >
                <LogOut size={16} />
                {t('header.logout')}
              </button>
            </div>
          )}
        </div>

        {/* Botón de logout (versión simplificada en móvil) */}
        <button
          type="button"
          className={styles.logoutMobile}
          onClick={cerrarSesion}
          aria-label={t('header.logout')}
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Modal de Ayuda y Soporte */}
      <Modal
        open={showHelpModal}
        title={t('help.title')}
        onClose={() => setShowHelpModal(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {APP_NAME} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>({APP_VERSION})</span>
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              {t('help.systemDesc')}
            </p>
          </div>

          <div style={{ background: 'var(--color-background)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <h5 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {t('help.yourRole')} <span style={{ color: 'var(--color-primary)' }}>{rol || 'Usuario'}</span>
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              <li><strong>{t('help.roles.ejecutivo')}:</strong> {t('help.rolesDesc_ejecutivo')}</li>
              <li><strong>{t('help.roles.gerente')}:</strong> {t('help.rolesDesc_gerente')}</li>
            </ul>
          </div>

          <div style={{ background: 'var(--color-primary-soft)', padding: '12px 16px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 4px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              {t('help.supportTitle')}
            </h5>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text)' }}>
              {t('help.supportDesc')}
              <br />
              📧 <strong>soporte@reactivosdelvalle.com</strong>
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setShowHelpModal(false)}>
              {t('help.close')}
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}