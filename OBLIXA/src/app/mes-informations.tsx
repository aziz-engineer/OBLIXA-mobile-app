import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, Share
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { logout, deleteAccount, getToken } from './services/authService';
import { API_URL } from './services/api';
import { useLoyalty } from '../hooks/useLoyalty'; // Importation du Hook personnalisé

// ── Page : Mes Informations ──────────────────────
export default function MesInformationsScreen() {
  // Extraction des données de fidélité depuis le hook partagé
  const { stats, loadLoyaltyStats } = useLoyalty();

  const [nom, setNom]         = useState('');
  const [email, setEmail]     = useState('');
  const [telephone, setTel]   = useState('');
  const [niveau, setNiveau]   = useState('bronze');
  const [abonnement, setAbon] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Valeurs dynamiques issues du serveur (via le hook)
  const points = stats?.points || 0;
  const dinarBalance = stats?.dinarBalance || 0;

  // ── Charger les infos utilisateur et synchroniser le serveur ────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadLoyaltyStats(); // Rafraîchir les points et le solde en TND depuis le backend

      const loadUserLocal = async () => {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setNom(user.nom || '');
          setEmail(user.email || '');
          setTel(user.telephone || '');
          setNiveau(user.niveau || 'bronze');
          setAbon(user.abonnement || 'actif');
        }
      };
      loadUserLocal();
    }, [loadLoyaltyStats])
  );

  // ── Sauvegarder les modifications du profil ───────────
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nom, telephone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Mettre à jour l'AsyncStorage local
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        user.nom = nom;
        user.telephone = telephone;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
      setEditing(false);
      Alert.alert('✅ Succès', 'Informations mises à jour');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFriends = async () => {
    try {
      await Share.share({
        title: 'Rejoins OBLIXA',
        message: "Rejoins-moi sur OBLIXA ! Télécharge l'app et découvre OBLIXA : https://oblixa.app",
      });
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de partager pour le moment.');
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const data = await deleteAccount();
      if (data.success) {
        await logout();
        router.replace('/login');
        Alert.alert('Compte supprimé', 'Votre compte a bien été supprimé.');
      } else {
        throw new Error(data.message || 'Impossible de supprimer le compte.');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de supprimer le compte.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* ── En-tête de la page ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes informations</Text>
        <TouchableOpacity
          onPress={() => editing ? handleSave() : setEditing(true)}
        >
          <Text style={styles.editBtn}>
            {loading ? '...' : editing ? 'Sauvegarder' : 'Modifier'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* ── Section Avatar ───────────────────────────── */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {nom ? nom.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.avatarName}>{nom}</Text>
        </View>

        {/* ── Section Informations Personnelles ───────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
          
          {/* Nom complet */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nom complet</Text>
            {editing ? (
              <TextInput
                style={styles.fieldInput}
                value={nom}
                onChangeText={setNom}
                placeholderTextColor={COLORS.textMuted}
              />
            ) : (
              <Text style={styles.fieldValue}>{nom}</Text>
            )}
          </View>

          {/* Email (Non modifiable) */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={[styles.fieldValue, styles.fieldLocked]}>
              {email} 🔒
            </Text>
          </View>

          {/* Numéro de téléphone */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Téléphone</Text>
            {editing ? (
              <TextInput
                style={styles.fieldInput}
                value={telephone}
                onChangeText={setTel}
                keyboardType="phone-pad"
                placeholder="Ex: +216 XX XXX XXX"
                placeholderTextColor={COLORS.textMuted}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {telephone || 'Non renseigné'}
              </Text>
            )}
          </View>
        </View>

        {/* ── Section Abonnement ───────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABONNEMENT</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Statut</Text>
            <Text style={[styles.fieldValue, { color: COLORS.success }]}>
              ✅ {abonnement}
            </Text>
          </View>
        </View>

        {/* ── Section Programme de Fidélité ───────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROGRAMME FIDÉLITÉ</Text>
          <View style={styles.loyaltyCard}>
            
            {/* Affichage des points réels */}
            <View style={styles.loyaltyRow}>
              <Text style={styles.loyaltyLabel}>Points accumulés</Text>
              <Text style={styles.loyaltyValue}>{points} pts</Text>
            </View>
            
            <View style={styles.loyaltyDivider} />
            
            {/* Niveau actuel de fidélité */}
            <View style={styles.loyaltyRow}>
              <Text style={styles.loyaltyLabel}>Niveau actuel</Text>
              <Text style={styles.loyaltyValue}>
                {niveau === 'bronze'  ? '🥉 Bronze'  :
                 niveau === 'silver'  ? '🥈 Silver'  :
                 niveau === 'gold'    ? '🥇 Gold'    :
                 '💎 Platinum'}
              </Text>
            </View>
            
            <View style={styles.loyaltyDivider} />
            
            {/* AJOUT : Affichage du solde réel du portefeuille en TND */}
            <View style={styles.loyaltyRow}>
              <Text style={styles.loyaltyLabel}>Mon Portefeuille</Text>
              <Text style={[styles.loyaltyValue, { color: COLORS.success, fontWeight: '700' }]}>
                {dinarBalance.toFixed(2)} TND
              </Text>
            </View>
            
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>COMPTE ET PARTAGE</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleInviteFriends}>
            <Text style={styles.actionButtonText}>Inviter des amis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={confirmDeleteAccount}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bouton Annuler (en mode édition) ───────────────── */}
        {editing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setEditing(false)}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles du composant ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  backBtn: { fontSize: 16, color: COLORS.primary },
  headerTitle: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  editBtn: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryDark, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '300', color: COLORS.textPrimary },
  avatarName: { fontSize: 18, fontWeight: '300', color: COLORS.textPrimary, letterSpacing: 1 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 11, color: COLORS.textSecondary, letterSpacing: 2, marginBottom: 14 },
  field: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10, gap: 6 },
  fieldLabel: { fontSize: 11, color: COLORS.textSecondary, letterSpacing: 1 },
  fieldValue: { fontSize: 15, color: COLORS.textPrimary },
  fieldLocked: { color: COLORS.textMuted, fontSize: 14 },
  fieldInput: { fontSize: 15, color: COLORS.textPrimary, borderBottomWidth: 1, borderBottomColor: COLORS.primary, paddingVertical: 4 },
  loyaltyCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.primaryDark, padding: 16, gap: 12 },
  loyaltyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loyaltyLabel: { fontSize: 13, color: COLORS.textSecondary },
  loyaltyValue: { fontSize: 14, fontWeight: '500', color: COLORS.accent },
  loyaltyDivider: { height: 0.5, backgroundColor: COLORS.border },
  actionSection: { marginBottom: 28 },
  actionButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  actionButtonText: { fontSize: 15, color: COLORS.onPrimary, fontWeight: '600' },
  deleteButton: { backgroundColor: COLORS.error },
  deleteButtonText: { color: COLORS.onError },
  cancelButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, color: COLORS.textSecondary },
});