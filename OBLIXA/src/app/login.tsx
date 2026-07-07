import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,ActivityIndicator} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// ── Configuration globale de l'adresse IP du serveur ──────────────────
const API_URL = 'http://192.168.100.5:5000/api';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // ── Fonction de soumission du formulaire ───────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password: password,
      });

      const data = response.data;

      // Stockage sécurisé du token et des données utilisateur
      await AsyncStorage.setItem('token', data.token);
      if (data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirection vers l'application principale
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Impossible de se connecter au serveur Oblixa');
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
      {/* Correction de la barre d'état sans backgroundColor conflictuel */}
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Section Header & Branding OBLIXA */}
        <View style={styles.header}>
          <Text style={styles.brandText}>
            OBLI<Text style={{ color: COLORS.primaryRed }}>XA</Text>
          </Text>
          <Text style={styles.title}>Bon retour</Text>
          <Text style={styles.subtitle}>Connectez-vous pour accéder à vos remises</Text>
        </View>

        {/* Formulaire de connexion */}
        <View style={styles.form}>
          
          {/* Champ Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
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
          </View>

          {/* Champ Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeButton}>
                <Ionicons 
                  name={showPass ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.textMuted} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Affichage des erreurs de validation ou serveur */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Lien Mot de passe oublié */}
          <TouchableOpacity style={styles.forgotContainer} activeOpacity={0.7} onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Bouton Principal de Connexion */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Séparateur visuel */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Lien vers l'inscription */}
          <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/register')} activeOpacity={0.7}>
            <Text style={styles.registerText}>
              Pas encore membre ? <Text style={styles.registerLink}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 28, 
    paddingVertical: 50 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  brandText: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.textDark, 
    marginBottom: 6 
  },
  subtitle: { 
    fontSize: 14, 
    color: COLORS.textMuted, 
    textAlign: 'center' 
  },
  form: { 
    gap: 18 
  },
  inputGroup: { 
    gap: 6 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '600',
    color: COLORS.textDark 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1, 
    color: COLORS.textDark,
    fontSize: 15,
    height: '100%'
  },
  eyeButton: { 
    padding: 4 
  },
  errorText: { 
    fontSize: 13, 
    color: COLORS.error, 
    textAlign: 'center',
    fontWeight: '500'
  },
  forgotContainer: { 
    alignSelf: 'flex-end',
    marginTop: 2
  },
  forgotText: { 
    fontSize: 13, 
    color: COLORS.primaryRed, 
    fontWeight: '600' 
  },
  loginButton: { 
    backgroundColor: COLORS.primaryRed, 
    borderRadius: 12, 
    height: 54,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: COLORS.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonDisabled: { 
    opacity: 0.6 
  },
  loginButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    letterSpacing: 0.5 
  },
  separator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginVertical: 10 
  },
  separatorLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: COLORS.border 
  },
  separatorText: { 
    fontSize: 13, 
    color: COLORS.textMuted 
  },
  registerButton: { 
    alignItems: 'center',
    marginTop: 6
  },
  registerText: { 
    fontSize: 14, 
    color: COLORS.textMuted 
  },
  registerLink: { 
    color: COLORS.primaryRed, 
    fontWeight: 'bold' 
  },
});