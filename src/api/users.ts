import type { User } from '../types/user';

const API_URL = 'http://localhost:3000';

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error('Erro ao buscar usuários');
  return res.json();
}

export async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`);
  if (!res.ok) throw new Error('Usuário não encontrado');
  return res.json();
}

export async function createUser(
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(await extractError(res, 'Erro ao criar usuário'));
  return res.json();
}

export async function updateUser(
  id: number,
  user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(await extractError(res, 'Erro ao atualizar usuário'));
  return res.json();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao remover usuário');
}
