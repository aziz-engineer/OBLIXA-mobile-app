import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ── Configuration de l'adresse du serveur ───────────────────────────
const API_URL = 'http://192.168.100.5:5000/api'; 

export default function RegisterScreen() {
  const [nom, setNom]           = useState<string>('');
  const [email, setEmail]       = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm]   = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading]   = useState<boolean>(false);
  const [error, setError]       = useState<string>('');

  // ── Gestion de l'inscription ───────────────────────────────────────
  const handleRegister = async () => {
    if (!nom || !email || !password || !confirm) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Requete directe vers l'endpoint d'inscription du backend
      const response = await axios.post(`${API_URL}/auth/register`, {
        nom,
        email: email.trim().toLowerCase(),
        password,
      });

      const data = response.data;

      // Stockage local apres inscription reussie
      await AsyncStorage.setItem('token', data.token);
      if (data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }

      // Retour vers l'ecran de connexion
      router.replace('/login');

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <View style={styles.logoSmall}>
            <View style={styles.diamondTop} />
            <View style={styles.diamondBottom} />
          </View>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez le club OBLIXA</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              placeholderTextColor={COLORS.textMuted}
              value={nom}
              onChangeText={setNom}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginLinkText}>
              Déjà membre ? <Text style={styles.loginLinkBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoSmall: { alignItems: 'center', marginBottom: 24 },
  diamondTop: { width: 0, height: 0, borderLeftWidth: 18, borderRightWidth: 18, borderBottomWidth: 20, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: COLORS.primary },
  diamondBottom: { width: 0, height: 0, borderLeftWidth: 18, borderRightWidth: 18, borderTopWidth: 15, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.primaryDark },
  title: { fontSize: 26, fontWeight: '300', color: COLORS.textPrimary, letterSpacing: 1, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, letterSpacing: 0.5 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, color: COLORS.textSecondary, letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.textPrimary },
  passwordContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, alignItems: 'center' },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.textPrimary },
  eyeButton: { paddingHorizontal: 16 },
  eyeText: { fontSize: 18 },
  errorText: { fontSize: 13, color: COLORS.error, textAlign: 'center' },
  registerButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  registerButtonText: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary, letterSpacing: 1 },
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: COLORS.textSecondary },
  loginLinkBold: { color: COLORS.primary, fontWeight: '500' },
});