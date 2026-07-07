import React, { useState, useRef, useEffect } from 'react';
import {StyleSheet,View,Text,ScrollView,TouchableOpacity,Dimensions,Animated,Easing,} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.78;
const RADIUS = WHEEL_SIZE / 2;

const REWARDS = ['50 PTS', '100 PTS', '20 PTS', '500 PTS', '10 PTS', '250 PTS', '5 PTS', '1000 PTS'];
const COLORS = {
  bgNavy: '#0F172A',
  cardNavy: '#182338',
  goldDark: '#B45309',
  goldLight: '#F59E0B',
  yellowAccent: '#FBBF24',
  textMuted: '#94A3B8',
  borderGrey: '#334155',
  disabledGrey: '#475569',
};

export default function RouletteScreen() {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [countdownText, setCountdownText] = useState('24h 00m 00s');
  
  const spinValue = useRef(new Animated.Value(0)).current;

  // Vérifier au démarrage si l'utilisateur a déjà joué il y a moins de 24h
  useEffect(() => {
    checkLockStatus();
  }, []);

  // Intervalle pour mettre à jour le compte à rebours chaque seconde
  useEffect(() => {
    let interval: number;
    
    if (isLocked) {
      interval = setInterval(async () => {
        const lastSpinStr = await AsyncStorage.getItem('last_spin_time');
        if (lastSpinStr) {
          const lastSpin = parseInt(lastSpinStr, 10);
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          const timeLeft = (lastSpin + twentyFourHours) - now;

          if (timeLeft <= 0) {
            setIsLocked(false);
            setWinner(null);
            await AsyncStorage.removeItem('last_spin_time');
            clearInterval(interval);
          } else {
            // Formater le temps restant en hh mm ss
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            const hStr = hours.toString().padStart(2, '0');
            const mStr = minutes.toString().padStart(2, '0');
            const sStr = seconds.toString().padStart(2, '0');

            setCountdownText(`${hStr}h ${mStr}m ${sStr}s`);
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isLocked]);

  const checkLockStatus = async () => {
    const lastSpinStr = await AsyncStorage.getItem('last_spin_time');
    if (lastSpinStr) {
      const lastSpin = parseInt(lastSpinStr, 10);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - lastSpin < twentyFourHours) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
        await AsyncStorage.removeItem('last_spin_time');
      }
    }
  };

  const renderSegments = () => {
    const anglePerSegment = 360 / 8;
    return REWARDS.map((reward, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      const radStart = (Math.PI * (startAngle - 90)) / 180;
      const radEnd = (Math.PI * (endAngle - 90)) / 180;

      const x1 = RADIUS + RADIUS * Math.cos(radStart);
      const y1 = RADIUS + RADIUS * Math.sin(radStart);
      const x2 = RADIUS + RADIUS * Math.cos(radEnd);
      const y2 = RADIUS + RADIUS * Math.sin(radEnd);

      const d = `M ${RADIUS} ${RADIUS} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;
      const fill = index % 2 === 0 ? COLORS.goldLight : COLORS.yellowAccent;
      const textAngle = startAngle + anglePerSegment / 2;

      return (
        <G key={index}>
          <Path d={d} fill={fill} stroke="#FFF" strokeWidth={1} />
          <G transform={`rotate(${textAngle}, ${RADIUS}, ${RADIUS})`}>
            <SvgText
              x={RADIUS}
              y={RADIUS - RADIUS * 0.65}
              fill={COLORS.bgNavy}
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {reward}
            </SvgText>
          </G>
        </G>
      );
    });
  };

  const handleSpin = () => {
    // Si l'animation tourne déjà OU si le délai de 24h n'est pas passé, on bloque le clic
    if (spinning || isLocked) return;

    setSpinning(true);
    setWinner(null);

    const randomIndex = Math.floor(Math.random() * 8);
    const segmentAngle = 360 / 8;
    const targetAngle = 360 * 5 + (360 - (randomIndex * segmentAngle));

    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: targetAngle,
      duration: 4500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(async () => {
      setSpinning(false);
      setWinner(REWARDS[randomIndex]);
      
      // Sauvegarder le timestamp exact de ce lancer réussi
      const now = Date.now();
      await AsyncStorage.setItem('last_spin_time', now.toString());
      setIsLocked(true); // Verrouiller pour les prochaines 24h
    });
  };

  const spinInterpolation = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />

      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />

      {/* ── HEADER ──────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>TAOO PREMIUM</Text>
        <Text style={styles.headerTitle}>GAGNEZ{'\n'}DES POINTS TAOO</Text>
      </View>

      {/* ── SECTION ROULETTE ─────────────────────── */}
      <View style={styles.rouletteContainer}>
        <View style={styles.pointerContainer}>
          <Ionicons name="triangle" size={32} color={COLORS.goldLight} style={styles.pointerIcon} />
        </View>

        <View style={styles.metallicBorder}>
          <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
              <G>{renderSegments()}</G>
            </Svg>
          </Animated.View>

          {/* Bouton Central Désactivé si déjà joué ou en cours */}
          <TouchableOpacity 
            style={[styles.centerButton, (spinning || isLocked) && styles.centerButtonDisabled]} 
            onPress={handleSpin}
            disabled={spinning || isLocked}
            activeOpacity={0.9}
          >
            <View style={styles.centerButtonInner}>
              <Text style={styles.centerButtonText}>{isLocked ? 'WAIT' : 'GO'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {winner && (
          <View style={styles.winnerToast}>
            <Text style={styles.winnerToastText}>Félicitations ! +{winner}</Text>
          </View>
        )}
      </View>

      {/* ── BARRE COMPTE À REBOURS DYNAMIQUE ─────── */}
      {isLocked && (
        <View style={styles.countdownBar}>
          <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
          <Text style={styles.countdownText}>Prochain lancer dans : {countdownText}</Text>
        </View>
      )}

      {/* ── STEPPER DE PROGRESSION ───────────────── */}
      <View style={styles.stepperContainer}>
        <Text style={styles.sectionTitle}>Votre progression de la semaine</Text>
        <View style={styles.stepperRow}>
          <View style={styles.progressLine} />
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View 
              key={step} 
              style={[
                styles.stepCircle, 
                step === 1 ? styles.stepCircleActive : styles.stepCircleInactive
              ]}
            >
              <Text style={[styles.stepText, step === 1 && styles.stepTextActive]}>{step}</Text>
            </View>
          ))}
          <View style={styles.giftStepCircle}>
            <Ionicons name="gift" size={18} color={COLORS.goldLight} />
          </View>
        </View>
      </View>

      {/* ── REWARD CARDS H-SCROLL ────────────────── */}
      <View style={styles.rewardsSection}>
        <Text style={styles.sectionTitle}>Cadeaux disponibles à débloquer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
          
          <View style={styles.rewardCard}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="phone-portrait-outline" size={40} color={COLORS.textMuted} />
            </View>
            <Text style={styles.cardBrand}>Cadeau de TAOO</Text>
            <Text style={styles.cardTitle}>IPHONE 12 64 GO</Text>
            <TouchableOpacity style={styles.pointsButton}>
              <Text style={styles.pointsButtonText}>500 PTS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rewardCard}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="hardware-chip-outline" size={40} color={COLORS.textMuted} />
            </View>
            <Text style={styles.cardBrand}>Cadeau de TAOO</Text>
            <Text style={styles.cardTitle}>MI ROBOT VACUUM</Text>
            <TouchableOpacity style={styles.pointsButton}>
              <Text style={styles.pointsButtonText}>350 PTS</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* ── GRAND PRIX SECTION ───────────────────── */}
      <View style={styles.grandPrixCard}>
        <Ionicons name="gift" size={32} color={COLORS.goldLight} style={styles.gpIconLeft} />
        <View style={styles.grandPrixContent}>
          <Text style={styles.grandPrixTitle}>GRAND PRIX</Text>
          <Text style={styles.grandPrixDesc}>
            Tournez la roulette 7 jours successifs pour débloquer le grand prix secret.
          </Text>
        </View>
        <Ionicons name="trophy" size={32} color={COLORS.goldLight} style={styles.gpIconRight} />
      </View>

      {/* ── FOOTER ACTIONS ───────────────────────── */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={[styles.lockedButton, !isLocked && { backgroundColor: COLORS.goldLight }]} disabled={isLocked}>
          <Ionicons name={isLocked ? "lock-closed" : "checkmark-circle"} size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.lockedButtonText}>{isLocked ? "Plus que 6 jours" : "Disponible !"}</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomTimerBar}>
          <Text style={styles.bottomTimerText}>
            {isLocked ? "Prochaine tentative disponible demain" : "Tentez votre chance maintenant !"}
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgNavy,
  },
  decoCircle1: {
    position: 'absolute',
    top: -50, left: -50,
    width: 180, height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
  },
  decoCircle2: {
    position: 'absolute',
    top: 250, right: -60,
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(245, 158, 11, 0.02)',
  },
  header: {
    alignItems: 'center',
    marginTop: 65,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.goldLight,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 36,
  },
  rouletteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  metallicBorder: {
    width: WHEEL_SIZE + 20,
    height: WHEEL_SIZE + 20,
    borderRadius: (WHEEL_SIZE + 20) / 2,
    backgroundColor: '#E2E8F0',
    borderWidth: 4,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  pointerContainer: {
    position: 'absolute',
    top: -6,
    right: width * 0.16,
    zIndex: 99,
  },
  pointerIcon: {
    transform: [{ rotate: '210deg' }],
  },
  centerButton: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  centerButtonDisabled: {
    opacity: 0.8,
  },
  centerButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.bgNavy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.goldLight,
  },
  centerButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  winnerToast: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
  },
  winnerToastText: {
    color: COLORS.bgNavy,
    fontWeight: '800',
    fontSize: 14,
  },
  countdownBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    marginHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  countdownText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  stepperContainer: {
    marginTop: 35,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
    paddingVertical: 10,
  },
  progressLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: COLORS.borderGrey,
    zIndex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2,
  },
  stepCircleActive: {
    backgroundColor: COLORS.goldLight,
    borderColor: COLORS.yellowAccent,
  },
  stepCircleInactive: {
    backgroundColor: COLORS.cardNavy,
    borderColor: COLORS.borderGrey,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepTextActive: {
    color: COLORS.bgNavy,
  },
  giftStepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardNavy,
    borderWidth: 2,
    borderColor: COLORS.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  rewardsSection: {
    marginTop: 35,
  },
  cardsScroll: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  rewardCard: {
    width: width * 0.42,
    backgroundColor: COLORS.cardNavy,
    borderRadius: 16,
    padding: 14,
    marginRight: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  imagePlaceholder: {
    width: '100%',
    height: 95,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardBrand: {
    fontSize: 10,
    color: COLORS.goldLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    minHeight: 36,
  },
  pointsButton: {
    backgroundColor: COLORS.goldLight,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  pointsButtonText: {
    color: COLORS.bgNavy,
    fontSize: 12,
    fontWeight: '800',
  },
  grandPrixCard: {
    marginHorizontal: 24,
    backgroundColor: COLORS.cardNavy,
    borderRadius: 20,
    padding: 20,
    marginTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.goldDark,
    position: 'relative',
    overflow: 'hidden',
  },
  grandPrixContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  grandPrixTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.goldLight,
    letterSpacing: 2,
    marginBottom: 6,
  },
  grandPrixDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  gpIconLeft: {
    opacity: 0.15,
    transform: [{ rotate: '-15deg' }],
  },
  gpIconRight: {
    opacity: 0.15,
    transform: [{ rotate: '15deg' }],
  },
  footerContainer: {
    marginTop: 35,
    marginBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  lockedButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.disabledGrey,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  lockedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomTimerBar: {
    marginTop: 14,
  },
  bottomTimerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});