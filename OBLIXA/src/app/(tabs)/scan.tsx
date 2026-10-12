import { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.7;

const API_URL = 'http://192.168.1.185:5000/api';

interface ScanResponse {
  success: boolean;
  message: string;
  pointsGagnes?: number;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const lastScanRef = useRef<string | null>(null);

  // ── Réactive la caméra à chaque fois qu'on revient sur l'onglet ──
  useFocusEffect(
    useCallback(() => {
      setCameraActive(true);
      setScanned(false);
      lastScanRef.current = null;
      return () => setCameraActive(false);
    }, [])
  );

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    // Évite les scans multiples du même code / pendant le traitement
    if (scanned || processing || result.data === lastScanRef.current) return;

    lastScanRef.current = result.data;
    setScanned(true);
    setProcessing(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/loyalty/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrCode: result.data }),
      });

      const data: ScanResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'QR code invalide');
      }

      Alert.alert(
        '🎉 Points ajoutés !',
        `Tu as gagné ${data.pointsGagnes} points en scannant ce QR code.`,
        [
          {
            text: 'Scanner un autre',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
              lastScanRef.current = null;
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Erreur',
        err instanceof Error ? err.message : 'Impossible de traiter ce QR code',
        [
          {
            text: 'Réessayer',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
              lastScanRef.current = null;
            },
          },
        ]
      );
    }
  };

  // ── Permission pas encore demandée ──
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ── Permission refusée ──
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Ionicons name="camera-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.permissionTitle}>Accès à la caméra requis</Text>
        <Text style={styles.permissionDesc}>
          Autorise l'accès à la caméra pour scanner les QR codes de nos partenaires et gagner des points.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {cameraActive && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
      )}

      {/* ── OVERLAY ── */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scanner un QR Code</Text>
          <Text style={styles.headerSubtitle}>
            Scanne le QR code chez nos partenaires pour gagner des points
          </Text>
        </View>

        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        <View style={styles.footer}>
          {processing ? (
            <View style={styles.processingBox}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.processingText}>Vérification en cours...</Text>
            </View>
          ) : (
            <Text style={styles.footerHint}>Positionne le QR code dans le cadre</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  permissionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 8 },
  permissionDesc: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  permissionBtnText: { color: '#0B1020', fontWeight: '700', fontSize: 14 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 70,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  frameContainer: { alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: COLORS.primary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  footer: {
    paddingBottom: 130,
    alignItems: 'center',
  },
  footerHint: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  processingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  processingText: { color: '#fff', fontWeight: '600' },
});