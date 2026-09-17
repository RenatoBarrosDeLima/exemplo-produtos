import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Product, PageSection, SectionType } from '../types/product';
import { SECTION_LABELS, createDefaultSection } from '../types/product';
import { generatePageHtml } from '../utils/pageGenerator';
import { fetchProduct, createProduct, updateProduct, uploadImage } from '../api/products';
import { SectionEditor } from '../components/editor/SectionEditor';

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const BLANK: Product = { name: 'Novo Produto', slug: 'novo-produto', description: '', coverImage: '', sections: [] };

const SECTION_TYPES: Array<{ type: SectionType; desc: string }> = [
  { type: 'text',    desc: 'Bloco de texto livre' },
  { type: 'gallery', desc: 'Galeria de imagens' },
];

const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0',
  borderRadius: 6, fontSize: 13, outline: 'none', background: '#fff', color: '#1e293b',
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 5 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function AddSectionMenu({ onAdd }: { onAdd: (t: SectionType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '9px 0', background: open ? '#eef2ff' : 'none',
        border: '1px dashed', borderColor: open ? '#818cf8' : '#cbd5e1',
        borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
        color: open ? '#4f46e5' : '#64748b',
      }}>
        {open ? '× Cancelar' : '+ Adicionar seção'}
      </button>
      {open && (
        <div style={{ marginTop: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
          {SECTION_TYPES.map(s => (
            <button key={s.type} onClick={() => { onAdd(s.type); setOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{SECTION_LABELS[s.type]}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product>(BLANK);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const [savedOk, setSavedOk] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProduct(Number(id))
      .then(setProduct)
      .catch(() => setError('Produto não encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  const html = generatePageHtml(product);

  useEffect(() => {
    if (iframeRef.current) iframeRef.current.srcdoc = html;
  }, [html]);

  const updateSection = useCallback((updated: PageSection) => {
    setProduct(p => ({ ...p, sections: p.sections.map(s => s.id === updated.id ? updated : s) }));
  }, []);

  const addSection = (type: SectionType) => {
    const s = createDefaultSection(type);
    setProduct(p => ({ ...p, sections: [...p.sections, s] }));
    setActiveSection(s.id);
  };

  const removeSection = (id: string) => {
    setProduct(p => ({ ...p, sections: p.sections.filter(s => s.id !== id) }));
    if (activeSection === id) setActiveSection(null);
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    setProduct(p => {
      const arr = [...p.sections];
      const idx = arr.findIndex(s => s.id === id);
      if (idx + dir < 0 || idx + dir >= arr.length) return p;
      [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
      return { ...p, sections: arr };
    });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError('');
    try {
      const { url } = await uploadImage(file);
      setProduct(p => ({ ...p, coverImage: url }));
    } catch {
      setError('Erro ao enviar foto de capa');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!product.name.trim()) { setError('Nome é obrigatório'); return; }
    if (!product.slug.trim()) { setError('Slug é obrigatório'); return; }
    if (!product.description.trim()) { setError('Descrição é obrigatória'); return; }
    if (!product.coverImage.trim()) { setError('Foto de capa é obrigatória'); return; }
    setSaving(true); setError(''); setSavedOk(false);
    try {
      const payload = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        coverImage: product.coverImage,
        sections: product.sections,
      };
      const result = product.id ? await updateProduct(product.id, payload) : await createProduct(payload);
      setProduct(result);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
      if (!id && result.id) {
        navigate(`/products/${result.id}/edit`, { replace: true });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: '#94a3b8' }}>
        Carregando produto…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', background: '#f8fafc' }}>

      {/* TOP BAR */}
      <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#64748b' }}>
          ← Voltar
        </button>
        <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
        <input
          value={product.name}
          onChange={e => setProduct(p => ({ ...p, name: e.target.value }))}
          style={{ fontSize: 14, fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', minWidth: 160 }}
          placeholder="Nome do Produto"
        />
        {product.slug && (
          <span style={{ fontSize: 12, color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, padding: '3px 8px' }}>
            /{product.slug}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={() => { const w = window.open(); if (w) { w.document.write(html); w.document.close(); } }}
          style={{ padding: '6px 14px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#64748b' }}>
          ↗ Abrir
        </button>
        {error && <span style={{ fontSize: 12, color: '#ef4444', maxWidth: 240 }}>{error}</span>}
        {savedOk && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Salvo</span>}
        <button onClick={handleSave} disabled={saving} style={{
          padding: '7px 20px', background: saving ? '#818cf8' : '#4f46e5', color: '#fff',
          border: 'none', borderRadius: 7, cursor: saving ? 'default' : 'pointer', fontSize: 13, fontWeight: 600,
        }}>
          {saving ? 'Salvando…' : product.id ? 'Salvar' : 'Publicar'}
        </button>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <div style={{ width: 300, flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>

          {/* Page info */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 14 }}>Página</div>
            <Field label="Nome">
              <input style={inp} value={product.name} onChange={e => setProduct(p => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Slug" hint={`URL: /${product.slug}`}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...inp, flex: 1 }} value={product.slug} onChange={e => setProduct(p => ({ ...p, slug: e.target.value }))} placeholder="meu-produto" />
                <button onClick={() => setProduct(p => ({ ...p, slug: slugify(p.name) }))}
                  style={{ padding: '0 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
                  Auto
                </button>
              </div>
            </Field>
            <Field label="Descrição *">
              <textarea
                style={{ ...inp, resize: 'vertical', minHeight: 72, fontFamily: 'inherit' }}
                value={product.description}
                onChange={e => setProduct(p => ({ ...p, description: e.target.value }))}
                placeholder="Descreva o produto em poucas frases…"
              />
            </Field>
            <Field label="Foto de capa *">
              <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
              {product.coverImage ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={product.coverImage}
                    alt="Capa"
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0', display: 'block' }}
                  />
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  style={{ width: '100%', padding: '18px 0', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}
                >
                  {uploadingCover ? 'Enviando…' : '+ Adicionar foto de capa'}
                </button>
              )}
            </Field>
          </div>

          {/* Sections */}
          <div style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 14 }}>Seções</div>

            <AddSectionMenu onAdd={addSection} />

            {product.sections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0 8px', color: '#94a3b8', fontSize: 13 }}>
                Adicione seções para montar a página
              </div>
            ) : (
              <div style={{ marginTop: 14 }}>
                {product.sections.map((s, i) => (
                  <div key={s.id}>
                    <div
                      onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                        cursor: 'pointer', marginBottom: activeSection === s.id ? 0 : 4,
                        background: activeSection === s.id ? '#eef2ff' : '#f8fafc',
                        border: `1px solid ${activeSection === s.id ? '#c7d2fe' : '#e2e8f0'}`,
                        borderBottom: activeSection === s.id ? 'none' : undefined,
                        borderRadius: activeSection === s.id ? '8px 8px 0 0' : 8,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: activeSection === s.id ? '#4338ca' : '#334155' }}>
                        {SECTION_LABELS[s.type as SectionType]}
                      </span>
                      <button onClick={e => { e.stopPropagation(); moveSection(s.id, -1); }} disabled={i === 0}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8', padding: '0 3px', opacity: i === 0 ? .3 : 1 }}>▲</button>
                      <button onClick={e => { e.stopPropagation(); moveSection(s.id, 1); }} disabled={i === product.sections.length - 1}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8', padding: '0 3px', opacity: i === product.sections.length - 1 ? .3 : 1 }}>▼</button>
                      <button onClick={e => { e.stopPropagation(); removeSection(s.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#cbd5e1', padding: '0 2px', lineHeight: 1 }}
                        onMouseEnter={el => (el.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={el => (el.currentTarget.style.color = '#cbd5e1')}>×</button>
                    </div>

                    {activeSection === s.id && (
                      <div style={{ padding: '14px 14px 16px', background: '#f5f7ff', border: '1px solid #c7d2fe', borderTop: 'none', borderRadius: '0 0 8px 8px', marginBottom: 4 }}>
                        <SectionEditor section={s} onChange={updateSection} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '6px 16px', background: '#1e293b', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            <div style={{ flex: 1, background: '#334155', borderRadius: 5, padding: '3px 12px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
              {`localhost:3000/products/slug/${product.slug || '...'}`}
            </div>
          </div>
          <iframe ref={iframeRef} srcDoc={html} style={{ flex: 1, border: 'none' }} sandbox="allow-scripts allow-same-origin" title="Preview" />
        </div>

      </div>
    </div>
  );
}
