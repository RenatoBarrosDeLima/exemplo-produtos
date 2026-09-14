import type { Product, PageSection, TextContent, GalleryContent } from '../types/product';

const PRIMARY = '#4f46e5';
const TEXT = '#1e293b';
const BG = '#ffffff';

function escHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderText(s: PageSection): string {
  const c = s.content as TextContent;
  return `
<section style="padding:72px 24px;background:${BG};">
  <div style="max-width:820px;margin:0 auto;text-align:${c.align || 'left'};">
    ${c.title ? `<h2 style="font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;color:${TEXT};margin-bottom:24px;">${escHtml(c.title)}</h2>` : ''}
    <div style="font-size:1.05rem;line-height:1.85;color:${TEXT};opacity:.85;white-space:pre-wrap;">${escHtml(c.body)}</div>
  </div>
</section>`;
}

function renderGallery(s: PageSection): string {
  const c = s.content as GalleryContent;
  const imgs = (c.images || []).filter(i => i.url).map(i => `
    <div style="border-radius:10px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1);">
      <img src="${i.url}" alt="${escHtml(i.caption)}" style="width:100%;height:240px;object-fit:cover;display:block;">
      ${i.caption ? `<p style="padding:10px 14px;font-size:.875rem;color:${TEXT};opacity:.65;text-align:center;">${escHtml(i.caption)}</p>` : ''}
    </div>`).join('');
  return `
<section style="padding:72px 24px;background:#f8fafc;">
  <div style="max-width:1200px;margin:0 auto;">
    ${c.title ? `<h2 style="font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;color:${TEXT};text-align:center;margin-bottom:48px;">${escHtml(c.title)}</h2>` : ''}
    ${imgs
      ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">${imgs}</div>`
      : `<p style="text-align:center;color:${TEXT};opacity:.35;padding:40px;">Adicione imagens à galeria</p>`}
  </div>
</section>`;
}

function renderSection(s: PageSection): string {
  switch (s.type) {
    case 'text': return renderText(s);
    case 'gallery': return renderGallery(s);
    default: return '';
  }
}

export function generatePageHtml(product: Product): string {
  const body = (product.sections || []).map(s => renderSection(s)).join('\n');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${escHtml(product.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:${BG};color:${TEXT};line-height:1.6}
    img{max-width:100%;height:auto}
    a{color:${PRIMARY}}
  </style>
</head>
<body>
${body}
</body>
</html>`;
}
