import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

// ── Page 1 : Splash Screen ───────────────────────
export default function SplashScreen() {

  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.7)).current;
  const auraOpacity    = useRef(new Animated.Value(0)).current;
  const auraScale      = useRef(new Animated.Value(0.5)).current;
  const textOpacity    = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const dotsOpacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    // ── Séquence d'animations ────────────────────
    Animated.sequence([

      // 1. Aura apparaît
      Animated.parallel([
        Animated.timing(auraOpacity, {
          toValue: 1, duration: 800, useNativeDriver: true,
        }),
        Animated.spring(auraScale, {
          toValue: 1, friction: 6, useNativeDriver: true,
        }),
      ]),

      // 2. Logo apparaît
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
        }),
      ]),

      // 3. Texte OBLIXA apparaît
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0, duration: 500, useNativeDriver: true,
        }),
      ]),

      // 4. Points de chargement apparaissent
      Animated.timing(dotsOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),

    ]).start();

    // ── Redirection vers Login après 3 secondes ──
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Utilisation du style dark pour le Light Mode de l'application */}
      <StatusBar style="dark" />

      {/* Aura lumineuse subtile */}
      <Animated.View style={[styles.aura, {
        opacity: auraOpacity,
        transform: [{ scale: auraScale }],
      }]} />

      {/* Logo géométrique */}
      <Animated.View style={[styles.logoContainer, {
        opacity: logoOpacity,
        transform: [{ scale: logoScale }],
      }]}>
        <View style={styles.logoCircle}>
          <View style={styles.diamond}>
            <View style={styles.diamondTop} />
            <View style={styles.diamondBottom} />
          </View>
        </View>
      </Animated.View>

      {/* Nom de la marque OBLIXA */}
      <Animated.View style={{
        opacity: textOpacity,
        transform: [{ translateY: textTranslateY }],
        alignItems: 'center',
      }}>
        <View style={styles.titleRow}>
          <View style={styles.titleLine} />
          <Text style={styles.appName}>OBLIXA</Text>
          <View style={styles.titleLine} />
        </View>
        <Text style={styles.subtitle}>PRIVATE CLUB</Text>
      </Animated.View>

      {/* Points d'attente / Chargement */}
      <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>

    </View>
  );
}

// ── Styles de l'interface ────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.primaryRed,
    opacity: 0.05, // Réduit légèrement pour un effet Light Mode plus élégant
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  diamond: {
    alignItems: 'center',
  },
  diamondTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 28,
    borderRightWidth: 28,
    borderBottomWidth: 32,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.primaryRed,
  },
  diamondBottom: {
    width: 0,
    height: 0,
    borderLeftWidth: 28,
    borderRightWidth: 28,
    borderTopWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.textDark, // Couleur sombre contrastante pour la base du diamant
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  titleLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.border,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    letterSpacing: 10,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 6,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primaryRed,
  },
});