import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { reviewsAPI } from '../api/apiService';
import socket from '../api/socket';
import { useTheme } from '../theme/useTheme';

// ─── Storage Key ──────────────────────────────────────────────────────────────
const SESSION_KEY = '@foodstall_session';

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0, size = 14 }) => {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled  = i <= Math.floor(rating);
        const partial = !filled && i === Math.ceil(rating) && rating % 1 >= 0.5;
        return (
          <Icon
            key={i}
            name={filled ? 'star' : partial ? 'star-half' : 'star-outline'}
            size={size}
            color={filled || partial ? colors.status.warning : colors.text.disabled}
            style={{ marginRight: 1 }}
          />
        );
      })}
    </View>
  );
};

// ─── Review Card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review, onDelete }) => {
  const { colors } = useTheme();
  const date = new Date(review.createdAt).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const reviewStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface, borderRadius: 14, padding: 14,
      marginHorizontal: 16, marginBottom: 10,
      elevation: 3, shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    avatar: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    avatarText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    authorBlock: { flex: 1 },
    authorName: { fontSize: 13, fontWeight: '700', color: colors.text.primary },
    reviewDate: { fontSize: 11, color: colors.text.quaternary, marginTop: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ratingPill: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.badge, borderRadius: 20,
      paddingHorizontal: 8, paddingVertical: 3, gap: 3,
    },
    ratingPillText: { fontSize: 11, fontWeight: '700', color: colors.status.warning },
    deleteBtn: { padding: 4 },
    starsRow: { marginBottom: 8 },
    comment: { fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
    noComment: { fontSize: 12, color: colors.text.disabled, fontStyle: 'italic' },
  });

  return (
    <View style={reviewStyles.card}>
      <View style={reviewStyles.header}>
        <View style={reviewStyles.avatar}>
          <Text style={reviewStyles.avatarText}>{(review.author || 'A')[0].toUpperCase()}</Text>
        </View>
        <View style={reviewStyles.authorBlock}>
          <Text style={reviewStyles.authorName}>{review.author || 'Anonymous'}</Text>
          <Text style={reviewStyles.reviewDate}>{date}</Text>
        </View>
        <View style={reviewStyles.headerRight}>
          <View style={reviewStyles.ratingPill}>
            <Icon name="star" size={11} color={colors.status.warning} />
            <Text style={reviewStyles.ratingPillText}>{parseFloat(review.rating).toFixed(1)}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity
              style={reviewStyles.deleteBtn}
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="trash-outline" size={15} color={colors.status.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={reviewStyles.starsRow}>
        <StarRating rating={review.rating} size={13} />
      </View>
      {review.comment ? (
        <Text style={reviewStyles.comment}>{review.comment}</Text>
      ) : (
        <Text style={reviewStyles.noComment}>No comment left.</Text>
      )}
    </View>
  );
};

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill = ({ icon, label, value, color }) => {
  const { colors } = useTheme();

  const statStyles = StyleSheet.create({
    pill: {
      flex: 1, alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: 14, paddingVertical: 12,
      elevation: 2, shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
    },
    pillValue: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginTop: 4 },
    pillLabel: { fontSize: 11, color: colors.text.quaternary, marginTop: 2 },
  });

  return (
    <View style={statStyles.pill}>
      <Icon name={icon} size={18} color={color || colors.primary} />
      <Text style={statStyles.pillValue}>{value}</Text>
      <Text style={statStyles.pillLabel}>{label}</Text>
    </View>
  );
};

// ─── StallDetailScreen ────────────────────────────────────────────────────────
const StallDetailScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { stallId, stall: initialStall } = route.params ?? {};

  const [stall]               = useState(initialStall ?? null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 15, color: colors.text.quaternary },
    listContent: { paddingBottom: 100 },

    backButton: {
      position: 'absolute', top: 16, left: 16, zIndex: 10,
      width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface,
      justifyContent: 'center', alignItems: 'center',
      elevation: 4, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },

    heroPlaceholder: { height: 200, backgroundColor: colors.badge, justifyContent: 'center', alignItems: 'center' },
    heroEmoji: { fontSize: 72 },
    heroBadge: {
      position: 'absolute', bottom: 14, right: 14,
      flexDirection: 'row', alignItems: 'center',
      borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, gap: 5,
    },
    openBadge: { backgroundColor: colors.status.successLight },
    closedBadge: { backgroundColor: colors.status.errorLight },
    heroDot: { width: 7, height: 7, borderRadius: 3.5 },
    openDot: { backgroundColor: colors.status.success },
    closedDot: { backgroundColor: colors.status.error },
    heroBadgeText: { fontSize: 12, fontWeight: '700' },
    openText: { color: colors.status.success },
    closedText: { color: colors.status.error },

    infoCard: {
      backgroundColor: colors.surface, borderRadius: 20,
      marginHorizontal: 16, marginTop: -20, padding: 18,
      elevation: 6, shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 10, marginBottom: 12,
    },
    infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    infoTitleBlock: { flex: 1, marginRight: 12 },
    stallName: { fontSize: 19, fontWeight: '800', color: colors.text.primary, marginBottom: 6, lineHeight: 24 },
    cuisineRow: { flexDirection: 'row' },
    cuisineTag: { backgroundColor: colors.badge, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
    cuisineText: { fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'capitalize' },
    ratingBlock: { alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 10, minWidth: 64 },
    ratingValue: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginBottom: 4 },
    description: { fontSize: 13, color: colors.text.secondary, lineHeight: 20, marginBottom: 12 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    locationText: { fontSize: 13, color: colors.text.tertiary },

    statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20 },
    statSpacer: { width: 10 },

    sectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, marginBottom: 12,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
    sectionCount: { fontSize: 12, color: colors.text.quaternary, fontWeight: '500' },

    emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 44, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 6 },
    emptySubtitle: { fontSize: 13, color: colors.text.quaternary, textAlign: 'center', lineHeight: 20 },

    fab: {
      position: 'absolute', bottom: 24, right: 20, left: 20,
      flexDirection: 'row', backgroundColor: colors.button.primary,
      borderRadius: 16, height: 54, justifyContent: 'center', alignItems: 'center',
      elevation: 8, shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, gap: 8,
    },
    fabText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  });

  // ── Load session ────────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then(raw => {
      if (raw) setSession(JSON.parse(raw));
    });
  }, []);

  // ── Load reviews from API ───────────────────────────────────────────────────
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewsAPI.getAll({ stallId });
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [stallId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  // Re-load when coming back from AddReviewScreen (fallback for lost connections)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadReviews);
    return unsubscribe;
  }, [navigation, loadReviews]);

  // ── Socket.IO — real-time review updates ────────────────────────────────────
  const stallIdStr = stallId ? stallId.toString() : '';
  useEffect(() => {
    // New review submitted by any user
    const onReviewAdded = ({ stallId: sid, review }) => {
      if (sid === stallIdStr) {
        setReviews(prev => {
          // Avoid duplicates (in case loadReviews and socket both fire)
          if (prev.some(r => r.id === review.id)) return prev;
          return [review, ...prev];
        });
      }
    };

    // Review deleted by any user
    const onReviewDeleted = ({ stallId: sid, reviewId }) => {
      if (sid === stallIdStr) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    };

    socket.on('reviewAdded',   onReviewAdded);
    socket.on('reviewDeleted', onReviewDeleted);

    return () => {
      socket.off('reviewAdded',   onReviewAdded);
      socket.off('reviewDeleted', onReviewDeleted);
    };
  }, [stallIdStr]);

  // ── Delete review ───────────────────────────────────────────────────────────
  const handleDelete = useCallback((reviewId) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reviewsAPI.remove(reviewId);
              loadReviews();
            } catch {
              Alert.alert('Error', 'Could not delete review.');
            }
          },
        },
      ]
    );
  }, [loadReviews]);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length).toFixed(1)
    : stall?.avgRating != null ? parseFloat(stall.avgRating).toFixed(1) : '0.0';

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!stall) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Stall not found.</Text>
      </View>
    );
  }

  const CUISINE_EMOJI = {
    chinese: '🥢', malay: '🍛', indian: '🫓', western: '🍔',
    japanese: '🍣', korean: '🍜', thai: '🌶️', dessert: '🍨',
    seafood: '🦐', mixed: '🍽️',
  };
  const emoji = CUISINE_EMOJI[stall.cuisine?.toLowerCase()] ?? '🍽️';

  // ── List Header ─────────────────────────────────────────────────────────────
  const ListHeader = (
    <View>
      {/* ── Hero Image Placeholder ── */}
      <View style={styles.heroPlaceholder}>
        <Text style={styles.heroEmoji}>{emoji}</Text>
        {typeof stall.isOpen === 'boolean' && (
          <View style={[styles.heroBadge, stall.isOpen ? styles.openBadge : styles.closedBadge]}>
            <View style={[styles.heroDot, stall.isOpen ? styles.openDot : styles.closedDot]} />
            <Text style={[styles.heroBadgeText, stall.isOpen ? styles.openText : styles.closedText]}>
              {stall.isOpen ? 'Open Now' : 'Closed'}
            </Text>
          </View>
        )}
      </View>

      {/* ── Info Card ── */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.infoTitleBlock}>
            <Text style={styles.stallName}>{stall.name}</Text>
            <View style={styles.cuisineRow}>
              <View style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>{stall.cuisine}</Text>
              </View>
            </View>
          </View>
          <View style={styles.ratingBlock}>
            <Text style={styles.ratingValue}>{avgRating}</Text>
            <StarRating rating={parseFloat(avgRating)} size={13} />
          </View>
        </View>
        {stall.description ? <Text style={styles.description}>{stall.description}</Text> : null}
        {stall.location ? (
          <View style={styles.locationRow}>
            <Icon name="location-outline" size={14} color={colors.primary} />
            <Text style={styles.locationText}>{stall.location}</Text>
          </View>
        ) : null}
      </View>

      {/* ── Stat Pills ── */}
      <View style={styles.statsRow}>
        <StatPill icon="star"             label="Avg Rating" value={avgRating}                                   color={colors.status.warning} />
        <View style={styles.statSpacer} />
        <StatPill icon="chatbubble-outline" label="Reviews"  value={reviews.length}                              color={colors.status.info} />
        <View style={styles.statSpacer} />
        <StatPill icon="ribbon-outline"   label="Top Pick"   value={parseFloat(avgRating) >= 4.5 ? 'Yes' : 'No'} color={colors.status.success} />
      </View>

      {/* ── Reviews Header ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💬 Reviews</Text>
        <Text style={styles.sectionCount}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</Text>
      </View>

      {loading && <ActivityIndicator color={colors.primary} size="small" style={{ marginVertical: 20 }} />}
    </View>
  );

  const ListEmpty = !loading ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📝</Text>
      <Text style={styles.emptyTitle}>No reviews yet</Text>
      <Text style={styles.emptySubtitle}>Be the first to review this stall!</Text>
    </View>
  ) : null;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* ── Back Button ── */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="arrow-back" size={22} color={colors.text.primary} />
      </TouchableOpacity>

      <FlatList
        data={reviews}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            onDelete={
              session && (session.role === 'admin' || session.id === item.userId)
                ? () => handleDelete(item.id)
                : undefined
            }
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* ── FAB: Add Review ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddReview', { stallId, stallName: stall.name })}
        activeOpacity={0.88}
      >
        <Icon name="add" size={22} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Review</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StallDetailScreen;
