import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './MainLayout.module.css';

const MOBILE_BREAKPOINT = 768;

function getIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export default function MainLayout() {
  const [isMobile, setIsMobile] = useState(getIsMobile());
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar-collapsed') === '1';
  });

  useEffect(() => {
    const onResize = () => {
      const nowMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(nowMobile);
      if (!nowMobile) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const handleMenuClick = () => {
    if (isMobile) {
      setMenuOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        open={menuOpen}
        collapsed={!isMobile && collapsed}
        onClose={() => setMenuOpen(false)}
      />
      <div className={`${styles.content} ${collapsed && !isMobile ? styles.contentExpanded : ''}`}>
        <Header
          onMenuClick={handleMenuClick}
          menuOpen={menuOpen}
          collapsed={!isMobile && collapsed}
        />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
