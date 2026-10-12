import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useLoyalty } from '../../hooks/useLoyalty';

export default function WalletScreen() {
  const { stats, loadLoyaltyStats, getHistory } = useLoyalty();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    await loadLoyaltyStats();
    const history = await getHistory();
    setTransactions(history || []);
    setLoading(false);
  }, [getHistory, loadLoyaltyStats]);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet])
  );

  const formatLabel = (type: string) => {
    switch (type) {
      case 'CONVERT': return 'Conversion';
      case 'REDEEM': return 'Échange produit';
      case 'RECHARGE': return 'Recharge points';
      case 'SPEND': return 'Dépense';
      case 'SCAN': return 'Scan QR';
      case 'ROULETTE': return 'Roulette';
      default: return type;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CONVERT': return 'swap-vertical-outline';
      case 'REDEEM': return 'cart-outline';
      case 'RECHARGE': return 'add-circle-outline';
      case 'SPEND': return 'remove-circle-outline';
      case 'SCAN': return 'qr-code-outline';
      case 'ROULETTE': return 'game-controller-outline';
      default: return 'receipt-outline';
    }
  };

  const getTransactionColor = (type: string) => {
    return type === 'SPEND' || type === 'CONVERT' ? COLORS.error : COLORS.success;
  };

  return (
    <View style={styles.page}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.walletCard}>
          <View style={styles.walletCardTop}>
            <View>
              <Text style={styles.walletLabel}>Portefeuille</Text>
              <Text style={styles.walletValue}>{Number(stats?.dinarBalance || 0).toFixed(3)} TND</Text>
            </View>
            <View style={styles.walletBadge}>
              <Text style={styles.walletBadgeText}>{(stats?.niveau || 'BRONZE').toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.walletRow}>
            <View style={styles.walletStat}>
              <Text style={styles.walletStatLabel}>Points</Text>
              <Text style={styles.walletStatValue}>{stats?.points || 0}</Text>
            </View>
            <View style={styles.walletStat}>
              <Text style={styles.walletStatLabel}>Transactions</Text>
              <Text style={styles.walletStatValue}>{transactions.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Historique des transactions</Text>
          <TouchableOpacity onPress={() => loadWallet()}>
            <Ionicons name="refresh-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune transaction pour le moment.</Text>
          </View>
        ) : (
          transactions.map((item) => (
            <View key={item._id || item.createdAt} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIconWrapper, { backgroundColor: getTransactionColor(item.type) + '20' }]}> 
                  <Ionicons name={getTransactionIcon(item.type)} size={18} color={getTransactionColor(item.type)} />
                </View>
                <View style={styles.transactionTextGroup}>
                  <Text style={styles.transactionTitle}>{formatLabel(item.type)}</Text>
                  <Text style={styles.transactionDescription}>{item.description || 'Historique récent'}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, item.type === 'SPEND' || item.type === 'CONVERT' ? styles.transactionNegative : styles.transactionPositive]}>
                  {item.type === 'SPEND' || item.type === 'CONVERT' ? '-' : '+'}{item.amount}
                </Text>
                <Text style={styles.transactionDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.detailsButton} onPress={() => router.push('/fidelite')}>
          <Text style={styles.detailsButtonText}>Voir le programme fidélité</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 120, gap: 20 },
  walletCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  walletCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { color: COLORS.textSecondary, fontSize: 12, letterSpacing: 1.5, marginBottom: 10 },
  walletValue: { fontSize: 40, fontWeight: '800', color: COLORS.textDark },
  walletBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  walletBadgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  walletStat: { flex: 1, alignItems: 'center' },
  walletStatLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 6 },
  walletStatValue: { color: COLORS.textDark, fontSize: 16, fontWeight: '700' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { color: COLORS.textDark, fontSize: 16, fontWeight: '700' },
  transactionCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  transactionLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  transactionIconWrapper: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  transactionTextGroup: { flex: 1 },
  transactionTitle: { color: COLORS.textDark, fontSize: 15, fontWeight: '700' },
  transactionDescription: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
  transactionPositive: { color: COLORS.success },
  transactionNegative: { color: COLORS.error },
  transactionDate: { color: COLORS.textSecondary, fontSize: 11, marginTop: 6 },
  detailsButton: { backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  detailsButtonText: { color: COLORS.background, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
});