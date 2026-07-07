import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { COLORS } from '../constants/colors';

export default function ContactezNousScreen() {
  
  const handleCall = () => {
    Linking.openURL('tel:+21622000000'); // 🟢 Mets le vrai numéro de téléphone du projet
  };

  const handleEmail = () => {
    Linking.openURL('mailto:contact@oblixa.com'); // 🟢 Mets le vrai mail
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Header ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contactez-nous</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.infoText}>
          Une question, une suggestion ou besoin d'assistance ? Notre support est disponible pour vous répondre.
        </Text>

        {/* Support Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CANAUX DE SUPPORT</Text>

          {/* Bouton Téléphone */}
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Téléphone</Text>
              <Text style={styles.contactValue}>+216 29 026 948</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Bouton Email */}
          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <Text style={styles.contactIcon}>✉️</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>E-mail</Text>
              <Text style={styles.contactValue}>contact@oblixa.com</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Horaire Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>HORAIRES D'OUVERTURE</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Lundi - Vendredi</Text>
            <Text style={styles.timeValue}>09:00 - 18:00</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Samedi</Text>
            <Text style={styles.timeValue}>09:00 - 13:00</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Dimanche</Text>
            <Text style={styles.timeValue}>Fermé</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  backBtn: { fontSize: 16, color: COLORS.primaryRed },
  headerTitle: { fontSize: 16, fontWeight: '500', color: COLORS.textDark },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, gap: 20 },
  infoText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, fontWeight: '300', marginBottom: 4 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 20, gap: 14 },
  sectionTitle: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 2, fontWeight: '600', marginBottom: 4 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  contactIcon: { fontSize: 24 },
  contactInfo: { flex: 1, gap: 2 },
  contactLabel: { fontSize: 12, color: COLORS.textMuted },
  contactValue: { fontSize: 14, fontWeight: '500', color: COLORS.textDark },
  arrow: { fontSize: 18, color: COLORS.textMuted },
  divider: { height: 0.5, backgroundColor: COLORS.border },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  timeLabel: { fontSize: 13, color: COLORS.textDark, fontWeight: '300' },
  timeValue: { fontSize: 13, color: COLORS.primaryRed, fontWeight: '500' }
});