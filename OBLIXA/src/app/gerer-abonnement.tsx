import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { useLoyalty } from '../hooks/useLoyalty'; 
import { getToken } from './services/authService';
import { API_URL } from './services/api';

// ── Avantages du compte Premium d'après la charte de l'application (Icônes réelles) ──
const PREMIUM_ADVANTAGES: { id: number; icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { id: 1, icon: 'star', text: 'Offres exclusives et réductions majeures allant jusqu’à 50%' },
  { id: 2, icon: 'time', text: 'Accès anticipé aux offres 12 heures avant tout le monde' },
  { id: 3, icon: 'flame', text: 'Points doublés et ultra-rapides (2x) sur chaque opération' },
  { id: 4, icon: 'gift', text: 'Un lancer de roulette gratuit chaque jour sans dépenser de points' },
  { id: 5, icon: 'cash', text: 'Taux de conversion des points plus élevé (100 pts = 7 TND)' },
  { id: 6, icon: 'checkmark-circle', text: 'Navigation fluide et confort optimal sans publicités' },
];

export default function GererAbonnementScreen() {
  const { stats, loadLoyaltyStats } = useLoyalty(); 
  const [accountType, setAccountType] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactif');
  const [dateExpire, setDateExpire] = useState('');
  const [loading, setLoading] = useState(false);

  const currentDinarBalance = stats?.dinarBalance || 0;

  // ── Charger et rafraîchir l'abonnement et le solde à l'ouverture de la page ──
  useFocusEffect(
    useCallback(() => {
      loadLoyaltyStats(); 
      const fetchUserSubscription = async () => {
        try {
          const userJson = await AsyncStorage.getItem('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            setAccountType(user.accountType || 'free');
            setSubscriptionStatus(user.abonnement || 'inactif');

            if (user.abonnementExpire) {
              const date = new Date(user.abonnementExpire);
              setDateExpire(date.toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              }));
            }
          }
        } catch (err) {
          console.log("Erreur chargement local subscription", err);
        }
      };
      fetchUserSubscription();
    }, [loadLoyaltyStats])
  );

  // ── Processus de souscription Premium via le solde interne (Wallet Payment) ──
  const handleSubscribePremium = async () => {
    if (currentDinarBalance < 5.0) {
      Alert.alert(
        '❌ Solde insuffisant',
        `Le prix de l'abonnement est de 5.000 TND. Votre solde actuel est de ${currentDinarBalance.toFixed(3)} TND.\n\nConvertissez vos points ou rechargez votre compte pour activer l'abonnement !`
      );
      return;
    }
    Alert.alert(
      '💎 Confirmer l\'abonnement Premium',
      'Êtes-vous sûr de vouloir déduire 5.000 TND de votre solde pour activer OBLIXA Premium pendant 1 mois ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer et payer',
          onPress: async () => {
            setLoading(true);
            try {
              const token = await getToken();

              const response = await fetch(`${API_URL}/loyalty/spend-dinar`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  amount: 5.0,
                  offerId: 'OBLIXA_PREMIUM_1M',
                  offerTitle: 'Abonnement OBLIXA Premium (1 Mois)'
                }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.message);

              const userJson = await AsyncStorage.getItem('user');
              if (userJson) {
                const user = JSON.parse(userJson);
                user.accountType = 'premium';
                user.abonnement = 'actif';

                const expireDate = new Date();
                expireDate.setMonth(expireDate.getMonth() + 1);
                user.abonnementExpire = expireDate.toISOString();

                await AsyncStorage.setItem('user', JSON.stringify(user));

                setAccountType('premium');
                setSubscriptionStatus('actif');
                setDateExpire(expireDate.toLocaleDateString('fr-FR', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                }));
              }
              
              await loadLoyaltyStats();
              Alert.alert('🎉 Félicitations !', 'Votre compte Premium OBLIXA est désormais actif. Profitez dès maintenant de vos avantages exclusifs.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Une erreur est survenue lors du paiement.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const isPremiumActive = accountType === 'premium' && subscriptionStatus === 'actif';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* ── Header supérieur ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary || '#7c3aed'} />
          <Text style={[styles.backBtn, { color: COLORS.primary || '#7c3aed' }]}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gérer l'abonnement</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Carte d'abonnement et de portefeuille Premium (Light Theme UI) ── */}
        <View style={[styles.currentCard, isPremiumActive && styles.premiumCardBorder]}>
          <View style={styles.currentCardHeader}>
            <View style={[styles.crownIconContainer, isPremiumActive && styles.premiumCrownIconContainer]}>
              <Ionicons 
                name={isPremiumActive ? "ribbon" : "ribbon-outline"} 
                size={26} 
                color={isPremiumActive ? '#d97706' : '#64748b'} 
              />
            </View>
            <View style={styles.titleAndBadge}>
              <Text style={styles.premiumTitle}>OBLIXA PREMIUM</Text>
              <View style={[styles.statusBadge, isPremiumActive ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusBadgeText, isPremiumActive ? styles.statusTextActive : styles.statusTextInactive]}>
                  {isPremiumActive ? 'Abonnement Actif' : 'Abonnement Inactif'}
                </Text>
              </View>
            </View>
          </View>

          {dateExpire && isPremiumActive ? (
            <Text style={styles.currentExpire}>
              Expire le : {dateExpire}
            </Text>
          ) : null}
          
          <View style={styles.divider} />
          
          {/* Solde portefeuille connecté en temps réel */}
          <Text style={styles.walletLabel}>VOTRE SOLDE ACTUEL</Text>
          <Text style={styles.walletValue}>{currentDinarBalance.toFixed(3)} TND</Text>
          
          {/* Bouton d'action dynamique */}
          <TouchableOpacity
            style={[
              styles.subscribeBtn, 
              isPremiumActive ? styles.subscribeBtnDisabled : { backgroundColor: COLORS.primary || '#7c3aed' }
            ]}
            onPress={handleSubscribePremium}
            disabled={loading || isPremiumActive}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.subscribeBtnText}>
                {isPremiumActive ? 'Vous êtes déjà membre Premium' : 'Activer / Renouveler pour 5 TND'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Liste des avantages Premium ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avantages exclusifs OBLIXA Premium</Text>
          
          {PREMIUM_ADVANTAGES.map((advantage) => (
            <View key={advantage.id} style={styles.advantageRow}>
              <View style={[styles.advantageIconContainer, isPremiumActive && styles.premiumIconContainer]}>
                <Ionicons name={advantage.icon} size={20} color={isPremiumActive ? '#d97706' : (COLORS.primary || '#7c3aed')} />
              </View>
              <Text style={styles.advantageText}>{advantage.text}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.checkmark} />
            </View>
          ))}
        </View>

        {/* ── Bouton d'information complémentaire ── */}
        <TouchableOpacity style={styles.showAllBtn} onPress={() => Alert.alert('OBLIXA Premium', 'Vous consultez actuellement la grille tarifaire officielle de la plateforme.')}>
          <Text style={styles.showAllBtnText}>Voir tous les détails</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ── Styles CSS réactifs, modernes et clairs (Light Mode) ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  currentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 22,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  premiumCardBorder: {
    borderColor: '#d97706', 
    borderWidth: 1.5,
  },
  currentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  crownIconContainer: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 14,
  },
  premiumCrownIconContainer: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  titleAndBadge: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#10b981',
  },
  statusTextInactive: {
    color: '#64748b',
  },
  currentExpire: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'left',
    marginTop: 6,
    paddingLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  walletLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    letterSpacing: 1,
    fontWeight: '500',
  },
  walletValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#10b981', 
    textAlign: 'center',
    marginVertical: 6,
  },
  subscribeBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  subscribeBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  subscribeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  advantageRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  advantageIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumIconContainer: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  advantageText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  checkmark: {
    marginLeft: 4,
  },
  showAllBtn: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  showAllBtnText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});