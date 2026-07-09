import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, Modal, TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';

const API_URL = 'http://192.168.1.185:5000/api'; 

interface Produit {
  _id: string;
  title: string;
  brand?: string;
  category: string;
  pointsCost: number;
  images?: string[];
  stock: number | null;
}

export default function ProduitsScreen() {
  const [points, setPoints] = useState(0);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Produit | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [address, setAddress] = useState({ fullName: '', phone: '', address: '', city: '' });

  const loadData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const [pointsRes, produitsRes] = await Promise.all([
        fetch(`${API_URL}/loyalty/points`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/produits`),
      ]);
      const pointsData = await pointsRes.json();
      const produitsData = await produitsRes.json();
      setPoints(pointsData.points || 0);
      setProduits(produitsData.produits || []);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openRedeem = (produit: Produit) => {
    if (points < produit.pointsCost) {
      Alert.alert('Points insuffisants', `Il te manque ${produit.pointsCost - points} points.`);
      return;
    }
    setSelected(produit);
    setModalVisible(true);
  };

  const confirmRedeem = async () => {
    if (!selected) return;
    if (!address.fullName || !address.address || !address.phone) {
      Alert.alert('Champs manquants', 'Remplis nom, téléphone et adresse.');
      return;
    }
    setRedeeming(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/produits/${selected._id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shippingAddress: address }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');
      setModalVisible(false);
      setPoints(data.remainingPoints);
      Alert.alert('Succès ✅', `${selected.title} réservé !`);
      loadData();
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Mes points</Text>
        <Text style={styles.headerPoints}>{points} pts</Text>
      </View>

      <FlatList
        data={produits}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>Aucun cadeau disponible</Text>}
        renderItem={({ item }) => {
          const canAfford = points >= item.pointsCost;
          return (
            <TouchableOpacity style={[styles.card, !canAfford && styles.cardDisabled]} onPress={() => openRedeem(item)}>
              {item.images?.[0] ? (
                <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}><Text style={{ fontSize: 28 }}>🎁</Text></View>
              )}
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardBrand}>{item.brand || item.category}</Text>
              <Text style={styles.cardPoints}>{item.pointsCost} pts</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Échanger : {selected?.title}</Text>
            <Text style={styles.modalSubtitle}>Coût : {selected?.pointsCost} points</Text>
            <TextInput style={styles.input} placeholder="Nom complet" value={address.fullName} onChangeText={(t) => setAddress({ ...address, fullName: t })} />
            <TextInput style={styles.input} placeholder="Téléphone" keyboardType="phone-pad" value={address.phone} onChangeText={(t) => setAddress({ ...address, phone: t })} />
            <TextInput style={styles.input} placeholder="Adresse" value={address.address} onChangeText={(t) => setAddress({ ...address, address: t })} />
            <TextInput style={styles.input} placeholder="Ville" value={address.city} onChangeText={(t) => setAddress({ ...address, city: t })} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={redeeming}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmRedeem} disabled={redeeming}>
                {redeeming ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirmer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerLabel: { color: COLORS.textSecondary, fontSize: 13 },
  headerPoints: { color: COLORS.primary, fontSize: 28, fontWeight: 'bold' },
  list: { padding: 12, paddingBottom: 120 },
  row: { justifyContent: 'space-between' },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, width: '48%', marginBottom: 14 },
  cardDisabled: { opacity: 0.5 },
  cardImage: { width: '100%', height: 100, borderRadius: 10, marginBottom: 8 },
  cardImagePlaceholder: { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontWeight: '600', fontSize: 14, color: COLORS.textPrimary },
  cardBrand: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  cardPoints: { color: COLORS.primary, fontWeight: 'bold', marginTop: 6 },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  modalSubtitle: { color: COLORS.primary, fontWeight: '600', marginTop: 4, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginBottom: 10, color: COLORS.textPrimary },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, alignItems: 'center', marginRight: 8 },
  cancelBtnText: { color: COLORS.textMuted },
  confirmBtn: { flex: 1, backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginLeft: 8 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold' },
});