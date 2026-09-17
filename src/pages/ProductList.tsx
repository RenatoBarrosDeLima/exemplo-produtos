import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import type { Product } from '../types/product';
import { fetchProducts, deleteProduct } from '../api/products';
import { SECTION_LABELS } from '../types/product';
import type { SectionType } from '../types/product';

export function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Backend não encontrado. Verifique se o servidor está rodando em localhost:3000'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remover "${name}"?`)) return;
    await deleteProduct(id).catch(() => alert('Erro ao remover'));
    setProducts(ps => ps.filter(p => p.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 32px', display: 'flex', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Páginas de Produto</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>Editor visual de páginas web para seus produtos</p>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => navigate('/products/new')}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            + Nova página
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 14 }}>Carregando…</div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '16px 20px', color: '#dc2626', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && products.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>Nenhuma página criada</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>Crie sua primeira página de produto com editor visual</p>
            <button onClick={() => navigate('/products/new')} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Criar primeira página
            </button>
          </div>
        )}

        {products.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {products.map(p => (
              <div
                key={p.id}
                style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'box-shadow .15s, transform .15s', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Cover image */}
                <div
                  onClick={() => navigate(`/products/${p.slug}`)}
                  style={{ cursor: 'pointer', height: 180, background: '#f1f5f9', overflow: 'hidden', position: 'relative', flexShrink: 0 }}
                >
                  {p.coverImage ? (
                    <img
                      src={p.coverImage}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 13 }}>
                      Sem foto de capa
                    </div>
                  )}
                  {/* Gradient overlay with slug */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 14px 8px', background: 'linear-gradient(to top, rgba(0,0,0,.55), transparent)' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>/{p.slug}</span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{p.name}</h3>

                  {p.description && (
                    <p style={{
                      fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {p.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                    {(p.sections ?? []).map(s => (
                      <span key={s.id} style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>
                        {SECTION_LABELS[s.type as SectionType] ?? s.type}
                      </span>
                    ))}
                    {(p.sections ?? []).length === 0 && (
                      <span style={{ fontSize: 11, color: '#cbd5e1' }}>Sem seções</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, padding: '0 18px 16px' }}>
                  <button
                    onClick={() => navigate(`/products/${p.slug}`)}
                    style={{ flex: 1, padding: '8px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    Ver página
                  </button>
                  <button
                    onClick={() => navigate(`/products/${p.id}/edit`)}
                    style={{ flex: 1, padding: '8px', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => p.id && handleDelete(p.id, p.name)}
                    style={{ padding: '8px 12px', background: 'none', color: '#cbd5e1', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
