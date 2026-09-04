export const ONE_HOUR = 60 * 60 * 1000;

export function startSession() {
  const now = Date.now();
  localStorage.setItem('session_start', String(now));
  localStorage.setItem('session_active', String(now));
}

export function updateActivity() {
  localStorage.setItem('session_active', String(Date.now()));
}

export function isSessionExpired() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  const start = localStorage.getItem('session_start');
  if (!start) {
    return false;
  }
  const passed = Date.now() - Number(start);
  return passed >= ONE_HOUR;
}

export function getRemainingSeconds() {
  const start = localStorage.getItem('session_start');
  if (!start) {
    return 0;
  }
  const passed = Date.now() - Number(start);
  const left = ONE_HOUR - passed;
  return left > 0 ? Math.floor(left / 1000) : 0;
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('session_start');
  localStorage.removeItem('session_active');
}

export function autoLogout() {
  clearSession();
  sessionStorage.setItem('session_expired', 'true');
  window.location.href = '/login';
}

export default {
  ONE_HOUR,
  startSession,
  updateActivity,
  isSessionExpired,
  getRemainingSeconds,
  clearSession,
  autoLogout
};
