import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthExpiredHandler?: boolean;
  }
}

export function handleAuthExpired() {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  window.dispatchEvent(new Event('mangablade:auth-expired'));
}

export function shouldHandleAuthExpired(error: unknown) {
  const config = (error as { config?: { skipAuthExpiredHandler?: boolean } }).config;

  return !config?.skipAuthExpiredHandler;
}
