import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Produtos', path: '/', match: (p: string) => p === '/' || p.startsWith('/products') },
  { label: 'Usuários', path: '/users', match: (p: string) => p.startsWith('/users') },
];

export function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{ background: '#0f172a', display: 'flex', alignItems: 'center', gap: 2, padding: '0 24px', height: 44, flexShrink: 0 }}>
      {NAV_ITEMS.map(item => {
        const active = item.match(pathname);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: '5px 14px',
              background: active ? 'rgba(255,255,255,.12)' : 'none',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? '#fff' : 'rgba(255,255,255,.55)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,.85)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,.55)'; }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
