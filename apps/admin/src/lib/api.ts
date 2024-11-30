const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  },
  participants: {
    list: () => fetchApi('/participants'),
    create: (data: any) =>
      fetchApi('/participants', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: number) => fetchApi(`/participants/${id}`),
  },
  items: {
    list: () => fetchApi('/items'),
    create: (data: any) =>
      fetchApi('/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: number) => fetchApi(`/items/${id}`),
  },
  registrations: {
    list: () => fetchApi('/registrations'),
    create: (data: any) =>
      fetchApi('/registrations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number, status: string) =>
      fetchApi(`/registrations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  results: {
    list: () => fetchApi('/results'),
    create: (data: any) =>
      fetchApi('/results', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getLeaderboard: () => fetchApi('/results/leaderboard'),
  },
};