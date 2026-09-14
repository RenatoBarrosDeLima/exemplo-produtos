import { generatePageHtml } from '../utils/pageGenerator';
import type { Product } from '../types/product';

interface Props {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
}

export function ProductPage({ product, onBack, onEdit }: Props) {
  const html = generatePageHtml(product);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

      {/* Top bar */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#64748b' }}
        >
          ← Voltar
        </button>

        <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{product.name}</span>
          <span style={{ fontSize: 12, color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px' }}>
            /{product.slug}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={onEdit}
          style={{ padding: '6px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          Editar
        </button>
      </div>

      {/* Browser chrome */}
      <div style={{ padding: '6px 16px', background: '#1e293b', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
        </div>
        <div style={{ flex: 1, background: '#334155', borderRadius: 5, padding: '3px 12px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          {`localhost:3000/products/slug/${product.slug}`}
        </div>
      </div>

      {/* Full HTML */}
      <iframe
        srcDoc={html}
        style={{ flex: 1, border: 'none', width: '100%' }}
        sandbox="allow-scripts allow-same-origin"
        title={product.name}
      />
    </div>
  );
}
