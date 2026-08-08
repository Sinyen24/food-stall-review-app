import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { stallsAPI } from '../api/apiService';
import { useTheme } from '../theme/useTheme';

// ─── Cuisine emoji map ────────────────────────────────────────────────────────
const EMOJI_MAP = {
  chinese: '🥢', malay: '🍛', indian: '🫓', western: '🍔',
  japanese: '🍣', korean: '🍜', thai: '🌶️', dessert: '🍨',
  seafood: '🦐', mixed: '🍽️',
};

// ─── Stall Row ────────────────────────────────────────────────────────────────
const StallRow = ({ stall, onEdit, onDelete }) => {
  const { colors } = useTheme();

  const rowStyles = StyleSheet.create({
    card: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surface, borderRadius: 14,
      marginHorizontal: 16, marginBottom: 10, padding: 12,
      elevation: 3, shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6,
    },
    left:    { marginRight: 12 },
    emoji:   { fontSize: 32 },
    info:    { flex: 1 },
    name:    { fontSize: 14, fontWeight: '700', color: colors.text.primary, marginBottom: 3 },
    meta:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
    cuisine: { fontSize: 11, fontWeight: '600', color: colors.primary },
    dot:     { fontSize: 11, color: colors.text.disabled },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    openDot:   { backgroundColor: colors.status.success },
    closedDot: { backgroundColor: colors.status.error },
    status:    { fontSize: 11, fontWeight: '600' },
    openText:  { color: colors.status.success },
    closedText:{ color: colors.status.error },
    location:  { fontSize: 11, color: colors.text.quaternary },
    actions:   { flexDirection: 'column', gap: 8, marginLeft: 8 },
    actionBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    editBtn:   { backgroundColor: colors.status.info + '22' },
    deleteBtn: { backgroundColor: colors.status.errorLight },
  });

  return (
    <View style={rowStyles.card}>
      <View style={rowStyles.left}>
        <Text style={rowStyles.emoji}>{EMOJI_MAP[stall.cuisine?.toLowerCase()] ?? '🍽️'}</Text>
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.name} numberOfLines={1}>{stall.name}</Text>
        <View style={rowStyles.meta}>
          <Text style={rowStyles.cuisine}>{stall.cuisine}</Text>
          <Text style={rowStyles.dot}>·</Text>
          <View style={[rowStyles.statusDot, stall.isOpen ? rowStyles.openDot : rowStyles.closedDot]} />
          <Text style={[rowStyles.status, stall.isOpen ? rowStyles.openText : rowStyles.closedText]}>
            {stall.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
        <Text style={rowStyles.location} numberOfLines={1}>{stall.location}</Text>
      </View>
      <View style={rowStyles.actions}>
        <TouchableOpacity
          style={[rowStyles.actionBtn, rowStyles.editBtn]}
          onPress={onEdit}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Icon name="create-outline" size={16} color={colors.status.info} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[rowStyles.actionBtn, rowStyles.deleteBtn]}
          onPress={onDelete}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Icon name="trash-outline" size={16} color={colors.status.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── ManageStallsScreen ───────────────────────────────────────────────────────
const ManageStallsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [stalls, setStalls]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingBottom: 100 },

    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14,
      backgroundColor: colors.surface,
      elevation: 3, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 11,
      backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text.primary },

    listHeader: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12 },
    pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text.primary },
    pageSubtitle: { fontSize: 13, color: colors.text.quaternary, marginTop: 2 },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 32 },
    loadingText: { fontSize: 14, color: colors.text.quaternary, marginTop: 12 },
    errorEmoji: { fontSize: 48, marginBottom: 12 },
    errorTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
    errorMsg: { fontSize: 13, color: colors.text.quaternary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    retryBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.button.primary, borderRadius: 12,
      paddingHorizontal: 24, paddingVertical: 12,
    },
    retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 6 },
    emptySubtitle: { fontSize: 13, color: colors.text.quaternary },

    fab: {
      position: 'absolute', bottom: 28, right: 24,
      width: 58, height: 58, borderRadius: 29,
      backgroundColor: colors.button.primary,
      justifyContent: 'center', alignItems: 'center',
      elevation: 8, shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10,
    },
  });

  // ── Load stalls on focus ────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadStalls();
    }, [])
  );

  const loadStalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stallsAPI.getAll();
      setStalls(data);
    } catch (err) {
      setError(err.message || 'Failed to load stalls.');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete stall ────────────────────────────────────────────────────────────
  const handleDelete = (stall) => {
    Alert.alert(
      'Delete Stall',
      `Are you sure you want to delete "${stall.name}"? All its reviews will also be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await stallsAPI.remove(stall.id);
              setStalls(prev => prev.filter(s => s.id !== stall.id));
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not delete stall.');
            }
          },
        },
      ]
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.pageSubtitle}>{stalls.length} stall{stalls.length !== 1 ? 's' : ''} in database</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading stalls…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>📡</Text>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadStalls}>
          <Icon name="refresh-outline" size={16} color="#FFFFFF" />
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Stalls</Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={stalls}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <StallRow
            stall={item}
            onEdit={() => navigation.navigate('StallForm', { stall: item })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏪</Text>
            <Text style={styles.emptyTitle}>No Stalls Yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to add the first stall.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* ── FAB: Add Stall ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('StallForm', { stall: null })}
        activeOpacity={0.88}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default ManageStallsScreen;
