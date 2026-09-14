export type SectionType = 'text' | 'gallery';

export interface TextContent {
  title: string;
  body: string;
  align: 'left' | 'center' | 'right';
}

export interface GalleryItem {
  url: string;
  caption: string;
}

export interface GalleryContent {
  title: string;
  images: GalleryItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionContent = Record<string, any>;

export interface PageSection {
  id: string;
  type: SectionType;
  content: SectionContent;
}

export interface Product {
  id?: number;
  name: string;
  slug: string;
  sections: PageSection[];
  createdAt?: string;
  updatedAt?: string;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  text: 'Texto',
  gallery: 'Galeria',
};

export function createDefaultSection(type: SectionType): PageSection {
  const id = `${type}-${Date.now()}`;
  switch (type) {
    case 'text':
      return {
        id, type,
        content: {
          title: 'Sobre o Produto',
          body: 'Escreva aqui uma descrição detalhada do produto.',
          align: 'left',
        },
      };
    case 'gallery':
      return {
        id, type,
        content: {
          title: 'Galeria de Imagens',
          images: [],
        },
      };
  }
}
