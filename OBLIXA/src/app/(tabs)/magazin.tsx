import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { getOffers } from '../services/api';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type CategoryItem = {
  id: string;
  label: string;
  icon: IconName;
};

const CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'Tous', icon: 'sparkles-outline' },
  { id: 'Restaurants', label: 'Restaurants', icon: 'restaurant-outline' },
  { id: 'Voyage', label: 'Voyage', icon: 'airplane-outline' },
  { id: 'Shopping', label: 'Shopping', icon: 'bag-handle-outline' },
  { id: 'Sport', label: 'Sport', icon: 'football-outline' },
  { id: 'Éducation', label: 'Éducation', icon: 'school-outline' },
];

export default function MagazinScreen() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOffers(category === 'all' ? undefined : category, search);
      setOffers(data.offers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, search]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOffers();
  }, [loadOffers]);

  const partners = offers.reduce((acc: any, offer: any) => {
    const existing = acc.find((item: any) => item.name === offer.brand);
    if (existing) existing.offers += 1;
    else acc.push({ name: offer.brand || offer.title, count: 1 });
    return acc;
  }, []);

  return (
    <View style={styles.page}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerWrap}>
          <View style={styles.heroRow}>
            <View style={styles.heroIcon}>
              <Ionicons name="gift-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>OBLIXA</Text>
            <View style={styles.heroBadge}>
              <Ionicons name="star" size={14} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>0</Text>
            </View>
          </View>

          <View style={styles.infoChipRow}>
            <View style={[styles.infoChip, styles.infoChipPrimary]}>
              <Text style={styles.infoChipTitle}>OBLIXA</Text>
              <Text style={styles.infoChipSubtitle}>Comment ça marche?</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipTitle}>Disponible</Text>
              <Text style={styles.infoChipSubtitle}>en ligne</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipTitle}>Consulter</Text>
              <Text style={styles.infoChipSubtitle}>mes coupons</Text>
            </View>
          </View>

          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Recherche"
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={loadOffers}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryList}>
            {CATEGORIES.map((item) => {
              const active = category === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.categoryButton, active && styles.categoryButtonActive]}
                  onPress={() => setCategory(item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={item.icon} size={18} color={active ? COLORS.background : COLORS.primary} />
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.offersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Offres du moment</Text>
            <Text style={styles.sectionSubtitle}>{offers.length} résultats</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : offers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune offre trouvée pour le moment.</Text>
            </View>
          ) : (
            offers.slice(0, 4).map((offer: any) => (
              <TouchableOpacity
                key={offer._id || offer.title}
                style={styles.offerCard}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/offreDetails', params: { id: offer._id } })}
              >
                <View style={styles.offerInfo}>
                  <Text style={styles.offerTitle}>{offer.title || offer.brand || 'Offre spéciale'}</Text>
                  <Text numberOfLines={2} style={styles.offerSubtitle}>
                    {offer.description || `${offer.brand || 'OBLIXA'} vous propose une offre exclusive.`}
                  </Text>
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerBadgeText}>{offer.discount ? `${offer.discount}` : 'Offre'}</Text>
                  </View>
                </View>
                <View style={styles.offerLogo}>
                  <Text style={styles.offerLogoText}>{(offer.brand || offer.title || 'OB').slice(0, 2).toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Découvrez nos partenaires</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          partners.map((partner: any, index: number) => (
            <View key={`${partner.name}-${index}`} style={styles.partnerRow}>
              <View style={styles.partnerIcon}>
                <Ionicons name="storefront-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{partner.name || 'Partenaire'}</Text>
                <Text style={styles.partnerSubtitle}>{partner.count} Offres</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 120, gap: 20 },
  headerWrap: { gap: 24 },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  heroBadgeText: { color: COLORS.textDark, fontWeight: '700' },
  infoChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoChip: { minWidth: 140, borderRadius: 20, backgroundColor: COLORS.surface, paddingVertical: 18, paddingHorizontal: 16, justifyContent: 'center', gap: 4 },
  infoChipPrimary: { backgroundColor: COLORS.textDark },
  infoChipTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  infoChipSubtitle: { color: COLORS.textSecondary, fontSize: 11 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  searchInput: { flex: 1, color: COLORS.textDark, fontSize: 14 },
  categoryScroll: { marginTop: 0 },
  categoryList: { gap: 12, paddingRight: 10 },
  categoryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, backgroundColor: COLORS.surface },
  categoryButtonActive: { backgroundColor: COLORS.primary },
  categoryText: { color: COLORS.textDark, fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: COLORS.background },
  offersSection: { gap: 14 },
  sectionSubtitle: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  offerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 24, padding: 16, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  offerInfo: { flex: 1 },
  offerTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  offerSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8, lineHeight: 20 },
  offerBadge: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  offerBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  offerLogo: { width: 52, height: 52, borderRadius: 18, backgroundColor: COLORS.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  offerLogoText: { color: COLORS.textDark, fontSize: 16, fontWeight: '800' },
  sectionHeader: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  partnerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  partnerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  partnerSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
});