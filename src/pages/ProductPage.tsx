import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generatePageHtml } from '../utils/pageGenerator';
import { fetchProductBySlug } from '../api/products';
import type { Product } from '../types/product';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetchProductBySlug(slug)
      .then(setProduct)
      .catch(() => setError('Produto não encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#94a3b8' }}>
        Carregando…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#ef4444' }}>
        {error || 'Produto não encontrado'}
      </div>
    );
  }

  const html = generatePageHtml(product);

  return (
    <iframe
      srcDoc={html}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
      sandbox="allow-scripts allow-same-origin"
      title={product.name}
    />
  );
}
