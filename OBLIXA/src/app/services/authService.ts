import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

// ── Inscription ──────────────────────────────────────────────────────
export const register = async (nom: string, email: string, password: string): Promise<any> => {
  try {
    const response = await apiClient.post('/auth/register', { nom, email, password });
    const data = response.data;
    if (data.token) await AsyncStorage.setItem('token', data.token);
    if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    throw error;
  }
};

// ── Connexion ────────────────────────────────────────────────────────
export const login = async (email: string, password: string): Promise<any> => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data;

    if (data.token) await AsyncStorage.setItem('token', data.token);
    if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    throw error;
  }
};

// ── Déconnexion ──────────────────────────────────────────────────────
export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

// ── Récupération du Jeton ────────────────────────────────────────────
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};

// ── Récupération de l'utilisateur ────────────────────────────────────
export const getUser = async (): Promise<any> => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ── Vérification de l'état de connexion ──────────────────────────────
export const isLoggedIn = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};

export const deleteAccount = async (): Promise<any> => {
  try {
    const response = await apiClient.delete('/auth/delete');
    const data = response.data;
    if (data.success) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return data;
  } catch (error: any) {
    console.error('Erreur suppression:', error.response?.data || error.message || error);
    throw error.response?.data || error;
  }
};

const authService = {
  register,
  login,
  logout,
  getToken,
  getUser,
  isLoggedIn,
  deleteAccount,
};

export default authService; 