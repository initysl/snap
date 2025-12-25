import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

const API_KEY = process.env.NEXT_PUBLIC_VECTORSNAP_API_KEY;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    if (API_KEY) {
      config.headers['X-API-Key'] = API_KEY;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.error('Unauthorized: Invalid or missing API key');
      } else if (status === 429) {
        console.error('Rate limit exceeded');
      } else {
        console.error('API Error:', error.response.data);
      }
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Cannot reach backend. Is the API running?');
    }

    return Promise.reject(error);
  }
);

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health', {
      baseURL: API_BASE_URL.replace('/api/v1', ''),
    });
    return response.data.status === 'ok';
  } catch {
    return false;
  }
};
