const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_USER_KEY = 'adminUser';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    sessionStorage.getItem(ADMIN_TOKEN_KEY)
  );
}

export function getAdminUser() {
  if (typeof window === 'undefined') return null;
  const raw =
    localStorage.getItem(ADMIN_USER_KEY) ||
    sessionStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminSession(data, rememberMe = true) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;

  other.removeItem(ADMIN_TOKEN_KEY);
  other.removeItem(ADMIN_USER_KEY);

  storage.setItem(ADMIN_TOKEN_KEY, data.token);
  storage.setItem(ADMIN_USER_KEY, JSON.stringify(data));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_USER_KEY);
}

export function isAdminSessionValid() {
  const token = getAdminToken();
  const user = getAdminUser();
  return Boolean(token && user?.role === 'admin');
}
