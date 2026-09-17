export type UserRole = 'admin' | 'editor' | 'viewer';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Visualizador',
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  admin:  { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  editor: { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  viewer: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
};

export interface User {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
