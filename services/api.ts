import type { AppUser } from '../types';
import type { PersistedState } from '../utils/storage';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const api = {
  getUsers(): Promise<AppUser[]> {
    return request<AppUser[]>('/users');
  },

  createUser(name: string): Promise<AppUser> {
    return request<AppUser>('/users', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  deleteUser(id: string): Promise<void> {
    return request<void>(`/users/${id}`, { method: 'DELETE' });
  },

  getUserState(id: string): Promise<PersistedState> {
    return request<PersistedState>(`/users/${id}/state`);
  },

  saveUserState(id: string, state: PersistedState): Promise<void> {
    return request<void>(`/users/${id}/state`, {
      method: 'PUT',
      body: JSON.stringify(state),
    });
  },

  deleteTransaction(userId: string, txId: string): Promise<PersistedState> {
    return request<PersistedState>(`/users/${userId}/transactions/${txId}`, {
      method: 'DELETE',
    });
  },
};

export default api;
