import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS } from '../constants/colors';
import { useLoyalty } from '../hooks/useLoyalty';

// ── CONFIGURATION DES NIVEAUX DE FIDÉLITÉ ─────────────────────────────
const NIVEAUX = [
  { id: 'bronze', label: 'Bronze', icon: '🥉', min: 0, max: 199, color: '#CD7F32' },
  { id: 'silver', label: 'Silver', icon: '🥈', min: 200, max: 499, color: '#C0C0C0' },
  { id: 'gold', label: 'Gold', icon: '🥇', min: 500, max: 999, color: '#FFD700' },
  { id: 'platinum', label: 'Platinum', icon: '💎', min: 1000, max: null, color: '#E5E4E2' },
];

export default function FideliteScreen() {
  const {
    stats,
    loading: apiLoading,
    convertPointsToDinar,
    convertDinarToPoints,
    loadLoyaltyStats
  } = useLoyalty();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadLoyaltyStats();
    } finally {
      setRefreshing(false);
    }
  }, [loadLoyaltyStats]);

  // Amount in TND the user wants to convert (string for TextInput)
  const [convertAmount, setConvertAmount] = useState('');

  const [niveau, setNiveau] = useState('bronze');

  const points = stats?.points || 0;
  const dinarBalance = stats?.dinarBalance || 0;

  useFocusEffect(
    useCallback(() => {
      loadLoyaltyStats();

      const loadUserLocal = async () => {
        try {
          const userJson = await SecureStore.getItemAsync('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            setNiveau(user.niveau || 'bronze');
          }
        } catch (e) {
          console.log("Erreur chargement user local:", e);
        }
      };
      loadUserLocal();
    }, [loadLoyaltyStats])
  );

  const niveauActuel = NIVEAUX.find(n => n.id === niveau) || NIVEAUX[0];
  const index = NIVEAUX.findIndex(n => n.id === niveau);
  const niveauSuivant = NIVEAUX[index + 1];

  const progressPercent = niveauSuivant
    ? Math.min(((points - niveauActuel.min) / (niveauSuivant.min - niveauActuel.min)) * 100, 100)
    : 100;

  // ── GESTION DE LA CONVERSION DES POINTS (points → dinars, sens unique) ──
  const handleConvertir = async () => {
    // Convert only the entered amount (dinar -> points)
    const montant = Number(convertAmount || 0);
    if (!montant || montant <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant valide en TND.');
      return;
    }
    if (montant > dinarBalance) {
      Alert.alert('Montant trop élevé', "Le montant demandé dépasse votre solde dinar.");
      return;
    }

    Alert.alert(
      'Convertir en points',
      `Voulez-vous convertir ${montant} TND en points ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Convertir',
          onPress: async () => {
            const res = await convertDinarToPoints(montant);
            if (res?.success) {
              Alert.alert('✅ Conversion réussie', `Vous avez reçu ${res.pointsGagnes || ''} points !`);
              setConvertAmount('');
              await loadLoyaltyStats();
            } else {
              const msg = res?.error || res?.message || res?.data?.message || 'Une erreur est survenue lors de la conversion.';
              Alert.alert('Échec', msg);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programme fidélité</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>VOS POINTS</Text>
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsSuffix}>points</Text>

          <Text style={styles.pointsEquiv}>
            Mon Solde: {Number(dinarBalance).toFixed(3)} TND
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VOTRE NIVEAU</Text>
          <View style={styles.niveauCard}>
            <View style={styles.niveauHeader}>
              <Text style={styles.niveauIcon}>{niveauActuel.icon}</Text>
              <View>
                <Text style={styles.niveauLabel}>Niveau actuel</Text>
                <Text style={[styles.niveauName, { color: niveauActuel.color }]}>
                  {niveauActuel.label}
                </Text>
              </View>
            </View>
            {niveauSuivant && (
              <>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {points} / {niveauSuivant.min} pts
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONVERTIR VOS POINTS</Text>
          <View style={styles.convertCard}>
            <Text style={styles.convertTitle}>5 TND / 7 TND = 100 points</Text>
            <Text style={styles.convertDesc}>Convertissez vos points en argent dans votre portefeuille</Text>

            <TextInput
              style={styles.input}
              placeholder="Montant à convertir (TND)"
              keyboardType="numeric"
              value={convertAmount}
              onChangeText={(t) => setConvertAmount(t.replace(',', '.'))}
            />

            <TouchableOpacity
              style={[styles.convertButton, ((Number(convertAmount) <= 0) || Number(convertAmount) > dinarBalance || apiLoading) && styles.disabled]}
              disabled={apiLoading || Number(convertAmount) <= 0 || Number(convertAmount) > dinarBalance}
              onPress={handleConvertir}
            >
              {apiLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.convertButtonText}>Convertir mes argents en points</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.convertNote}>Points disponibles : {points}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── STYLES DU COMPOSANT ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  backBtn: { color: COLORS.primary, fontSize: 16 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 16 },
  content: { padding: 24, gap: 24 },
  pointsCard: { backgroundColor: COLORS.primaryDark, borderRadius: 16, padding: 30, alignItems: 'center' },
  pointsLabel: { color: COLORS.primaryLight, letterSpacing: 3 },
  pointsValue: { fontSize: 56, color: '#fff' },
  pointsSuffix: { color: '#fff' },
  pointsEquiv: { color: COLORS.accent, marginTop: 10, fontWeight: '600', fontSize: 16 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 12, letterSpacing: 2 },
  section: { gap: 12 },
  niveauCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 14 },
  niveauHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  niveauIcon: { fontSize: 40 },
  niveauLabel: { color: COLORS.textSecondary },
  niveauName: { fontSize: 22 },
  progressBar: { height: 7, backgroundColor: COLORS.border, marginTop: 20, borderRadius: 5 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  progressText: { color: COLORS.textSecondary, marginTop: 8 },
  convertCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 14, alignItems: 'center' },
  convertTitle: { fontSize: 20, color: COLORS.accent },
  convertDesc: { color: COLORS.textSecondary, marginVertical: 10 },
  convertButton: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, width: '100%', alignItems: 'center', height: 48, justifyContent: 'center' },
  disabled: { opacity: .4 },
  convertButtonText: { color: '#fff', fontWeight: 'bold' },
  convertNote: { marginTop: 10, color: COLORS.textSecondary }
  ,
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000'
  }
});