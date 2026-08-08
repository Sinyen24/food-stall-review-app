import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/useTheme';
import { THEME_MODES, THEME_MODE_LABELS } from '../theme/constants';

// ─── SettingsScreen ───────────────────────────────────────────────────────────
const SettingsScreen = () => {
  const { colors, themeMode, setTheme, systemScheme, isDark } = useTheme();
  const [selectedMode, setSelectedMode] = useState(themeMode);

  const handleThemeChange = async (mode) => {
    setSelectedMode(mode);
    await setTheme(mode);
  };

  const getSystemLabel = () => {
    return systemScheme === 'dark' ? '(Currently Dark)' : '(Currently Light)';
  };

  const themeOptions = [
    {
      mode: THEME_MODES.LIGHT,
      label: 'Light Mode',
      icon: 'sunny-outline',
      description: 'Always use light theme',
    },
    {
      mode: THEME_MODES.DARK,
      label: 'Dark Mode',
      icon: 'moon-outline',
      description: 'Always use dark theme',
    },
    {
      mode: THEME_MODES.AUTO,
      label: 'Automatic',
      icon: 'settings-outline',
      description: `Follow system preference ${getSystemLabel()}`,
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Settings
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text.tertiary }]}>
            Customize your app experience
          </Text>
        </View>

        {/* Theme Section */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Icon
              name="color-palette-outline"
              size={20}
              color={colors.primary}
              style={styles.cardIcon}
            />
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
              Appearance
            </Text>
          </View>

          <Text
            style={[styles.cardDescription, { color: colors.text.secondary }]}
          >
            Choose how the app looks
          </Text>

          <View style={styles.themeOptions}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      selectedMode === option.mode
                        ? colors.primary
                        : colors.background,
                    borderColor:
                      selectedMode === option.mode
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => handleThemeChange(option.mode)}
                activeOpacity={0.8}
              >
                <View style={styles.themeOptionContent}>
                  <Icon
                    name={option.icon}
                    size={24}
                    color={
                      selectedMode === option.mode
                        ? colors.surface
                        : colors.primary
                    }
                  />
                  <View style={styles.themeOptionText}>
                    <Text
                      style={[
                        styles.themeOptionLabel,
                        {
                          color:
                            selectedMode === option.mode
                              ? colors.surface
                              : colors.text.primary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.themeOptionDesc,
                        {
                          color:
                            selectedMode === option.mode
                              ? colors.surface
                              : colors.text.secondary,
                        },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                </View>
                {selectedMode === option.mode && (
                  <Icon
                    name="checkmark-circle"
                    size={24}
                    color={colors.surface}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Theme Info */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>
              Current Theme:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text.primary }]}>
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </Text>
          </View>

          {themeMode === THEME_MODES.AUTO && (
            <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }]}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>
                System Preference:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                {systemScheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </Text>
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Icon
              name="information-circle-outline"
              size={20}
              color={colors.info}
              style={styles.cardIcon}
            />
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
              About
            </Text>
          </View>

          <Text
            style={[styles.aboutText, { color: colors.text.secondary }]}
          >
            Food Stall Review v1.0.0
          </Text>
          <Text
            style={[styles.aboutText, { color: colors.text.tertiary }]}
          >
            Built with React Native • Powered by Express + MongoDB
          </Text>
        </View>

        {/* Footer spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: { marginRight: 12 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  cardDescription: {
    fontSize: 13,
    marginBottom: 14,
  },

  themeOptions: {
    gap: 10,
  },

  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  themeOptionText: {
    marginLeft: 12,
    flex: 1,
  },

  themeOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },

  themeOptionDesc: {
    fontSize: 12,
    fontWeight: '500',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  aboutText: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default SettingsScreen;
