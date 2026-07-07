import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '../app/services/authService';
import { API_URL, addPoints as addPointsApi } from '../app/services/api';

// ── INTERFACES ET TYPES ──────────────────────────────
export interface LoyaltyStats {
  points: number;
  dinarBalance: number;
  niveau: 'bronze' | 'silver' | 'gold' | 'platinum';
  prochainNiveau: {
    nom: string;
    pointsNecessaires: number | null;
  } | null;
}

export const useLoyalty = () => {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ── CHARGER LES POINTS ET LE SOLDE DEPUIS LE BACKEND ──
  const loadLoyaltyStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/loyalty/points`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
      });
      if (!response.ok) throw new Error('Impossible de charger les statistiques de fidélité');
      
      const data = await response.json();
      setStats(data);
      await AsyncStorage.setItem('loyalty_stats', JSON.stringify(data));
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── CONVERTIR LES POINTS EN DINARS ──────────────────
  const convertPointsToDinar = useCallback(async (pointsToConvert: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/loyalty/convertir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pointsAConvertir: pointsToConvert }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la conversion');
      }
      
      // Mise à jour de l'état local après succès
      setStats((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          points: data.pointsRestants,
          dinarBalance: data.nouveauSolde,
        };
      });
      return { success: true, ...data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── RÉCUPÉRER L'HISTORIQUE DES TRANSACTIONS ──────────
  const getHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/loyalty/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors du chargement de l\'historique');
      return data.data; // Retourne la liste des transactions
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── CONVERTIR DES DINARS EN POINTS (dinar → points) ──────────────────
  const convertDinarToPoints = useCallback(async (montantDinar: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/loyalty/convertir/from-dinar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ montant: montantDinar }),
      });
      const data = await response.json();

      if (!response.ok) {
        // Retourner la réponse du serveur de manière structurée pour l'affichage côté UI
        return { success: false, error: data.message || 'Erreur lors de la conversion', status: response.status, data };
      }

      // Mise à jour locale
      setStats((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          points: data.newPoints ?? prev.points,
          dinarBalance: data.newDinarBalance ?? prev.dinarBalance,
        };
      });

      return { success: true, ...data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const addPoints = useCallback(async (amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await addPointsApi(amount, 'roulette');
      return result.success === true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout des points');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    loadLoyaltyStats,
    convertPointsToDinar,
    convertDinarToPoints,
    getHistory,
    addPoints,
  };
};

export default useLoyalty;