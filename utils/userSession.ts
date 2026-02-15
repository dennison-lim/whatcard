const SESSION_KEY = 'whatcard_current_user';

export function getCurrentUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setCurrentUserId(id: string): void {
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch {
    // ignore
  }
}

export function clearCurrentUserId(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
