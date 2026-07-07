import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { COLORS } from '../constants/colors';

export default function PolitiqueConfidentialiteScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Header ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confidentialité</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdate}>Dernière mise à jour : Juin 2026</Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. COLLECTE DES DONNÉES</Text>
          <Text style={styles.paragraph}>
            Nous collectons les informations que vous nous fournissez lors de la création de votre compte OBLIXA, notamment votre nom complet, votre adresse e-mail et l'état de votre abonnement.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. UTILISATION DES DONNÉES</Text>
          <Text style={styles.paragraph}>
            Vos données de profil et vos points de fidélité sont uniquement utilisés pour valider vos avantages chez nos partenaires commerciaux via le scanner QR Code et pour personnaliser vos offres exclusives.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. SÉCURITÉ DE VOS INFORMATIONS</Text>
          <Text style={styles.paragraph}>
            OBLIXA applique des protocoles de sécurité rigoureux pour garantir la protection de vos jetons d'authentification et de vos informations personnelles contre tout accès non autorisé.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  backBtn: { fontSize: 16, color: COLORS.primary },
  headerTitle: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, gap: 24 },
  lastUpdate: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 12, color: COLORS.primary, letterSpacing: 1.5, fontWeight: '600' },
  paragraph: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, textAlign: 'justify', fontWeight: '300' }
});