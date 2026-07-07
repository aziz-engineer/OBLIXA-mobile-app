import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOfferById } from './services/api';

interface Offre {
  _id: string;
  title: string;
  brand: string;
  category: string;
  discount: string;
  points: number;
  coupons: number;
  bgColor: string;
  imageUrl: string;
  logoUrl: string;
  description: string;
  conditions: string;
  duree: string;
  stock: number;
}

export default function OffreDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [offre, setOffre] = useState<Offre | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      const data = await getOfferById(id as string);
      if (data) setOffre(data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger l\'offre');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#ff2833" style={{ flex: 1 }} />;
  if (!offre) return <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>Offre introuvable</Text>;

  return (
    <ScrollView style={styles.container}>
     
      <View>
        <Image source={{ uri: offre.imageUrl }} style={styles.headerImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.discountBadge}>
          <Text style={styles.badgeText}>Bon de réduction {offre.discount}</Text>
        </View>
      </View>

      {/* content */}
      <View style={styles.content}>
        <Image source={{ uri: offre.logoUrl }} style={styles.logo} />
        <Text style={styles.title}>{offre.title}</Text>
        <Text style={styles.subtitle}>Offre Numéro {offre._id?.slice(-3) || '273'}</Text>

        
        <View style={styles.grid}>
          <View style={styles.gridItem}><Text style={styles.label}>Vous obtenez</Text><Text style={styles.value}>{offre.discount}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>Offre disponible pendant</Text><Text style={styles.value}>{offre.duree}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>Quantité en stock</Text><Text style={styles.value}>{offre.stock} en stock</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>Validité du bon</Text><Text style={styles.value}>7 Jours</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.text}>{offre.description}</Text>
        
        <Text style={styles.sectionTitle}>Conditions de réduction</Text>
        <Text style={styles.text}>{offre.conditions}</Text>
      </View>

     
      <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Succès", "Service activé !")}>
        <Text style={styles.buttonText}>Activer le service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  headerImage: { width: '100%', height: 250 },
  backButton: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
  discountBadge: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#ff2833', padding: 8, borderRadius: 8 },
  badgeText: { fontWeight: 'bold', color: '#000' },
  content: { padding: 20 },
  logo: { width: 60, height: 60, alignSelf: 'center', marginBottom: 10, borderRadius: 30 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#aaa', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', backgroundColor: '#161d31', padding: 15, borderRadius: 10, marginBottom: 10 },
  label: { color: '#aaa', fontSize: 12 },
  value: { color: '#fff', fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 5 },
  text: { color: '#ccc', lineHeight: 22 },
  actionButton: { backgroundColor: '#ff2833', margin: 20, padding: 20, borderRadius: 15, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 18, color: '#000' }
});