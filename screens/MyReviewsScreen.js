import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ReviewCard from '../components/ReviewCard';
import { reviewsAPI } from '../api/apiService';
import { useTheme } from '../theme/useTheme';

// ─── Storage Key ──────────────────────────────────────────────────────────────
const SESSION_KEY = '@foodstall_session';

// ─── Summary Stat ─────────────────────────────────────────────────────────────
const SummaryPill = ({ icon, value, label, color }) => {
  const { colors } = useTheme();

  const summaryStyles = StyleSheet.create({
    pill: {
      flex: 1, alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: 14, paddingVertical: 14,
      elevation: 2, shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
    },
    value: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginTop: 5 },
    label: { fontSize: 11, color: colors.text.quaternary, marginTop: 2 },
  });

  return (
    <View style={summaryStyles.pill}>
      <Icon name={icon} size={20} color={color} />
      <Text style={summaryStyles.value}>{value}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
};

// ─── MyReviewsScreen ──────────────────────────────────────────────────────────
const MyReviewsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingBottom: 32 },

    pageHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16,
    },
    pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text.primary },
    pageSubtitle: { fontSize: 13, color: colors.text.quaternary, marginTop: 2 },
    clearBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: colors.status.errorLight, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    },
    clearBtnText: { fontSize: 12, fontWeight: '600', color: colors.status.error },

    summaryRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20 },

    sectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, marginBottom: 10,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
    sectionCount: { fontSize: 12, color: colors.text.quaternary },

    emptyState: { alignItems: 'center', paddingVertical: 52, paddingHorizontal: 32 },
    emptyIconCircle: {
      width: 90, height: 90, borderRadius: 45,
      backgroundColor: colors.badge, justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    },
    emptyEmoji: { fontSize: 42 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
    emptySubtitle: { fontSize: 13, color: colors.text.quaternary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    exploreBtn: {
      flexDirection: 'row', backgroundColor: colors.button.primary, borderRadius: 12,
      paddingHorizontal: 24, paddingVertical: 12, gap: 8,
      elevation: 3, shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
    },
    exploreBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  });

  // ── Load on focus ───────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [])
  );

  const loadReviews = async () => {
    setLoading(true);
    try {
      // Get session first
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      const s   = raw ? JSON.parse(raw) : null;
      setSession(s);

      if (!s?.id) {
        setReviews([]);
        return;
      }

      // Fetch reviews filtered by this user's ID
      const data = await reviewsAPI.getAll({ userId: s.id });
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete single ───────────────────────────────────────────────────────────
  const handleDelete = async (reviewId) => {
    try {
      await reviewsAPI.remove(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch {
      Alert.alert('Error', 'Could not delete review.');
    }
  };

  // ── Delete all (user's reviews only) ────────────────────────────────────────
  const handleClearAll = () => {
    if (reviews.length === 0) return;
    Alert.alert(
      'Clear All My Reviews',
      `This will permanently delete all ${reviews.length} of your review${reviews.length > 1 ? 's' : ''}. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(reviews.map(r => reviewsAPI.remove(r.id)));
              setReviews([]);
            } catch {
              Alert.alert('Error', 'Could not clear reviews.');
            }
          },
        },
      ]
    );
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length).toFixed(1)
    : '—';

  const topRated = reviews.length
    ? Math.max(...reviews.map(r => parseFloat(r.rating)))
    : 0;

  // ── List header ─────────────────────────────────────────────────────────────
  const ListHeader = (
    <View>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>My Reviews</Text>
          <Text style={styles.pageSubtitle}>All your food stall experiences</Text>
        </View>
        {reviews.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearAll}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="trash-outline" size={16} color={colors.status.error} />
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {reviews.length > 0 && (
        <View style={styles.summaryRow}>
          <SummaryPill icon="chatbubble-outline" value={reviews.length} label="Reviews"    color={colors.status.info} />
          <View style={{ width: 10 }} />
          <SummaryPill icon="star-outline"       value={avgRating}      label="Avg Rating" color={colors.status.warning} />
          <View style={{ width: 10 }} />
          <SummaryPill icon="trophy-outline"     value={topRated > 0 ? `${topRated}.0` : '—'} label="Best" color={colors.status.success} />
        </View>
      )}

      {reviews.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Review History</Text>
          <Text style={styles.sectionCount}>{reviews.length} total</Text>
        </View>
      )}

      {loading && (
        <ActivityIndicator color={colors.primary} size="small" style={{ marginVertical: 30 }} />
      )}
    </View>
  );

  // ── Empty state ─────────────────────────────────────────────────────────────
  const ListEmpty = !loading ? (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Text style={styles.emptyEmoji}>📝</Text>
      </View>
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring food stalls and share your thoughts!
      </Text>
      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.85}
      >
        <Icon name="compass-outline" size={16} color="#FFFFFF" />
        <Text style={styles.exploreBtnText}>Explore Stalls</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <FlatList
        data={loading ? [] : reviews}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            showStall={true}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MyReviewsScreen;
