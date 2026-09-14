import { useRef, useState } from 'react';
import type { PageSection, SectionType } from '../../types/product';
import { uploadImage } from '../../api/products';

interface Props {
  section: PageSection;
  onChange: (updated: PageSection) => void;
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: 13,
  outline: 'none',
  background: '#fff',
  color: '#1e293b',
  lineHeight: 1.4,
};

const ta: React.CSSProperties = { ...inp, minHeight: 72, resize: 'vertical' as const, fontFamily: 'inherit' };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

/* ── Texto ── */
function TextEditor({ section, onChange }: Props) {
  const c = section.content as { title: string; body: string; align: string };
  const set = (k: string, v: string) => onChange({ ...section, content: { ...c, [k]: v } });
  return (
    <>
      <Row label="Título"><input style={inp} value={c.title} onChange={e => set('title', e.target.value)} /></Row>
      <Row label="Conteúdo"><textarea style={{ ...ta, minHeight: 120 }} value={c.body} onChange={e => set('body', e.target.value)} /></Row>
      <Row label="Alinhamento">
        <div style={{ display: 'flex', gap: 6 }}>
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} onClick={() => set('align', a)} style={{
              flex: 1, padding: '6px', border: '1px solid', borderRadius: 6, cursor: 'pointer', fontSize: 12,
              borderColor: c.align === a ? '#6366f1' : '#e2e8f0',
              background: c.align === a ? '#eef2ff' : '#fff',
              color: c.align === a ? '#4f46e5' : '#64748b',
              fontWeight: c.align === a ? 600 : 400,
            }}>
              {a === 'left' ? 'Esquerda' : a === 'center' ? 'Centro' : 'Direita'}
            </button>
          ))}
        </div>
      </Row>
    </>
  );
}

/* ── Upload button ── */
function UploadBtn({ onUploaded }: { onUploaded: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await uploadImage(file);
      onUploaded(url);
    } catch { /* ignore */ }
    finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handle} />
      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        title="Upload de imagem"
        style={{
          width: 34, height: 34, flexShrink: 0,
          background: busy ? '#f1f5f9' : '#eef2ff',
          border: '1px solid #c7d2fe', borderRadius: 6,
          cursor: busy ? 'default' : 'pointer',
          fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >{busy ? '⏳' : '📁'}</button>
    </>
  );
}

/* ── Galeria ── */
function GalleryEditor({ section, onChange }: Props) {
  const c = section.content as { title: string; images: Array<{ url: string; caption: string }> };
  const set = (k: string, v: string) => onChange({ ...section, content: { ...c, [k]: v } });
  const setImg = (i: number, k: string, v: string) =>
    onChange({ ...section, content: { ...c, images: c.images.map((img, j) => j === i ? { ...img, [k]: v } : img) } });
  const add = () => onChange({ ...section, content: { ...c, images: [...c.images, { url: '', caption: '' }] } });
  const remove = (i: number) => onChange({ ...section, content: { ...c, images: c.images.filter((_, j) => j !== i) } });

  return (
    <>
      <Row label="Título da galeria">
        <input style={inp} value={c.title} onChange={e => set('title', e.target.value)} />
      </Row>

      {c.images.map((img, i) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: img.url ? 8 : 0, alignItems: 'center' }}>
            <input
              style={{ ...inp, flex: 1 }}
              value={img.url}
              onChange={e => setImg(i, 'url', e.target.value)}
              placeholder="URL ou clique em 📁 para upload"
            />
            <UploadBtn onUploaded={url => setImg(i, 'url', url)} />
            <button onClick={() => remove(i)}
              style={{ width: 28, height: 28, background: 'none', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', color: '#ef4444', fontSize: 14, flexShrink: 0 }}>×</button>
          </div>

          {img.url && (
            <div style={{ marginBottom: 8 }}>
              <img src={img.url} alt="" style={{ width: '100%', maxHeight: 110, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0', display: 'block' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}

          <input style={inp} value={img.caption} onChange={e => setImg(i, 'caption', e.target.value)} placeholder="Legenda (opcional)" />
        </div>
      ))}

      <button onClick={add} style={{ width: '100%', padding: '8px', background: 'none', border: '1px dashed #cbd5e1', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
        + Adicionar imagem
      </button>
    </>
  );
}

export function SectionEditor({ section, onChange }: Props) {
  switch (section.type as SectionType) {
    case 'text': return <TextEditor section={section} onChange={onChange} />;
    case 'gallery': return <GalleryEditor section={section} onChange={onChange} />;
    default: return null;
  }
}
