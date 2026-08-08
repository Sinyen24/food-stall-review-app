import React, { useState } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { authAPI } from '../api/apiService';
import { useTheme } from '../theme/useTheme';

// ─── Storage Key ──────────────────────────────────────────────────────────────
const SESSION_KEY = '@foodstall_session';

// ─── Component ────────────────────────────────────────────────────────────────

const LoginScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState({ email: '', password: '', general: '' });

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    let valid = true;
    const newErrors = { email: '', password: '', general: '' };

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required.';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // ── Login via REST API ──────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await authAPI.login({ email: email.trim(), password });
      // Persist full user object (id, name, email, role) as session
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
      navigation.replace('MainApp');
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        general: err.message || 'Invalid email or password.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },

    // Hero
    heroSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      marginBottom: 14,
    },
    logoEmoji: {
      fontSize: 38,
    },
    appName: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text.primary,
      letterSpacing: 0.5,
    },
    appTagline: {
      fontSize: 13,
      color: colors.text.tertiary,
      marginTop: 4,
      fontWeight: '400',
    },

    // Card
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingHorizontal: 24,
      paddingVertical: 28,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.text.quaternary,
      marginBottom: 20,
    },

    // General error
    generalErrorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.status.errorLight,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 16,
      gap: 8,
    },
    generalErrorText: {
      fontSize: 12,
      color: colors.status.errorDark,
      flex: 1,
      lineHeight: 17,
    },

    // Label
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: 6,
      marginTop: 4,
    },

    // Input
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.input.border,
      borderRadius: 12,
      backgroundColor: colors.input.background,
      paddingHorizontal: 12,
      height: 52,
      marginBottom: 4,
    },
    inputError: {
      borderColor: colors.input.borderError,
      backgroundColor: colors.input.backgroundError,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: colors.input.text,
      paddingVertical: 0,
    },
    eyeButton: {
      padding: 4,
    },
    errorText: {
      fontSize: 11,
      color: colors.status.errorDark,
      marginBottom: 10,
      marginLeft: 4,
    },

    // Login button
    loginButton: {
      flexDirection: 'row',
      backgroundColor: colors.button.primary,
      borderRadius: 12,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    loginButtonDisabled: {
      backgroundColor: colors.button.primaryDisabled,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.3,
    },

    // Divider
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.divider,
    },
    dividerLabel: {
      fontSize: 12,
      color: colors.text.disabled,
      marginHorizontal: 12,
      fontWeight: '500',
    },

    // Register button
    registerButton: {
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 12,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    registerButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '700',
    },

    // Hint
    hintText: {
      textAlign: 'center',
      fontSize: 11,
      color: colors.text.disabled,
      marginTop: 24,
      lineHeight: 18,
    },
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🍜</Text>
          </View>
          <Text style={styles.appName}>Food Stall</Text>
          <Text style={styles.appTagline}>Discover & Review Local Flavours</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue</Text>

          {/* General Error */}
          {errors.general ? (
            <View style={styles.generalErrorBox}>
              <Icon name="alert-circle-outline" size={16} color={colors.status.errorDark} />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* ── Email Field ── */}
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
            <Icon
              name="mail-outline"
              size={18}
              color={errors.email ? colors.status.errorDark : colors.input.icon}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.input.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors(prev => ({ ...prev, email: '', general: '' }));
              }}
            />
          </View>
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          {/* ── Password Field ── */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
            <Icon
              name="lock-closed-outline"
              size={18}
              color={errors.password ? colors.status.errorDark : colors.input.icon}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.input.placeholder}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: '', general: '' }));
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.eyeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.input.icon}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          {/* ── Login Button ── */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Icon name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.loginButtonText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Divider ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Register Link ── */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.75}
          >
            <Text style={styles.registerButtonText}>Create an Account</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer Hint ── */}
        <Text style={styles.hintText}>
          Admin: admin@foodstall.com · Admin123{'\n'}
          User: user@foodstall.com · Password1
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
