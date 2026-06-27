import { useNavigate, useLocation } from 'react-router-dom';

const items = [
  { path: '/home',     icon: '🏠', label: 'ホーム' },
  { path: '/training', icon: '🏀', label: '練習' },
  { path: '/approval', icon: '✅', label: '承認' },
  { path: '/skills',   icon: '⭐', label: 'スキル' },
  { path: '/history',  icon: '📋', label: '履歴' },
  { path: '/settings', icon: '⚙️', label: '設定' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 980,
      background: 'linear-gradient(180deg,#1A2A55,#0A1A33)',
      borderTop: '2px solid #2A4A88',
      display: 'flex', zIndex: 100,
    }}>
      {items.map(item => {
        const active = pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, padding: '7px 4px',
              cursor: 'pointer', border: 'none', background: 'transparent',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 18, color: active ? '#FFD700' : 'rgba(150,200,240,0.5)' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: active ? '#FFD700' : 'rgba(150,200,240,0.5)' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
