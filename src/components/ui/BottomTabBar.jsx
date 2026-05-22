import { NavLink } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from './Icon';

const TABS = [
  { to: '/',            label: 'Dashboard', icon: 'dashboard' },
  { to: '/workout',     label: 'Trening',   icon: 'barbell'   },
  { to: '/history',     label: 'Historia',  icon: 'history'   },
  { to: '/measurements',label: 'Pomiary',   icon: 'ruler'     },
  { to: '/exercises',   label: 'Baza',      icon: 'book'      },
  { to: '/settings',    label: 'Konto',     icon: 'user'      },
];

export function BottomTabBar() {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: isIron
        ? 'rgba(11,11,12,0.95)'
        : 'rgba(247,242,236,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: `0.5px solid ${t.border}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        padding: '8px 4px 4px',
      }}>
        {TABS.map(tab => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} style={{ textDecoration: 'none' }}>
            {({ isActive }) => {
              const color = isActive ? t.ink : t.inkMute;
              return (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 3, padding: '4px 10px', minWidth: 52,
                  color, transition: 'color .15s',
                }}>
                  <Icon name={tab.icon} size={24} stroke={isActive ? 2 : 1.6} />
                  <span style={{
                    fontFamily: t.fontUI, fontSize: 10.5,
                    fontWeight: isActive ? 600 : 500, letterSpacing: 0.1,
                  }}>
                    {tab.label}
                  </span>
                </div>
              );
            }}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
