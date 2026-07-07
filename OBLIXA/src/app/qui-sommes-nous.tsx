import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { COLORS } from '../constants/colors';

export default function QuiSommesNousScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Header ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Qui sommes-nous</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo Diamant OBLIXA */}
        <View style={styles.logoContainer}>
          <View style={styles.diamond}>
            <View style={styles.diamondTop} />
            <View style={styles.diamondBottom} />
          </View>
          <Text style={styles.brandText}>OBLIXA</Text>
          <Text style={styles.tagline}>PRIVATE CLUB</Text>
        </View>

        {/* Card Histoire */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>NOTRE MISSION</Text>
          <Text style={styles.paragraph}>
            OBLIXA est un club privé exclusif conçu pour redéfinir votre expérience de consommation. 
            Notre objectif est de connecter nos membres privilégiés avec les meilleurs partenaires (restaurants, hôtels, boutiques, supermarchés) tout en offrant des avantages et des remises d'exception.
          </Text>
        </View>

        {/* Card Valeurs */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>NOS VALEURS</Text>
          
          <View style={styles.valueRow}>
            <Text style={styles.valueIcon}>💎</Text>
            <View style={styles.valueTextContainer}>
              <Text style={styles.valueTitle}>Exclusivité</Text>
              <Text style={styles.valueDesc}>Des offres uniques négociées uniquement pour notre communauté.</Text>
            </View>
          </View>

          <View style={styles.valueRow}>
            <Text style={styles.valueIcon}>🤝</Text>
            <View style={styles.valueTextContainer}>
              <Text style={styles.valueTitle}>Partenariat Solide</Text>
              <Text style={styles.valueDesc}>Nous choisissons nos partenaires avec soin pour garantir une qualité premium.</Text>
            </View>
          </View>
        </View>

        <Text style={styles.versionText}>OBLIXA v1.0.0 — Fait avec passion</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  backBtn: { fontSize: 16, color: COLORS.primary },
  headerTitle: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, gap: 20 },
  logoContainer: { alignItems: 'center', marginVertical: 10 },
  diamond: { alignItems: 'center', marginBottom: 12 },
  diamondTop: { width: 0, height: 0, borderLeftWidth: 16, borderRightWidth: 16, borderBottomWidth: 18, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: COLORS.primary },
  diamondBottom: { width: 0, height: 0, borderLeftWidth: 16, borderRightWidth: 16, borderTopWidth: 14, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.primaryDark },
  brandText: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, letterSpacing: 3 },
  tagline: { fontSize: 11, color: COLORS.accent, letterSpacing: 1.5, marginTop: 2 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 20, gap: 12 },
  sectionTitle: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 2, fontWeight: '600' },
  paragraph: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22, fontWeight: '300' },
  valueRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
  valueIcon: { fontSize: 22 },
  valueTextContainer: { flex: 1, gap: 2 },
  valueTitle: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  valueDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  versionText: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 10 }
});