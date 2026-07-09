import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://192.168.1.185:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Interceptor pour ajouter le token ────────────
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── OFFERS ENDPOINTS ─────────────────────────────

export const getOffers = async (category?: string, search?: string) => {
  try {
    const params: any = {};
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;

    const response = await apiClient.get('/offers', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    throw error.response?.data || error.message;
  }
};

export const getOfferById = async (id: string) => {
  try {
    const response = await apiClient.get(`/offers/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching offer:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * NOUVELLE FONCTION: Activer une offre
 * Cette fonction appelle votre backend pour valider l'achat/activation
 */
export const activateOffer = async (offerId: string) => {
  try {
    const response = await apiClient.post(`/offers/${offerId}/activate`);
    return response.data;
  } catch (error: any) {
    console.error('Error activating offer:', error);
    throw error.response?.data || error.message;
  }
};

export const createOffer = async (offerData: any) => {
  try {
    const response = await apiClient.post('/offers', offerData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateOffer = async (id: string, offerData: any) => {
  try {
    const response = await apiClient.put(`/offers/${id}`, offerData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const deleteOffer = async (id: string) => {
  try {
    const response = await apiClient.delete(`/offers/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const reduceOfferStock = async (id: string) => {
  try {
    const response = await apiClient.post(`/offers/${id}/reduce-stock`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// ── LOYALTY & AUTH ENDPOINTS (Reste inchangé) ────────────────────────────

export const addPoints = async (amount: number, source: string) => {
  const response = await apiClient.post('/loyalty/add-points', { amount, source });
  return response.data;
};

export const convertPoints = async (pointsToConvert: number) => {
  const response = await apiClient.post('/loyalty/convertir', { pointsAConvertir: pointsToConvert });
  return response.data;
};

export const getPoints = async () => {
  const response = await apiClient.get('/loyalty/points');
  return response.data;
};

export const register = async (nom: string, email: string, password: string) => {
  const response = await apiClient.post('/auth/register', { nom, email, password });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export default apiClient;