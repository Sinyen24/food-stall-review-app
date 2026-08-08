import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { reviewsAPI } from '../api/apiService';
import { useTheme } from '../theme/useTheme';

// ─── Storage Key ──────────────────────────────────────────────────────────────
const SESSION_KEY = '@foodstall_session';

// ─── Menu Row ─────────────────────────────────────────────────────────────────
const MenuRow = ({ icon, label, value, color, onPress, danger = false }) => {
  const { colors } = useTheme();

  const menuStyles = StyleSheet.create({
    menuRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    },
    menuIconBox: {
      width: 34, height: 34, borderRadius: 10,
      backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center',
    },
    menuIconBoxDanger: { backgroundColor: colors.status.errorLight },
    menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text.primary },
    menuLabelDanger: { color: colors.status.error },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    menuValue: { fontSize: 13, color: colors.text.quaternary, fontWeight: '500' },
  });

  return (
    <TouchableOpacity
      style={menuStyles.menuRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[menuStyles.menuIconBox, danger ? menuStyles.menuIconBoxDanger : null]}>
        <Icon name={icon} size={18} color={danger ? colors.status.error : (color || colors.text.primary)} />
      </View>
      <Text style={[menuStyles.menuLabel, danger && menuStyles.menuLabelDanger]}>{label}</Text>
      <View style={menuStyles.menuRight}>
        {value ? <Text style={menuStyles.menuValue}>{value}</Text> : null}
        {onPress ? <Icon name="chevron-forward" size={16} color={colors.text.disabled} /> : null}
      </View>
    </TouchableOpacity>
  );
};

// ─── ProfileScreen ────────────────────────────────────────────────────────────
const ProfileScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [user, setUser]             = useState(null);
  const [reviewCount, setCount]     = useState(0);
  const [avgRating, setAvgRating]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Load profile on focus ───────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => { loadProfile(); }, [])
  );

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Session now stores the full user object {id, name, email, role}
      const raw     = await AsyncStorage.getItem(SESSION_KEY);
      const session = raw ? JSON.parse(raw) : null;
      setUser(session ?? { name: 'Guest User', email: '—', role: 'user' });

      if (session?.id) {
        const reviews = await reviewsAPI.getAll({ userId: session.id });
        setCount(reviews.length);
        if (reviews.length > 0) {
          const avg = reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length;
          setAvgRating(avg.toFixed(1));
        } else {
          setAvgRating(null);
        }
      }
    } catch {
      setUser({ name: 'Guest User', email: '—', role: 'user' });
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await AsyncStorage.removeItem(SESSION_KEY);
              navigation.replace('Login');
            } catch {
              Alert.alert('Error', 'Could not log out. Please try again.');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  // ── Avatar initials ─────────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { paddingBottom: 40 },

    hero: {
      backgroundColor: colors.primary, paddingTop: 40, paddingBottom: 32,
      alignItems: 'center', paddingHorizontal: 24,
    },
    avatarRing: {
      width: 90, height: 90, borderRadius: 45,
      borderWidth: 3, borderColor: colors.overlay,
      justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.overlay,
      justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
    userName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 5 },
    emailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    roleBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12,
      backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    },
    roleBadgeAdmin: { backgroundColor: colors.badgeAdmin },
    roleBadgeUser: { backgroundColor: colors.surface },
    roleText: { fontSize: 11, fontWeight: '600', color: colors.primary },
    roleTextAdmin: { color: colors.primaryDark },

    statsRow: {
      flexDirection: 'row', backgroundColor: colors.surface,
      marginHorizontal: 16, marginTop: -1, borderRadius: 16, padding: 16,
      elevation: 4, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, marginBottom: 24,
    },
    statCard: { flex: 1, alignItems: 'center', gap: 5 },
    statValue: { fontSize: 17, fontWeight: '800', color: colors.text.primary },
    statLabel: { fontSize: 11, color: colors.text.quaternary },
    statDivider: { width: 1, backgroundColor: colors.divider, marginVertical: 4 },

    sectionTitle: {
      fontSize: 12, fontWeight: '700', color: colors.text.quaternary,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 8, marginTop: 4,
    },
    card: {
      backgroundColor: colors.surface, borderRadius: 16,
      marginHorizontal: 16, marginBottom: 16,
      elevation: 3, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, overflow: 'hidden',
    },

    rowDivider: { height: 1, backgroundColor: colors.divider, marginLeft: 62 },

    logoutButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      marginHorizontal: 16, marginTop: 4, marginBottom: 16,
      height: 52, borderRadius: 14, borderWidth: 1.5,
      borderColor: colors.status.error, backgroundColor: colors.status.errorLight,
    },
    logoutDisabled: { opacity: 0.6 },
    logoutText: { fontSize: 15, fontWeight: '700', color: colors.status.error },

    footer: { textAlign: 'center', fontSize: 11, color: colors.text.disabled, marginBottom: 8 },
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Profile Hero ── */}
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Guest User'}</Text>
          <View style={styles.emailRow}>
            <Icon name="mail-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
          </View>
          {/* Role badge */}
          <View style={[styles.roleBadge, user?.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
            <Icon name={user?.role === 'admin' ? 'shield-checkmark-outline' : 'person-outline'} size={11} color={user?.role === 'admin' ? colors.primaryDark : colors.primary} />
            <Text style={[styles.roleText, user?.role === 'admin' ? styles.roleTextAdmin : null]}>
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </Text>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="chatbubble-outline" size={20} color={colors.status.info} />
            <Text style={styles.statValue}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Icon name="star-outline" size={20} color={colors.status.warning} />
            <Text style={styles.statValue}>{avgRating ?? '—'}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Icon name="trophy-outline" size={20} color={colors.status.success} />
            <Text style={styles.statValue}>
              {reviewCount >= 10 ? 'Pro' : reviewCount >= 5 ? 'Active' : 'New'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        {/* ── Account Section ── */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <MenuRow icon="person-outline"           label="Full Name" value={user?.name}  color={colors.status.info} />
          <View style={styles.rowDivider} />
          <MenuRow icon="mail-outline"             label="Email"     value={user?.email} color={colors.status.success} />
          <View style={styles.rowDivider} />
          <MenuRow icon="shield-checkmark-outline" label="Role"      value={user?.role}  color={colors.primaryDark} />
        </View>

        {/* ── Reviews Section ── */}
        <Text style={styles.sectionTitle}>My Reviews</Text>
        <View style={styles.card}>
          <MenuRow
            icon="star-outline"
            label="View All Reviews"
            color={colors.status.warning}
            onPress={() => navigation.navigate('MyReviews')}
          />
        </View>

        {/* ── App Section ── */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.card}>
          <MenuRow icon="information-circle-outline" label="App Version" value="1.0.0"           color={colors.status.info} />
          <View style={styles.rowDivider} />
          <MenuRow icon="server-outline"             label="Data Source" value="FoodStall REST API" color={colors.status.success} />
          <View style={styles.rowDivider} />
          <MenuRow icon="phone-portrait-outline"     label="Session"     value="AsyncStorage"     color={colors.primaryDark} />
        </View>

        {/* ── Logout Button ── */}
        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.logoutDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.status.error} size="small" />
          ) : (
            <>
              <Icon name="log-out-outline" size={18} color={colors.status.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>Food Stall Review App · v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
