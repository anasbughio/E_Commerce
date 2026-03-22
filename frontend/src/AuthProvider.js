import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from './api/axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [csrf, setCsrf] = useState(Cookies.get('csrfToken') || null);
  const [loading, setLoading] = useState(true);
  const [lastLogin, setLastLogin] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
   const [user, setUser] = useState(null);
  // near top of file (helper)

function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (e) {
    return null;
  }
}


  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setAccessToken(res.data.accessToken);
       setAccessToken(res.data.accessToken);
  const payload = parseJwt(res.data.accessToken);
  if (payload) setUser({ id: payload.sub, roles: payload.roles || [], username: payload.username || null });

      setCsrf(res.data.csrf);
      setLastLogin(Date.now());
      console.log('Login: Access token set:', res.data.accessToken.slice(0, 10) + '...', 'CSRF:', res.data.csrf);
      Cookies.remove('refreshToken', { path: '/api/auth/refresh' });
      Cookies.remove('refreshToken', { path: '/' });
      return res;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const csrfToken = Cookies.get('csrfToken') || csrf || '';
      console.log('Logout CSRF token:', csrfToken);
      await api.post('/auth/logout', {}, {
        headers: { 'x-csrf-token': csrfToken }
      });
      Cookies.remove('refreshToken', { path: '/' });
      Cookies.remove('refreshToken', { path: '/api/auth/refresh' });
      Cookies.remove('csrfToken', { path: '/' });
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
    }
   setAccessToken(null);
  setUser(null);
  setCsrf(null);
  setLastLogin(null);

  };

  const refresh = useCallback(async () => {
    if (isRefreshing) {
      console.log('Refresh: Already in progress, skipping');
      return null;
    }
    setIsRefreshing(true);
    const csrfToken = Cookies.get('csrfToken') || csrf || '';
    console.log('Refresh: Attempting with CSRF token:', csrfToken);
    try {
      const res = await api.post('/auth/refresh', {}, {
        headers: { 'x-csrf-token': csrfToken },
        withCredentials: true
      });
      setAccessToken(res.data.accessToken);
       setAccessToken(res.data.accessToken);
  const payload = parseJwt(res.data.accessToken);
  if (payload) setUser({ id: payload.sub, roles: payload.roles || [], username: payload.username || null });

      setCsrf(res.data.csrf);
      console.log('Refresh: Success, new access token:', res.data.accessToken.slice(0, 10) + '...', 'new CSRF:', res.data.csrf);
      return res.data.accessToken;
    } catch (err) {
      console.error('Refresh error:', err.response?.data || err.message);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  }, [csrf, isRefreshing]);

  const tryRefresh = async () => {
    if (lastLogin && Date.now() - lastLogin < 15000) {
      console.log('tryRefresh: Skipping due to recent login');
      setLoading(false);
      return;
    }
    try {
      Cookies.remove('refreshToken', { path: '/api/auth/refresh' });
      const newToken = await refresh();
      if (newToken) {
        console.log('tryRefresh: Access token set:', newToken.slice(0, 10) + '...');
      }
      // Add delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.log('tryRefresh: Failed, staying logged out:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('AuthProvider: Initial CSRF token:', Cookies.get('csrfToken'), 'accessToken:', accessToken ? accessToken.slice(0, 10) + '...' : null);
    tryRefresh();
  }, []);

  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(config => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('Interceptor: Setting Authorization:', `Bearer ${accessToken.slice(0, 10)}...`);
      }
      const csrfToken = Cookies.get('csrfToken') || csrf || '';
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
        console.log('Interceptor: Setting CSRF token:', csrfToken);
      }
      return config;
    });

    const resInterceptor = api.interceptors.response.use(
      response => response,
      async err => {
        const originalReq = err.config;
        if (err.response?.status === 401 && !originalReq._retry) {
          originalReq._retry = true;
          try {
            const newToken = await refresh();
            if (!newToken) {
              console.log('Interceptor: Refresh skipped, no new token');
              return Promise.reject(err);
            }
            console.log('Interceptor: Refreshed token:', newToken.slice(0, 10) + '...');
            originalReq.headers.Authorization = `Bearer ${newToken}`;
            return api(originalReq);
          } catch (e) {
            console.error('Interceptor: Refresh failed:', e.response?.data || e.message);
            setAccessToken(null);
            setCsrf(null);
            setLastLogin(null);
            return Promise.reject(e);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [accessToken, csrf, refresh]);

  return (
    <AuthContext.Provider value={{ accessToken, user,login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}