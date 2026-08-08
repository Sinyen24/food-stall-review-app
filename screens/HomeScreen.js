import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import StallCard from '../components/StallCard';
import { stallsAPI } from '../api/apiService';
import socket from '../api/socket';
import { useTheme } from '../theme/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────
const CUISINES = ['Chinese', 'Malay', 'Indian', 'Western', 'Japanese', 'Korean', 'Thai', 'Dessert', 'Seafood', 'Mixed'];
const CUISINE_FILTERS = ['All', ...CUISINES];

const EMOJI_MAP = {
  chinese: '🥢', malay: '🍛', indian: '🫓', western: '🍔',
  japanese: '🍣', korean: '🍜', thai: '🌶️', dessert: '🍨',
  seafood: '🦐', mixed: '🍽️',
};

// ─── Featured Banner ──────────────────────────────────────────────────────────
const FeaturedBanner = ({ stall, onPress }) => {
  const { colors } = useTheme();

  const bannerStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface, borderRadius: 18,
      marginHorizontal: 16, marginBottom: 6,
      elevation: 6, shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10,
      overflow: 'hidden',
    },
    imagePlaceholder: { height: 140, backgroundColor: colors.badge, justifyContent: 'center', alignItems: 'center' },
    emoji: { fontSize: 56 },
    badge: {
      position: 'absolute', top: 12, left: 12,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.primary, borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 4, gap: 4,
    },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
    info: { padding: 14 },
    name: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
    desc: { fontSize: 12, color: colors.text.tertiary, lineHeight: 18, marginBottom: 8 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rating: { fontSize: 12, fontWeight: '700', color: colors.status.warning },
    dot: { color: colors.text.disabled, fontSize: 12 },
    location: { fontSize: 11, color: colors.text.quaternary, flex: 1 },
  });

  return (
    <TouchableOpacity style={bannerStyles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={bannerStyles.imagePlaceholder}>
        <Text style={bannerStyles.emoji}>
          {EMOJI_MAP[stall.cuisine?.toLowerCase()] ?? '🍽️'}
        </Text>
        <View style={bannerStyles.badge}>
          <Icon name="star" size={10} color="#FFFFFF" />
          <Text style={bannerStyles.badgeText}>Featured</Text>
        </View>
      </View>
      <View style={bannerStyles.info}>
        <Text style={bannerStyles.name} numberOfLines={1}>{stall.name}</Text>
        <Text style={bannerStyles.desc} numberOfLines={2}>{stall.description}</Text>
        <View style={bannerStyles.meta}>
          <Icon name="star" size={12} color={colors.status.warning} />
          <Text style={bannerStyles.rating}>{parseFloat(stall.avgRating || 0).toFixed(1)}</Text>
          <Text style={bannerStyles.dot}>·</Text>
          <Icon name="location-outline" size={12} color={colors.text.quaternary} />
          <Text style={bannerStyles.location} numberOfLines={1}>{stall.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [stalls, setStalls]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [activeFilter, setFilter]   = useState('All');

  // ── Fetch from REST API ─────────────────────────────────────────────────────
  const fetchStalls = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else           setLoading(true);
    setError(null);

    try {
      const data = await stallsAPI.getAll();
      setStalls(data);
    } catch (err) {
      setError(err.message || 'Failed to load stalls. Is the server running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Re-fetch every time this screen comes into focus — works correctly even when
  // returning from nested Stack screens (StallDetail, AddReview) because
  // useFocusEffect traverses the full navigator hierarchy.
  useFocusEffect(
    useCallback(() => {
      fetchStalls();
    }, [fetchStalls])
  );

  // ── Socket.IO — live stall rating updates ────────────────────────────────────
  // When any user adds/deletes a review, the server emits 'stallUpdated' with
  // the new avgRating and reviewCount. We patch just that stall in state so
  // the cards update without a full re-fetch.
  useEffect(() => {
    const onStallUpdated = ({ stallId, avgRating, reviewCount }) => {
      setStalls(prev => prev.map(s =>
        s.id === stallId ? { ...s, avgRating, reviewCount } : s
      ));
    };
    socket.on('stallUpdated', onStallUpdated);
    return () => socket.off('stallUpdated', onStallUpdated);
  }, []);

  // ── Filter + search ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return stalls.filter(s => {
      const matchCuisine = activeFilter === 'All' || s.cuisine === activeFilter;
      const q            = search.toLowerCase();
      const matchSearch  = !q ||
        s.name.toLowerCase().includes(q)     ||
        s.cuisine.toLowerCase().includes(q)  ||
        s.location.toLowerCase().includes(q);
      return matchCuisine && matchSearch;
    });
  }, [stalls, search, activeFilter]);

  const featured = stalls.length
    ? stalls.reduce((best, s) => (s.avgRating || 0) > (best.avgRating || 0) ? s : best, stalls[0])
    : null;

  // ── Render helpers ──────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item }) => (
    <StallCard
      stall={item}
      onPress={() => navigation.navigate('StallDetail', { stallId: item.id, stall: item })}
    />
  ), [navigation]);

  const keyExtractor = useCallback(item => String(item.id), []);

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingBottom: 30 },

    centeredFull: {
      flex: 1, justifyContent: 'center', alignItems: 'center',
      backgroundColor: colors.background, padding: 32,
    },
    loadingText: { fontSize: 14, color: colors.text.quaternary, marginTop: 12 },
    errorEmoji: { fontSize: 48, marginBottom: 12 },
    errorTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
    errorMsg: { fontSize: 13, color: colors.text.quaternary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    retryBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.button.primary, borderRadius: 12,
      paddingHorizontal: 24, paddingVertical: 12,
      elevation: 4, shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
    },
    retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

    topHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    },
    greeting: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
    subGreeting: { fontSize: 13, color: colors.text.tertiary, marginTop: 2 },
    searchWrapper: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surface, borderRadius: 14,
      marginHorizontal: 16, marginBottom: 12,
      paddingHorizontal: 14, height: 48,
      elevation: 2, shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 14, color: colors.text.primary, paddingVertical: 0 },

    filterScroll: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
    chip: {
      paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
      backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, elevation: 1,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 12, fontWeight: '600', color: colors.text.tertiary },
    chipTextActive: { color: '#FFFFFF' },

    apiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: 16, marginBottom: 12 },
    apiBadgeText: { fontSize: 11, color: colors.text.quaternary, fontStyle: 'italic' },

    sectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, marginBottom: 10, marginTop: 4,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
    sectionCount: { fontSize: 12, color: colors.text.quaternary, fontWeight: '500' },

    emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary, marginBottom: 6 },
    emptySubtitle: { fontSize: 13, color: colors.text.quaternary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
    resetBtn: { backgroundColor: colors.button.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
    resetBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  });

  // ── Full-screen loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centeredFull}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching stalls…</Text>
      </View>
    );
  }

  // ── Full-screen error ───────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centeredFull}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Text style={styles.errorEmoji}>📡</Text>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchStalls()}>
          <Icon name="refresh-outline" size={16} color="#FFFFFF" />
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── List header ─────────────────────────────────────────────────────────────
  const ListHeader = (
    <View>
      {/* Top header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>Good day! 👋</Text>
          <Text style={styles.subGreeting}>What are you craving today?</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Icon name="search-outline" size={18} color={colors.input.icon} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stalls, cuisines, locations…"
          placeholderTextColor={colors.input.placeholder}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="close-circle" size={18} color={colors.text.disabled} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {CUISINE_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* API source badge */}
      <View style={styles.apiBadge}>
        <Icon name="server-outline" size={11} color={colors.status.success} />
        <Text style={styles.apiBadgeText}>Live data · FoodStall REST API</Text>
      </View>

      {/* Featured */}
      {!search && activeFilter === 'All' && featured && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Top Pick</Text>
          </View>
          <FeaturedBanner
            stall={featured}
            onPress={() => navigation.navigate('StallDetail', { stallId: featured.id, stall: featured })}
          />
        </>
      )}

      {/* All stalls header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {search || activeFilter !== 'All' ? '🔍 Results' : '🏪 All Stalls'}
        </Text>
        <Text style={styles.sectionCount}>{filtered.length} found</Text>
      </View>
    </View>
  );

  // ── Empty state ─────────────────────────────────────────────────────────────
  const ListEmpty = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyTitle}>No stalls found</Text>
      <Text style={styles.emptySubtitle}>Try a different keyword or cuisine</Text>
      <TouchableOpacity style={styles.resetBtn} onPress={() => { setSearch(''); setFilter('All'); }}>
        <Text style={styles.resetBtnText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchStalls(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={10}
      />
    </View>
  );
};

export default HomeScreen;
