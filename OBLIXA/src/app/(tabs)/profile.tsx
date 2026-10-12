import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { getUser, logout } from '../services/authService';
import { useLoyalty } from '../../hooks/useLoyalty';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const { stats, loadLoyaltyStats } = useLoyalty();

  const loadProfile = useCallback(async () => {
    const loadedUser = await getUser();
    setUser(loadedUser);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadLoyaltyStats();
    }, [loadProfile, loadLoyaltyStats])
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const labelForType = (type: string) => {
    if (type === 'premium') return 'Membre Premium';
    return 'Membre Standard';
  };

  return (
    <View style={styles.page}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.nom?.charAt(0)?.toUpperCase() || 'M'}</Text>
          </View>
          <Text style={styles.name}>{user?.nom || 'Utilisateur'}</Text>
          <Text style={styles.email}>{user?.email || 'email@oblixa.com'}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.memberBadge}>{labelForType(user?.accountType || 'standard')}</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>POINTS</Text>
            <Text style={styles.statValue}>{stats?.points || 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>NIVEAU</Text>
            <Text style={styles.statValue}>{stats?.niveau?.toUpperCase() || 'BRONZE'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>PORTEFEUILLE</Text>
            <Text style={styles.statValue}>{Number(stats?.dinarBalance || 0).toFixed(2)} TND</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/mes-informations')}>
            <View style={styles.menuIcon}><Ionicons name="person-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.menuText}>Mes informations</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/mes-abonnements')}>
            <View style={styles.menuIcon}><Ionicons name="card-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.menuText}>Mes abonnements</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/fidelite')}>
            <View style={styles.menuIcon}><Ionicons name="gift-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.menuText}>Programme fidélité</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/qui-sommes-nous')}>
            <View style={styles.menuIcon}><Ionicons name="help-circle-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.menuText}>Qui sommes-nous</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/contactez-nous')}>
            <View style={styles.menuIcon}><Ionicons name="call-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.menuText}>Contactez-nous</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 120, gap: 20 },
  profileCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  avatarCircle: { width: 92, height: 92, borderRadius: 46, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: COLORS.background, fontSize: 34, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.textDark },
  email: { color: COLORS.textMuted, marginTop: 6 },
  badgeRow: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primaryLight, borderRadius: 999 },
  memberBadge: { color: COLORS.primary, fontWeight: '700' },
  statsCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, letterSpacing: 1.2, marginBottom: 6 },
  statValue: { color: COLORS.textDark, fontSize: 18, fontWeight: '700' },
  statDivider: { width: 1, height: 48, backgroundColor: COLORS.border },
  menuCard: { backgroundColor: COLORS.surface, borderRadius: 24, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, justifyContent: 'space-between' },
  menuIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuText: { flex: 1, marginLeft: 10, color: COLORS.textDark, fontWeight: '600' },
  logoutButton: { backgroundColor: COLORS.error, borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  logoutButtonText: { color: COLORS.background, fontWeight: '700', fontSize: 15 },
});