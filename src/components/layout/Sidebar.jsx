import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  Users,
  UserPlus,
  Target,
  CalendarDays,
  BellRing,
  Receipt,
  FileBarChart2,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLogoStore } from '../../store/logoStore';
import { useT } from '../../i18n/useT';
import styles from './Sidebar.module.css';

export default function Sidebar({ open = false, collapsed = false, onClose }) {
  const rol = useAuthStore((s) => s.rol);
  const { t } = useT();
  const { sidebarLogoUrl: logoUrl, logoAlt, logoWidth, logoHeight, logoMaxWidth } = useLogoStore();

  const NAV_ITEMS = [
    { to: '/dashboard',    labelKey: 'nav.dashboard',    icon: LayoutDashboard },
    { to: '/pipeline',     labelKey: 'nav.pipeline',     icon: Kanban },
    { to: '/clientes',     labelKey: 'nav.clientes',     icon: Users },
    { to: '/prospectos',   labelKey: 'nav.prospectos',   icon: UserPlus },
    { to: '/oportunidades',labelKey: 'nav.oportunidades',icon: Target },
    { to: '/visitas',      labelKey: 'nav.visitas',      icon: CalendarDays },
    { to: '/seguimientos', labelKey: 'nav.seguimientos', icon: BellRing },
    { to: '/ventas',       labelKey: 'nav.ventas',       icon: Receipt },
    { to: '/reportes',     labelKey: 'nav.reportes',     icon: FileBarChart2 },
  ];

  const ADMIN_ITEMS = [
    { to: '/admin', labelKey: 'nav.admin', icon: ShieldCheck },
  ];

  const links = rol === 'ADMIN' ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose?.();
    }
  };

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <aside
        className={`${styles.sidebar} ${open ? styles.open : ''} ${
          collapsed ? styles.collapsed : ''
        }`}
      >
        <div className={styles.brand}>
          <img
            src={logoUrl}
            alt={logoAlt}
            className={styles.logo}
            style={{
              width: logoWidth,
              height: logoHeight,
              maxWidth: logoMaxWidth,
            }}
            onError={(e) => {
              e.currentTarget.src = '/logo-reaccion-crm.png';
            }}
          />
        </div>
        <nav className={styles.nav}>
          {links.map(({ to, labelKey, icon: Icon }) => {
            const label = t(labelKey);
            return (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
                onClick={handleLinkClick}
              >
                <Icon size={18} />
                <span className={styles.label}>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}