import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

// ── Page : Mes Abonnements (Version OBLIXA Premium - Mode Clair) ──
export default function MesAbonnementsScreen() {

  const [userName, setUserName] = useState('');
  const [accountType, setAccountType] = useState('free');
  const [abonnement, setAbon] = useState('inactif');
  const [dateExpire, setExpire] = useState('');

  // ── Charger et actualiser dynamiquement les données utilisateur ──
  useFocusEffect(
    useCallback(() => {
      const loadUserSubscription = async () => {
        try {
          const userJson = await AsyncStorage.getItem('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            setUserName(user.nom || '');
            setAccountType(user.accountType || 'free');
            setAbon(user.abonnement || 'inactif');
            
            // Formatage de la date d'expiration en français
            if (user.abonnementExpire) {
              const date = new Date(user.abonnementExpire);
              setExpire(date.toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric'
              }));
            }
          }
        } catch (err) {
          console.log("Erreur lors du chargement de l'abonnement local", err);
        }
      };
      loadUserSubscription();
    }, [])
  );

  const isPremium = accountType === 'premium' && abonnement === 'actif';

  // Liste des avantages configurée avec des icônes réelles de Ionicons
  const advantages: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
    { 
      icon: 'flame', 
      title: 'Multiplicateur de points', 
      desc: isPremium ? 'Statut VIP : Vos points gagnés sont doublés (Boost 2x)' : 'Statut Standard : Accumulation normale de points' 
    },
    { 
      icon: 'cash', 
      title: 'Taux de conversion', 
      desc: isPremium ? 'Taux Premium : 100 points = 7 TND dans le portefeuille' : 'Taux standard : 100 points = 5 TND dans le portefeuille' 
    },
    { 
      icon: 'gift', 
      title: 'Lancers de Roulette', 
      desc: isPremium ? '1 lancer gratuit offert CHAQUE MATIN sans consommer de points' : 'Lancers standards via consommation de points' 
    },
    { 
      icon: 'time', 
      title: 'Accès anticipé exclusif', 
      desc: isPremium ? 'Vous visualisez les grosses promos 12h avant tout le monde' : 'Accès standard aux offres publiques' 
    },
  ];

  return (
    <View style={styles.container}>
      {/* Configuration de la barre de statut pour le mode clair (icônes sombres) */}
      <StatusBar style="dark" />

      {/* ── Header supérieur ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary || '#7c3aed'} />
          <Text style={[styles.backBtn, { color: COLORS.primary || '#7c3aed' }]}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes abonnements</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Carte d'abonnement dynamique (Premium vs Free) ── */}
        <View style={[styles.aboCard, isPremium && styles.premiumAboCard]}>
          
          <View style={styles.cardHeader}>
            <View style={[styles.diamondContainer, isPremium && styles.premiumDiamondContainer]}>
              <Ionicons 
                name={isPremium ? 'ribbon' : 'diamond-outline'} 
                size={26} 
                color={isPremium ? '#d97706' : '#64748b'} 
              />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardBrand, isPremium && styles.premiumCardBrand]}>OBLIXA</Text>
              <Text style={[styles.cardType, isPremium && styles.premiumCardType]}>
                {isPremium ? 'PREMIUM VIP CLUB' : 'STANDARD MEMBER'}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              abonnement === 'actif' ? styles.statusActive : styles.statusInactive
            ]}>
              <Text style={[styles.statusText, abonnement !== 'actif' && styles.statusTextInactive]}>
                {abonnement === 'actif' ? 'Actif' : 'Inactif'}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardInfo}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Membre</Text>
              <Text style={[styles.cardValue, isPremium && styles.premiumCardValue]}>{userName || 'Utilisateur OBLIXA'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Plan actuel</Text>
              <Text style={[styles.cardValue, isPremium && styles.premiumCardValue]}>
                {isPremium ? 'Abonnement Premium (1 Mois)' : 'Plan Gratuit / Standard'}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Expire le</Text>
              <Text style={[styles.cardValue, isPremium && styles.premiumCardValue]}>
                {isPremium && dateExpire ? dateExpire : 'Non applicable'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Liste des avantages inclus selon le statut ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AVANTAGES DU COMPTE</Text>

          {advantages.map((item, index) => (
            <View key={index} style={styles.advantageItem}>
              <View style={[styles.advantageIconContainer, isPremium && styles.premiumIconContainer]}>
                <Ionicons name={item.icon} size={22} color={isPremium ? '#d97706' : (COLORS.primary || '#7c3aed')} />
              </View>
              <View style={styles.advantageInfo}>
                <Text style={styles.advantageTitle}>{item.title}</Text>
                <Text style={styles.advantageDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Section Gestion & Renouvellement ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GESTION DE L'ABONNEMENT</Text>
          <View style={styles.renewCard}>
            <Text style={styles.renewText}>
              {isPremium 
                ? 'Votre abonnement est actif. Vous pouvez consulter les détails ou le renouveller depuis l\'espace de gestion.'
                : 'Passez au niveau supérieur pour débloquer le boost de conversion 7 TND et doubler vos gains !'}
            </Text>
            
            <TouchableOpacity 
              style={[styles.renewButton, isPremium ? styles.premiumRenewButton : { backgroundColor: COLORS.primary || '#7c3aed' }]}
              onPress={() => router.push('/gerer-abonnement')}
            >
              <Text style={styles.renewButtonText}>
                {isPremium ? 'Gérer mon offre Premium' : 'Devenir Membre Premium (5 TND)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles CSS pour le Light Mode (Fond blanc / gris clair très propre) ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Fond principal clair et moderne
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
    color: '#0f172a', // Texte du titre sombre pour contraste
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  // Carte d'abonnement standard (Fond blanc pur en Light mode)
  aboCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 22,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  // Carte surélevée en version Premium VIP (Aspect luxueux or/sombre)
  premiumAboCard: {
    backgroundColor: '#131926', // Reste sombre et dorée pour garder le côté exclusif Premium
    borderColor: '#d97706',
    borderWidth: 1.5,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  diamondContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 12,
  },
  premiumDiamondContainer: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 1.5,
  },
  premiumCardBrand: {
    color: '#ffffff',
  },
  cardType: {
    fontSize: 11,
    color: '#64748b',
    letterSpacing: 1,
    marginTop: 2,
  },
  premiumCardType: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#94a3b8',
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  statusTextInactive: {
    color: '#64748b',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  cardInfo: {
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  cardValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
  },
  premiumCardValue: {
    color: '#ffffff',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#64748b',
    letterSpacing: 2,
    fontWeight: '600',
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
  },
  advantageIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumIconContainer: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  advantageInfo: {
    flex: 1,
    gap: 2,
  },
  advantageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  advantageDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  renewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    gap: 16,
    alignItems: 'center',
  },
  renewText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  renewButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  premiumRenewButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});