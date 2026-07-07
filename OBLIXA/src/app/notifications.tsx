import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Animated
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// ── Types de notifications ───────────────────────
const NOTIFICATIONS = [
  {
    id: '1',
    type: 'offer',
    icon: '🎁',
    title: 'Nouvelle offre disponible !',
    message: 'Vision d\'Exception — -30% sur toute la collection de lunettes premium.',
    time: 'Il y a 2 min',
    read: false,
    color: '#F59E0B',
  },
  {
    id: '2',
    type: 'points',
    icon: '⭐',
    title: 'Points gagnés !',
    message: 'Vous avez gagné 80 points suite à votre dernière activation.',
    time: 'Il y a 1h',
    read: false,
    color: COLORS.primary,
  },
  {
    id: '3',
    type: 'expire',
    icon: '⏰',
    title: 'Offre bientôt expirée',
    message: 'Votre bon "Yoga à deux -50%" expire dans 3 jours. Utilisez-le vite !',
    time: 'Il y a 3h',
    read: false,
    color: COLORS.error,
  },
  {
    id: '4',
    type: 'welcome',
    icon: '👑',
    title: 'Bienvenue dans OBLIXA !',
    message: 'Votre compte est activé. Découvrez plus de 300 offres exclusives.',
    time: 'Hier',
    read: true,
    color: COLORS.primary,
  },
  {
    id: '5',
    type: 'level',
    icon: '🥈',
    title: 'Niveau Silver atteint !',
    message: 'Félicitations ! Vous avez atteint le niveau Silver. De nouveaux avantages vous attendent.',
    time: 'Hier',
    read: true,
    color: '#C0C0C0',
  },
  {
    id: '6',
    type: 'offer',
    icon: '🎟️',
    title: 'Coupon activé avec succès',
    message: 'Votre coupon "Pc sur mesure -5%" a été activé. Présentez-le en magasin.',
    time: 'Il y a 2 jours',
    read: true,
    color: '#6B0530',
  },
  {
    id: '7',
    type: 'promo',
    icon: '🔥',
    title: 'Offre flash — 24h seulement !',
    message: 'Dîner Romantique -40DT disponible pour 24h uniquement. Ne ratez pas cette opportunité !',
    time: 'Il y a 3 jours',
    read: true,
    color: '#9f1239',
  },
];

export default function NotificationsScreen() {

  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  // ── Marquer tout comme lu ────────────────────
  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ── Marquer une notif comme lue ──────────────
  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // ── Supprimer une notif ──────────────────────
  const deleteNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Header ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
  style={styles.backBtn}
  onPress={() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }}
>
  <Ionicons 
    name="arrow-back" 
    size={22} 
    color={COLORS.textPrimary} 
  />
</TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAllText}>Tout lire</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Non lues ─────────────────────────── */}
        {notifs.filter(n => !n.read).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOUVELLES</Text>
            {notifs.filter(n => !n.read).map(notif => (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, styles.notifCardUnread]}
                activeOpacity={0.8}
                onPress={() => markRead(notif.id)}
              >
                {/* Indicateur non lu */}
                <View style={styles.unreadDot} />

                {/* Icône */}
                <View style={[styles.notifIconBox, { backgroundColor: notif.color + '22' }]}>
                  <Text style={styles.notifIcon}>{notif.icon}</Text>
                </View>

                {/* Contenu */}
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifMessage} numberOfLines={2}>
                    {notif.message}
                  </Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>

                {/* Supprimer */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteNotif(notif.id)}
                >
                  <Ionicons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Lues ─────────────────────────────── */}
        {notifs.filter(n => n.read).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRÉCÉDENTES</Text>
            {notifs.filter(n => n.read).map(notif => (
              <TouchableOpacity
                key={notif.id}
                style={styles.notifCard}
                activeOpacity={0.8}
              >
                {/* Icône */}
                <View style={[styles.notifIconBox, { backgroundColor: notif.color + '15' }]}>
                  <Text style={styles.notifIcon}>{notif.icon}</Text>
                </View>

                {/* Contenu */}
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, styles.notifTitleRead]}>
                    {notif.title}
                  </Text>
                  <Text style={styles.notifMessage} numberOfLines={2}>
                    {notif.message}
                  </Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>

                {/* Supprimer */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteNotif(notif.id)}
                >
                  <Ionicons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Empty state ──────────────────────── */}
        {notifs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyDesc}>
              Vous serez notifié des nouvelles offres et de vos points
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  markAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  scrollContent: {
    paddingBottom: 100,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 4,
  },

  // Notif card
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    position: 'relative',
  },
  notifCardUnread: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  // Unread dot
  unreadDot: {
    position: 'absolute',
    top: 16,
    left: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  // Icon
  notifIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifIcon: {
    fontSize: 22,
  },

  // Content
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  notifTitleRead: {
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  notifMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Delete
  deleteBtn: {
    padding: 4,
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});