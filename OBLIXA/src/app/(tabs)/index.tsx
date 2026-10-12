import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, TextInput, Animated,
  Image, ActivityIndicator, Modal, RefreshControl
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLoyalty } from '../../hooks/useLoyalty';
import { getOffers } from '../services/api';

const { width } = Dimensions.get('window');

// ── Categories ───────────────────────────────────
const CATEGORIES = [
  { id: 'all',          icon: '✨', label: 'Tous'         },
  { id: 'Restaurants',  icon: '🍽️', label: 'Restaurants'  },
  { id: 'Voyage',       icon: '✈️', label: 'Voyage'        },
  { id: 'Shopping',     icon: '🛍️', label: 'Shopping'      },
  { id: 'Santé',        icon: '❤️', label: 'Santé'         },
  { id: 'Loisirs',      icon: '🎯', label: 'Loisirs'       },
  { id: 'Éducation',    icon: '🎓', label: 'Éducation'     },
  { id: 'Informatique', icon: '💻', label: 'Informatique'  },
  { id: 'Sport',        icon: '🏋️', label: 'Sport'         },
];

export default function HomeScreen() {
  const [userName, setUserName]   = useState('');
  const [search, setSearch]       = useState('');
  const [offresList, setOffresList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activecat, setActiveCat] = useState('all');
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [rouletteModalShown, setRouletteModalShown] = useState(false);
  const fadeAnim                  = useState(new Animated.Value(0))[0];
  
  const { stats, loadLoyaltyStats } = useLoyalty();

  // ── Chargement depuis API ───────────────────────
  const loadOffersFromAPI = async (cat?: string, searchQuery?: string) => {
    setLoading(true);
    try {
      const data = await getOffers(cat, searchQuery);
      if (data.success) {
        setOffresList(data.offers);
        setError('');
      }
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Pull-to-refresh : recharge offres + points ──
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOffersFromAPI(activecat === 'all' ? undefined : activecat, search.length > 0 ? search : undefined),
        loadLoyaltyStats(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [activecat, search, loadLoyaltyStats]);

  useEffect(() => {
    loadOffersFromAPI();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.nom || '');
          if (!rouletteModalShown) {
            setShowRouletteModal(true);
            setRouletteModalShown(true);
          }
        }
        await loadLoyaltyStats();
      };
      loadUser();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, [loadLoyaltyStats, rouletteModalShown])
  );

  const pointsActuels = stats?.points ?? 0;
  const niveauActuel = stats?.niveau ?? 'bronze';
  
  const offresFiltrees = offresList;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── HEADER FIXE (barra ScrollView) ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName ? userName.charAt(0).toUpperCase() : 'A'}</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{userName || 'Membre'} 👋</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.navigate('/notifications')} style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.pointsBadge} onPress={() => router.push('/fidelite')}>
            <Ionicons name="star" size={14} color="#ff0000" />
            <Text style={styles.pointsText}>{pointsActuels}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une offre, une marque..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={async text => {
                  setSearch(text);
                  if (text.length === 0) {
                      loadOffersFromAPI(activecat === 'all' ? undefined : activecat);
                      return;
                  }
                  await loadOffersFromAPI(activecat === 'all' ? undefined : activecat, text);
              }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); loadOffersFromAPI(); }}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {search.length === 0 && (
            <View style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>✦ CLUB PRIVILÈGE</Text></View>
                <Text style={styles.heroTitle}>Club Privilège{'\n'}OBLIXA</Text>
                <Text style={styles.heroSubtitle}>Accédez à plus de 300 offres exclusives</Text>
                <TouchableOpacity style={styles.heroButton}><Text style={styles.heroButtonText}>Découvrir →</Text></TouchableOpacity>
              </View>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{search.length > 0 ? 'Résultats' : 'Offres du moment'}</Text>
              <Text style={styles.offresCount}>{offresFiltrees.length} offres</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPill, activecat === cat.id && styles.catPillActive]}
                  onPress={async () => {
                      setActiveCat(cat.id);
                      await loadOffersFromAPI(cat.id === 'all' ? undefined : cat.id, search.length > 0 ? search : undefined);
                  }}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[styles.catLabel, activecat === cat.id && styles.catLabelActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.offresList}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
              offresFiltrees.map(offre => (
                <TouchableOpacity
                  key={offre._id}
                  style={styles.offreCard}
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/offreDetails', params: { id: offre._id } })}
                >
                  <View style={[styles.offreImageContainer, { backgroundColor: offre.bgColor }]}>
                    <Image source={{ uri: offre.imageUrl }} style={styles.offreImage} resizeMode="cover" />
                    <View style={styles.offreBadge}><Text style={styles.offreBadgeText}>Bon de réduction {offre.discount}</Text></View>
                    <View style={styles.offreCatBadge}><Text style={styles.offreCatText}>{offre.category}</Text></View>
                  </View>
                  <View style={[styles.offreBody, { backgroundColor: offre.bgColor }]}>
                    <View style={styles.offreBodyLeft}>
                      <Image source={{ uri: offre.logoUrl }} style={styles.offreLogo} resizeMode="contain" />
                      <Text style={styles.offreBrand}>{offre.brand}</Text>
                      <Text style={styles.offreBodyLabel}>Bon de réduction</Text>
                      <Text style={styles.offreDiscount}>{offre.discount}</Text>
                      <View style={styles.offrePointsBadge}><Text style={styles.offrePointsText}>{offre.points} points 🎫</Text></View>
                    </View>
                    <View style={styles.offreBodyRight}>
                      <Text style={styles.offreCoupons}>{offre.coupons} coupons restants</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {search.length === 0 && (
            <TouchableOpacity style={styles.rewardsBanner} onPress={() => router.push('/fidelite')} activeOpacity={0.85}>
              <View style={styles.rewardsBannerLeft}>
                <Text style={styles.rewardsTitle}>Vos points</Text>
                <Text style={styles.rewardsPoints}>{pointsActuels} ⭐</Text>
                <Text style={styles.rewardsLevel}>
                  Niveau {niveauActuel === 'bronze' ? '🥉 Bronze' : niveauActuel === 'silver' ? '🥈 Silver' : niveauActuel === 'gold' ? '🥇 Gold' : '💎 Platinum'}
                </Text>
              </View>
              <View style={styles.rewardsBannerRight}>
                <Text style={styles.rewardsArrow}>→</Text>
                <Text style={styles.rewardsCTA}>Convertir</Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showRouletteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRouletteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Roulette quotidienne</Text>
            <Text style={styles.modalMessage}>
              Gagnez des points instantanément ! Faites tourner la roulette maintenant et tentez votre chance.
            </Text>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                setShowRouletteModal(false);
                router.push('roulette');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalActionText}>Jouer maintenant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRouletteModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseText}>Plus tard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1020',
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 8, right: 8,
    width: 7, height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.accentWhite,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1020',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterBtn: {
    width: 32, height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResults: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchResultsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroContent: {
    zIndex: 2,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#0B1020',
    fontWeight: '700',
    fontSize: 13,
  },
  heroCircle1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
  },
  heroCircle2: {
    position: 'absolute',
    right: -20,
    bottom: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.03,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  offresCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  catsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catIcon: {
    fontSize: 14,
  },
  catLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  catLabelActive: {
    color: '#0B1020',
    fontWeight: '700',
  },
  offresList: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  offreCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  offreImageContainer: {
    height: 160,
    position: 'relative',
  },
  offreImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  offreBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(11, 16, 32, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  offreBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  offreCatBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offreCatText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  offreBody: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  offreBodyLeft: {
    flex: 1,
    gap: 2,
  },
  offreLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  offreBrand: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  offreBodyLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  offreDiscount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  offrePointsBadge: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  offrePointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  offreBodyRight: {
    alignItems: 'flex-end',
  },
  offreCoupons: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  rewardsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rewardsBannerLeft: {
    gap: 4,
  },
  rewardsTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  rewardsPoints: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  rewardsLevel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  rewardsBannerRight: {
    alignItems: 'center',
    gap: 2,
  },
  rewardsArrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  rewardsCTA: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActionButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalActionText: {
    color: '#0B1020',
    fontSize: 15,
    fontWeight: '800',
  },
  modalCloseButton: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCloseText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});