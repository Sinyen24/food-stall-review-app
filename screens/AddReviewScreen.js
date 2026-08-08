import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { reviewsAPI } from '../api/apiService';
import { useTheme } from '../theme/useTheme';

// ─── Storage Key ──────────────────────────────────────────────────────────────
const SESSION_KEY = '@foodstall_session';

// ─── Rating labels ────────────────────────────────────────────────────────────
const RATING_LABELS = {
  0: '',
  1: 'Terrible 😞',
  2: 'Poor 😕',
  3: 'Okay 😐',
  4: 'Good 😊',
  5: 'Excellent 🤩',
};

// ─── Interactive Star Picker ──────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
  const { colors } = useTheme();

  return (
    <View style={pickerStyles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity
          key={i}
          onPress={() => onChange(i)}
          activeOpacity={0.7}
          style={pickerStyles.starBtn}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Icon
            name={i <= value ? 'star' : 'star-outline'}
            size={38}
            color={i <= value ? colors.rating.okay : colors.text.disabled}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  row:     { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 4 },
  starBtn: { padding: 4 },
});

// ─── AddReviewScreen ──────────────────────────────────────────────────────────
const AddReviewScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { stallId, stallName = 'This Stall' } = route.params ?? {};

  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [author, setAuthor]   = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  // ── Load session (auto-fill author from logged-in user) ─────────────────────
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then(raw => {
      if (raw) {
        const s = JSON.parse(raw);
        setSession(s);
        if (s?.name) setAuthor(s.name);
      }
    });
  }, []);

  const ratingMeta = {
    label: RATING_LABELS[rating],
    color:
      rating === 0 ? colors.text.disabled :
      rating === 1 ? colors.rating.terrible :
      rating === 2 ? colors.rating.poor :
      rating === 3 ? colors.rating.okay :
      rating === 4 ? colors.rating.good :
      colors.rating.excellent,
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (rating === 0)               e.rating  = 'Please select a star rating.';
    if (!author.trim())             e.author  = 'Please enter your name.';
    if (author.trim().length < 2)   e.author  = 'Name must be at least 2 characters.';
    if (comment.trim().length > 500)
      e.comment = 'Review must be under 500 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit via REST API ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!session) {
      Alert.alert('Not logged in', 'Please log in to submit a review.');
      return;
    }

    setLoading(true);
    try {
      await reviewsAPI.create({
        stallId,
        userId:  session.id,
        author:  author.trim(),
        rating,
        comment: comment.trim(),
      });

      Alert.alert(
        '✅ Review Submitted',
        `Thanks for reviewing ${stallName}!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save your review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Character count colour ──────────────────────────────────────────────────
  const charCount = comment.length;
  const charLimit = 500;
  const charColor =
    charCount > charLimit       ? colors.status.error :
    charCount > charLimit * 0.8 ? colors.status.warning : colors.text.disabled;

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14,
      backgroundColor: colors.surface,
      elevation: 3, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
    },
    backButton: {
      width: 38, height: 38, borderRadius: 11,
      backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
    headerSubtitle: { fontSize: 11, color: colors.text.quaternary, marginTop: 1 },
    headerRight: { width: 38 },

    scroll: { padding: 16, paddingBottom: 40 },

    card: {
      backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12,
      elevation: 3, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8,
    },
    cardLabel: { fontSize: 13, fontWeight: '700', color: colors.text.primary, marginBottom: 14 },
    required: { color: colors.status.error },

    ratingLabelRow: { alignItems: 'center', marginTop: 10, height: 28, justifyContent: 'center' },
    ratingLabelPill: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4 },
    ratingLabelText: { fontSize: 13, fontWeight: '700' },
    ratingPlaceholder: { fontSize: 12, color: colors.text.disabled },

    inputWrapper: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: colors.input.border, borderRadius: 12,
      backgroundColor: colors.input.background, paddingHorizontal: 12, height: 50,
    },
    inputError: { borderColor: colors.input.borderError, backgroundColor: colors.input.backgroundError },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 14, color: colors.input.text, paddingVertical: 0 },

    commentLabelRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 14,
    },
    charCount: { fontSize: 11, fontWeight: '600' },
    textAreaWrapper: {
      borderWidth: 1.5, borderColor: colors.input.border, borderRadius: 12,
      backgroundColor: colors.input.background, padding: 12, marginBottom: 12,
    },
    textAreaActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
    textArea: { fontSize: 14, color: colors.input.text, minHeight: 110, lineHeight: 22 },

    tipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
    tipChip: { backgroundColor: colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5 },
    tipChipText: { fontSize: 11, color: colors.text.secondary, fontWeight: '500' },

    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    errorText: { fontSize: 11, color: colors.status.error },

    previewCard: {
      backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16,
      borderWidth: 1.5, borderColor: colors.primary + '22',
      elevation: 2, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
    },
    previewLabel: {
      fontSize: 11, fontWeight: '700', color: colors.primary,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
    },
    previewContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    previewAvatar: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    previewAvatarText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    previewBody: { flex: 1 },
    previewAuthor: { fontSize: 13, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
    previewStars: { flexDirection: 'row', gap: 2, marginBottom: 6 },
    previewComment: { fontSize: 12, color: colors.text.secondary, lineHeight: 18 },

    submitButton: {
      flexDirection: 'row', backgroundColor: colors.button.primary, borderRadius: 14,
      height: 54, justifyContent: 'center', alignItems: 'center', gap: 8,
      marginBottom: 12, elevation: 5, shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.38, shadowRadius: 10,
    },
    submitDisabled: { backgroundColor: colors.button.primaryDisabled },
    submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

    cancelButton: {
      height: 48, justifyContent: 'center', alignItems: 'center',
      borderRadius: 14, borderWidth: 1.5, borderColor: colors.border,
    },
    cancelText: { fontSize: 14, color: colors.text.quaternary, fontWeight: '600' },
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Write a Review</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{stallName}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Rating Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            <Icon name="star-outline" size={14} color={colors.text.primary} /> Your Rating
            <Text style={styles.required}> *</Text>
          </Text>

          <StarPicker value={rating} onChange={(v) => {
            setRating(v);
            if (errors.rating) setErrors(p => ({ ...p, rating: '' }));
          }} />

          <View style={styles.ratingLabelRow}>
            {rating > 0 ? (
              <View style={[styles.ratingLabelPill, { backgroundColor: ratingMeta.color + '22' }]}>
                <Text style={[styles.ratingLabelText, { color: ratingMeta.color }]}>
                  {ratingMeta.label}
                </Text>
              </View>
            ) : (
              <Text style={styles.ratingPlaceholder}>Tap a star to rate</Text>
            )}
          </View>

          {errors.rating ? (
            <View style={styles.errorRow}>
              <Icon name="alert-circle-outline" size={13} color={colors.status.error} />
              <Text style={styles.errorText}>{errors.rating}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Author Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            <Icon name="person-outline" size={14} color={colors.text.primary} /> Your Name
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={[styles.inputWrapper, errors.author ? styles.inputError : null]}>
            <Icon
              name="person-outline"
              size={17}
              color={errors.author ? colors.status.error : colors.input.icon}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. Ahmad, Sarah, Uncle Bob…"
              placeholderTextColor={colors.input.placeholder}
              autoCapitalize="words"
              returnKeyType="next"
              value={author}
              onChangeText={v => {
                setAuthor(v);
                if (errors.author) setErrors(p => ({ ...p, author: '' }));
              }}
            />
          </View>
          {errors.author ? (
            <View style={styles.errorRow}>
              <Icon name="alert-circle-outline" size={13} color={colors.status.error} />
              <Text style={styles.errorText}>{errors.author}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Comment Card ── */}
        <View style={styles.card}>
          <View style={styles.commentLabelRow}>
            <Text style={styles.cardLabel}>
              <Icon name="chatbubble-outline" size={14} color={colors.text.primary} /> Your Review
            </Text>
            <Text style={[styles.charCount, { color: charColor }]}>
              {charCount}/{charLimit}
            </Text>
          </View>

          <View style={[
            styles.textAreaWrapper,
            errors.comment ? styles.inputError : null,
            comment.length > 0 ? styles.textAreaActive : null,
          ]}>
            <TextInput
              style={styles.textArea}
              placeholder={`Share your experience at ${stallName}…\n\nHow was the food? The service? Worth revisiting?`}
              placeholderTextColor={colors.input.placeholder}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={520}
              value={comment}
              onChangeText={v => {
                setComment(v);
                if (errors.comment) setErrors(p => ({ ...p, comment: '' }));
              }}
            />
          </View>

          {errors.comment ? (
            <View style={styles.errorRow}>
              <Icon name="alert-circle-outline" size={13} color={colors.status.error} />
              <Text style={styles.errorText}>{errors.comment}</Text>
            </View>
          ) : null}

          {/* Tips */}
          <View style={styles.tipsRow}>
            {['Taste 🍜', 'Portion 🍽️', 'Service 😊', 'Price 💰', 'Cleanliness 🧹'].map(tip => (
              <TouchableOpacity
                key={tip}
                style={styles.tipChip}
                onPress={() =>
                  setComment(prev =>
                    prev ? `${prev.trim()} ${tip.split(' ')[0].toLowerCase()}` : tip.split(' ')[0].toLowerCase()
                  )
                }
                activeOpacity={0.7}
              >
                <Text style={styles.tipChipText}>{tip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Review Preview ── */}
        {(rating > 0 || comment.trim()) && (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewContent}>
              <View style={styles.previewAvatar}>
                <Text style={styles.previewAvatarText}>
                  {author ? author[0].toUpperCase() : '?'}
                </Text>
              </View>
              <View style={styles.previewBody}>
                <Text style={styles.previewAuthor}>{author || 'Your Name'}</Text>
                <View style={styles.previewStars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Icon key={i} name={i <= rating ? 'star' : 'star-outline'} size={12} color={i <= rating ? colors.rating.okay : colors.text.disabled} />
                  ))}
                </View>
                {comment ? <Text style={styles.previewComment} numberOfLines={3}>{comment}</Text> : null}
              </View>
            </View>
          </View>
        )}

        {/* ── Submit Button ── */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.88}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Icon name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Cancel ── */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddReviewScreen;
