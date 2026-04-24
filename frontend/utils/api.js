import axios from 'axios';

const isDev = process.env.NODE_ENV !== 'production';
const resolvedBaseUrl = isDev
  ? 'http://localhost:5000/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

const api = axios.create({
  baseURL: resolvedBaseUrl,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const adminToken = localStorage.getItem('adminToken');
    const userInfo = localStorage.getItem('userInfo');
    const userToken = userInfo ? JSON.parse(userInfo)?.token : null;
    const token = adminToken || userToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
