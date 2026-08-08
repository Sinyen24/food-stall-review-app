import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// ─── Theme Hook ───────────────────────────────────────────────────────────────
import { useTheme } from '../theme/useTheme';

// ─── Cuisine Icon Map ─────────────────────────────────────────────────────────
const CUISINE_EMOJI = {
  'chinese':    '🥢',
  'malay':      '🍛',
  'indian':     '🫓',
  'western':    '🍔',
  'japanese':   '🍣',
  'korean':     '🍜',
  'thai':       '🌶️',
  'italian':    '🍝',
  'seafood':    '🦐',
  'dessert':    '🍨',
  'beverages':  '🧋',
  'mixed':      '🍽️',
};

const getCuisineEmoji = (cuisine = '') =>
  CUISINE_EMOJI[cuisine.toLowerCase()] ?? '🍽️';

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0, size = 13 }) => {
  const { colors } = useTheme();
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={starStyles.row}>
      {stars.map(i => {
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

// Non-color styles for StarRating can stay outside (no dynamic colors)
const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

// ─── StallCard Component ──────────────────────────────────────────────────────

/**
 * StallCard
 *
 * Props:
 *   stall     {object}   – { id, name, cuisine, rating, reviewCount, location, isOpen }
 *   onPress   {function} – called when the card is tapped
 *   style     {object}   – optional extra style for the wrapper
 */
const StallCard = ({ stall = {}, onPress, style }) => {
  const { colors } = useTheme();

  const {
    name        = 'Unknown Stall',
    cuisine     = 'Mixed',
    avgRating,           // field name returned by REST API
    rating: rawRating = 0, // fallback for any caller that passes 'rating' directly
    reviewCount = 0,
    location    = '',
    isOpen,
  } = stall;

  // Prefer avgRating (API response) over rating (legacy/direct prop)
  const rating = avgRating ?? rawRating;

  const emoji        = getCuisineEmoji(cuisine);
  const ratingFixed  = parseFloat(rating).toFixed(1);
  const openDefined  = typeof isOpen === 'boolean';

  // ─── Dynamic styles (inside component to access colors) ───────────────────
  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      marginHorizontal: 16,
      marginVertical: 6,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },

    // Emoji badge
    emojiBadge: {
      width: 54,
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.badge,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      flexShrink: 0,
    },
    emojiText: {
      fontSize: 26,
    },

    // Info block
    info: {
      flex: 1,
      justifyContent: 'center',
    },
    stallName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
      letterSpacing: 0.1,
    },
    cuisineTag: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surfaceAlt,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginBottom: 6,
    },
    cuisineText: {
      fontSize: 11,
      color: colors.text.tertiary,
      fontWeight: '600',
      textTransform: 'capitalize',
    },

    // Rating
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    ratingValue: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.status.warning,
    },
    reviewCount: {
      fontSize: 11,
      color: colors.text.quaternary,
    },

    // Location
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    locationText: {
      fontSize: 11,
      color: colors.text.quaternary,
      flex: 1,
    },

    // Right column
    right: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 8,
      marginLeft: 8,
      flexShrink: 0,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
      gap: 4,
    },
    openBadge:   { backgroundColor: colors.status.successLight },
    closedBadge: { backgroundColor: colors.status.errorLight },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    openDot:   { backgroundColor: colors.status.success },
    closedDot: { backgroundColor: colors.status.error },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
    },
    openText:   { color: colors.status.success },
    closedText: { color: colors.status.error },
    chevron: {
      marginTop: 2,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* ── Left: Cuisine Badge ── */}
      <View style={styles.emojiBadge}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </View>

      {/* ── Middle: Info ── */}
      <View style={styles.info}>
        {/* Name */}
        <Text style={styles.stallName} numberOfLines={1}>{name}</Text>

        {/* Cuisine tag */}
        <View style={styles.cuisineTag}>
          <Text style={styles.cuisineText}>{cuisine}</Text>
        </View>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <StarRating rating={rating} size={12} />
          <Text style={styles.ratingValue}>{ratingFixed}</Text>
          <Text style={styles.reviewCount}>
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </Text>
        </View>

        {/* Location */}
        {location ? (
          <View style={styles.locationRow}>
            <Icon name="location-outline" size={12} color={colors.text.quaternary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Right: Status + Arrow ── */}
      <View style={styles.right}>
        {openDefined && (
          <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
            <View style={[styles.statusDot, isOpen ? styles.openDot : styles.closedDot]} />
            <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        )}
        <Icon name="chevron-forward" size={18} color={colors.text.disabled} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

export default StallCard;
