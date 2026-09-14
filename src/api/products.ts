import type { Product } from '../types/product';

const API_URL = 'http://localhost:3000';

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  return res.json();
}

export async function createProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error(`Erro ao criar produto: ${await res.text()}`);
  return res.json();
}

export async function updateProduct(
  id: number,
  product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar produto: ${await res.text()}`);
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao deletar produto');
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/products/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Erro ao enviar imagem: ${await res.text()}`);
  return res.json();
}
