import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// ─── Theme Hook ───────────────────────────────────────────────────────────────
import { useTheme } from '../theme/useTheme';

// ─── Star Row ─────────────────────────────────────────────────────────────────
const StarRow = ({ rating = 0, size = 13 }) => {
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
            color={filled || partial ? colors.status.warning : colors.border}
            style={{ marginRight: 1 }}
          />
        );
      })}
    </View>
  );
};

// ─── Rating colour helper ──────────────────────────────────────────────────────
// Accepts colors from theme so ratings adapt to palette
const getRatingColor = (r, colors) => {
  if (r >= 4.5) return colors.rating.excellent;
  if (r >= 3.5) return colors.rating.good;
  if (r >= 2.5) return colors.rating.okay;
  if (r >= 1.5) return colors.rating.poor;
  return colors.rating.terrible;
};

// ─── ReviewCard ───────────────────────────────────────────────────────────────
/**
 * Props:
 *   review    { id, author, rating, comment, createdAt, stallName? }
 *   onDelete  () => void   — called after user confirms deletion
 *   showStall boolean      — show stall name badge (used in MyReviewsScreen)
 */
const ReviewCard = ({ review = {}, onDelete, showStall = false }) => {
  const { colors } = useTheme();

  const {
    author    = 'Anonymous',
    rating    = 0,
    comment   = '',
    createdAt,
    stallName,
  } = review;

  const ratingNum   = parseFloat(rating);
  const ratingColor = getRatingColor(ratingNum, colors);
  const initial     = (author || 'A')[0].toUpperCase();

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  // ── Delete confirmation ─────────────────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to remove this review? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  // ─── Dynamic styles (inside component to access colors) ───────────────────
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 15,
      marginHorizontal: 16,
      marginBottom: 10,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      overflow: 'hidden',
    },

    // Top row
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF', // intentional: always white on the coloured avatar circle
    },
    authorBlock: {
      flex: 1,
      justifyContent: 'center',
    },
    authorName: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text.primary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginTop: 2,
    },
    dateText: {
      fontSize: 11,
      color: colors.text.secondary,
    },
    ratingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 9,
      paddingVertical: 4,
      gap: 3,
      flexShrink: 0,
    },
    ratingPillText: {
      fontSize: 12,
      fontWeight: '700',
    },
    deleteBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.status.errorLight,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },

    // Stars
    starsRow: {
      marginBottom: 8,
    },

    // Stall badge
    stallBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.badge,
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 3,
      marginBottom: 8,
      gap: 5,
    },
    stallBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
      maxWidth: 220,
    },

    // Comment
    comment: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    emptyComment: {
      fontSize: 12,
      color: colors.text.disabled,
      fontStyle: 'italic',
    },

    // Bottom accent
    bottomAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      justifyContent: 'center',
    },
    accentBar: {
      width: 4,
      height: '60%',
      borderRadius: 2,
    },
  });

  return (
    <View style={styles.card}>
      {/* ── Top Row ── */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: ratingColor }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Author + date */}
        <View style={styles.authorBlock}>
          <Text style={styles.authorName} numberOfLines={1}>{author}</Text>
          <View style={styles.metaRow}>
            <Icon name="calendar-outline" size={11} color={colors.text.secondary} />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        {/* Rating pill */}
        <View style={[styles.ratingPill, { backgroundColor: ratingColor + '18' }]}>
          <Icon name="star" size={11} color={ratingColor} />
          <Text style={[styles.ratingPillText, { color: ratingColor }]}>
            {ratingNum.toFixed(1)}
          </Text>
        </View>

        {/* Delete button */}
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="trash-outline" size={16} color={colors.status.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Stars ── */}
      <View style={styles.starsRow}>
        <StarRow rating={ratingNum} size={13} />
      </View>

      {/* ── Stall name badge (optional) ── */}
      {showStall && stallName ? (
        <View style={styles.stallBadge}>
          <Icon name="storefront-outline" size={11} color={colors.primary} />
          <Text style={styles.stallBadgeText} numberOfLines={1}>{stallName}</Text>
        </View>
      ) : null}

      {/* ── Comment ── */}
      {comment ? (
        <Text style={styles.comment}>{comment}</Text>
      ) : (
        <Text style={styles.emptyComment}>No comment left.</Text>
      )}

      {/* ── Bottom divider line ── */}
      <View style={styles.bottomAccent}>
        <View style={[styles.accentBar, { backgroundColor: ratingColor }]} />
      </View>
    </View>
  );
};

export default ReviewCard;
