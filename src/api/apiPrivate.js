import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IP_SERVER_BACKEND } from './config';

const apiPrivate = axios.create({
  baseURL: IP_SERVER_BACKEND,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 🔐 Interceptor REQUEST (Token)
apiPrivate.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Interceptor RESPONSE (401)
apiPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized → logout needed');
      // Ici tu peux :
      // - clear SecureStore
      // - reset navigation vers Login
    }
    return Promise.reject(error);
  }
);

export default apiPrivate;
