const url = import.meta.env.VITE_API_URL;

if (!url) {
  throw new Error('VITE_API_URL não definida. Crie um arquivo .env a partir do .env.example');
}

export const API_URL = url.replace(/\/+$/, '');
