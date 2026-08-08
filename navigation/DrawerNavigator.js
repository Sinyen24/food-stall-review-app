import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

// ─── Theme Hook ───────────────────────────────────────────────────────────────
import { useTheme } from '../theme/useTheme';

// ─── Tab Navigator (Home + MyReviews + Profile) ───────────────────────────────
import MainTabNavigator from './MainTabNavigator';

// ─── Screens ───────────────────────────────────────────────────────────────────
import SettingsScreen from '../screens/SettingsScreen';

// ─── Storage Key ──────────────────────────────────────────────────────────────
const SESSION_KEY = '@foodstall_session';

// ─── About Screen ─────────────────────────────────────────────────────────────
// Uses useTheme() internally so it can be passed as a plain component reference
// (avoids the "inline function for component prop" React Navigation warning)
const AboutScreen = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.placeholder, { backgroundColor: colors.background }]}>
      <Text style={{ fontSize: 48 }}>🍜</Text>
      <Text style={[styles.placeholderTitle, { color: colors.text.primary }]}>
        Food Stall Review
      </Text>
      <Text style={[styles.placeholderSub, { color: colors.text.secondary }]}>
        Version 1.0.0
      </Text>
      <Text style={[styles.placeholderSub, { color: colors.text.tertiary }]}>
        Built with React Native
      </Text>
      <Text style={[styles.placeholderSub, { color: colors.text.tertiary }]}>
        Powered by Express + MongoDB Atlas
      </Text>
    </View>
  );
};

// ─── Custom Drawer Content ────────────────────────────────────────────────────
const CustomDrawerContent = (props) => {
  const { navigation, state } = props;
  const { colors, isDark } = useTheme();
  const activeRoute = state.routeNames[state.index];
  const [session, setSession] = useState(null);

  // Load session to check role
  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw));
    };
    load();
    // Re-load when drawer opens
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  const isAdmin = session?.role === 'admin';

  const menuItems = [
    { label: 'Home',         route: 'MainTabs',     icon: 'home-outline',               activeIcon: 'home'               },
    { label: 'Settings',     route: 'Settings',     icon: 'settings-outline',           activeIcon: 'settings'           },
    { label: 'About',        route: 'About',        icon: 'information-circle-outline',  activeIcon: 'information-circle' },
  ];

  // Admin-only item
  const adminItems = [
    { label: 'Manage Stalls', route: 'ManageStalls', icon: 'storefront-outline', activeIcon: 'storefront' },
  ];

  const handleLogout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.drawerContainer, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.drawerHeader, { backgroundColor: colors.primary }]}>
        <View style={[styles.avatarCircle, { borderColor: colors.surface }]}>
          <Text style={styles.avatarInitial}>
            {session?.name ? session.name[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.drawerUsername}>{session?.name ?? 'Welcome!'}</Text>
        <Text style={styles.drawerSubtitle}>
          {session?.role === 'admin' ? '⚙️ Admin' : '🍽️ Food Stall Explorer'}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Menu Items */}
      <ScrollView style={{ flex: 1, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuItem,
                isActive && [styles.menuItemActive, { backgroundColor: colors.badge }]
              ]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.menuIconWrapper,
                { backgroundColor: isDark ? colors.surfaceAlt : colors.surfaceAlt },
                isActive && { backgroundColor: colors.badge }
              ]}>
                <Icon
                  name={isActive ? item.activeIcon : item.icon}
                  size={20}
                  color={isActive ? colors.primary : colors.text.secondary}
                />
              </View>
              <Text style={[
                styles.menuLabel,
                { color: colors.text.secondary },
                isActive && { color: colors.primary, fontWeight: '700' }
              ]}>
                {item.label}
              </Text>
              {isActive && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <View style={styles.sectionDivider}>
              <Text style={[styles.sectionLabel, { color: colors.text.quaternary }]}>
                Admin
              </Text>
            </View>
            {adminItems.map((item) => {
              const isActive = activeRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.menuItem,
                    isActive && [styles.menuItemActive, { backgroundColor: colors.badgeAdmin }]
                  ]}
                  onPress={() => navigation.navigate(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.menuIconWrapper,
                    { backgroundColor: colors.badgeAdmin },
                    isActive && { backgroundColor: colors.badgeAdmin }
                  ]}>
                    <Icon
                      name={isActive ? item.activeIcon : item.icon}
                      size={20}
                      color={isActive ? colors.primary : colors.primaryDark}
                    />
                  </View>
                  <Text style={[
                    styles.menuLabel,
                    { color: colors.primaryDark },
                    isActive && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon name="log-out-outline" size={20} color={colors.status.error} />
          <Text style={[styles.logoutText, { color: colors.status.error }]}>Log Out</Text>
        </TouchableOpacity>
        <Text style={[styles.versionText, { color: colors.text.quaternary }]}>
          Food Stall Review v1.0
        </Text>
      </View>
    </View>
  );
};

// ─── Drawer Navigator ─────────────────────────────────────────────────────────
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="MainTabs"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18, color: colors.text.primary },
        headerTitleAlign: 'center',
        drawerStyle: { backgroundColor: colors.surface, width: 270 },
        drawerType: 'front',
        overlayColor: colors.overlay,
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ title: '🍜 Food Stall Reviews', drawerLabel: 'Home' }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
    </Drawer.Navigator>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  drawerContainer: { flex: 1 },
  drawerHeader: {
    paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitial:   { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  drawerUsername:  { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  drawerSubtitle:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  divider:         { height: 1, marginHorizontal: 16, marginVertical: 8 },

  sectionDivider: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  sectionLabel:   { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 20,
    marginHorizontal: 10, borderRadius: 10, marginBottom: 4, position: 'relative',
  },
  menuItemActive: {},
  menuIconWrapper: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  menuLabel:             { fontSize: 15, fontWeight: '500', flex: 1 },
  activeBar:             { width: 4, height: 20, borderRadius: 2 },

  drawerFooter:  { paddingBottom: 24, paddingHorizontal: 10 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 20,
    borderRadius: 10, marginBottom: 8, gap: 12,
  },
  logoutText:  { fontSize: 15, fontWeight: '600' },
  versionText: { textAlign: 'center', fontSize: 11, marginTop: 4 },

  placeholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: 8,
  },
  placeholderTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  placeholderSub:   { fontSize: 13 },
});

export default DrawerNavigator;
