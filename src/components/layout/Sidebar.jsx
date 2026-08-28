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
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pipeline', label: 'Pipeline', icon: Kanban },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/prospectos', label: 'Prospectos', icon: UserPlus },
  { to: '/oportunidades', label: 'Oportunidades', icon: Target },
  { to: '/visitas', label: 'Visitas', icon: CalendarDays },
  { to: '/seguimientos', label: 'Seguimientos', icon: BellRing },
  { to: '/ventas', label: 'Ventas', icon: Receipt },
  { to: '/reportes', label: 'Reportes', icon: FileBarChart2 },
];

const ADMIN_ITEMS = [{ to: '/admin', label: 'Admin', icon: ShieldCheck }];

export default function Sidebar({ open = false, collapsed = false, onClose }) {
  const rol = useAuthStore((s) => s.rol);
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
            src="/logo-reaccion-crm.png"
            alt="Reactivos del Valle"
            className={styles.logo}
          />
        </div>
        <nav className={styles.nav}>
          {links.map(({ to, label, icon: Icon }) => (
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
          ))}
        </nav>
      </aside>
    </>
  );
}