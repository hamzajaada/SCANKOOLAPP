import axios from 'axios';
import { IP_SERVER_BACKEND } from './config';

const apiPublic = axios.create({
  baseURL: IP_SERVER_BACKEND,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiPublic;
