import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import type { User } from '../types/user';
import { ROLE_LABELS, ROLE_COLORS } from '../types/user';
import { fetchUsers, deleteUser } from '../api/users';

function Avatar({ user }: { user: User }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = [
    ['#dbeafe','#1d4ed8'], ['#dcfce7','#15803d'], ['#fce7f3','#9d174d'],
    ['#ede9fe','#6d28d9'], ['#fef3c7','#92400e'], ['#ffedd5','#c2410c'],
  ];
  const [bg, text] = colors[(user.name.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => setError('Backend não encontrado. Verifique se o servidor está rodando em localhost:3000'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remover o usuário "${name}"?`)) return;
    await deleteUser(id).catch(() => alert('Erro ao remover'));
    setUsers(us => us.filter(u => u.id !== id));
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Usuários</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
              {users.length} {users.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', width: 240, color: '#1e293b', background: '#f8fafc' }}
          />
          <button
            onClick={() => navigate('/users/new')}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            + Novo usuário
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 32px', width: '100%' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 14 }}>Carregando…</div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '16px 20px', color: '#dc2626', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && users.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>Nenhum usuário cadastrado</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>Adicione o primeiro usuário do sistema</p>
            <button onClick={() => navigate('/users/new')} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Criar primeiro usuário
            </button>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 0, padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px' }}>Usuário</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px' }}>E-mail</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px', minWidth: 90 }}>Perfil</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px', minWidth: 90 }}>Ações</span>
            </div>

            {/* Rows */}
            {(search ? filtered : users).length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Nenhum resultado para "{search}"
              </div>
            )}
            {(search ? filtered : users).map((u, i) => {
              const roleColor = ROLE_COLORS[u.role];
              return (
                <div
                  key={u.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 0, padding: '14px 20px', borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Name + avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar user={u} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{u.name}</span>
                  </div>

                  {/* Email */}
                  <span style={{ fontSize: 13, color: '#64748b' }}>{u.email}</span>

                  {/* Role badge */}
                  <span style={{ fontSize: 12, fontWeight: 600, background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}`, borderRadius: 99, padding: '3px 10px', minWidth: 90, textAlign: 'center' }}>
                    {ROLE_LABELS[u.role]}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, minWidth: 90, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => navigate(`/users/${u.id}/edit`)}
                      style={{ padding: '5px 12px', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => u.id && handleDelete(u.id, u.name)}
                      style={{ padding: '5px 10px', background: 'none', color: '#cbd5e1', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
