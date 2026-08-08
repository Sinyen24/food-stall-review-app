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
import Icon from 'react-native-vector-icons/Ionicons';
import { authAPI } from '../api/apiService';
import { useTheme } from '../theme/useTheme';

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [show, setShow] = useState({
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Field updater ───────────────────────────────────────────────────────────
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Include at least one uppercase letter.';
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = 'Include at least one number.';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Password strength ───────────────────────────────────────────────────────
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: colors.border };
    let score = 0;
    if (p.length >= 8)           score++;
    if (/[A-Z]/.test(p))         score++;
    if (/[0-9]/.test(p))         score++;
    if (/[^A-Za-z0-9]/.test(p))  score++;

    if (score <= 1) return { level: 1, label: 'Weak',   color: colors.status.error };
    if (score === 2) return { level: 2, label: 'Fair',   color: colors.status.warning };
    if (score === 3) return { level: 3, label: 'Good',   color: colors.rating.good };
    return              { level: 4, label: 'Strong', color: colors.status.success };
  };

  const strength = getPasswordStrength();
  const styles = createStyles(colors);

  // ── Register via REST API ────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authAPI.register({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      setSuccess(true);
      setTimeout(() => navigation.replace('Login'), 1500);
    } catch (err) {
      // Duplicate email → show under email field; other errors → general
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        setErrors({ email: 'An account with this email already exists.' });
      } else {
        setErrors({ general: err.message || 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

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
        {/* ── Hero ── */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🍜</Text>
          </View>
          <Text style={styles.appName}>Food Stall</Text>
          <Text style={styles.appTagline}>Join the Community of Food Lovers</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>Fill in the details to get started</Text>

          {/* ── General Error ── */}
          {errors.general ? (
            <View style={styles.generalErrorBox}>
              <Icon name="alert-circle-outline" size={16} color={colors.status.errorDark} />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* ── Success Banner ── */}
          {success ? (
            <View style={styles.successBox}>
              <Icon name="checkmark-circle-outline" size={16} color={colors.status.success} />
              <Text style={styles.successText}>Account created! Redirecting to login…</Text>
            </View>
          ) : null}

          {/* ── Full Name ── */}
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputWrapper, errors.name ? styles.inputError : null]}>
            <Icon
              name="person-outline"
              size={18}
              color={errors.name ? colors.status.errorDark : colors.input.icon}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.input.placeholder}
              autoCapitalize="words"
              value={form.name}
              onChangeText={v => updateField('name', v)}
            />
          </View>
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          {/* ── Email ── */}
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
              value={form.email}
              onChangeText={v => updateField('email', v)}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* ── Password ── */}
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
              placeholder="Min. 8 characters"
              placeholderTextColor={colors.input.placeholder}
              secureTextEntry={!show.password}
              autoCapitalize="none"
              value={form.password}
              onChangeText={v => updateField('password', v)}
            />
            <TouchableOpacity
              onPress={() => setShow(prev => ({ ...prev, password: !prev.password }))}
              style={styles.eyeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon
                name={show.password ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.input.icon}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          {/* ── Password Strength Bar ── */}
          {form.password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      { backgroundColor: i <= strength.level ? strength.color : colors.border },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          {/* ── Confirm Password ── */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : null]}>
            <Icon
              name="shield-checkmark-outline"
              size={18}
              color={errors.confirmPassword ? colors.status.errorDark : colors.input.icon}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.input.placeholder}
              secureTextEntry={!show.confirmPassword}
              autoCapitalize="none"
              value={form.confirmPassword}
              onChangeText={v => updateField('confirmPassword', v)}
            />
            <TouchableOpacity
              onPress={() => setShow(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
              style={styles.eyeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon
                name={show.confirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.input.icon}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}

          {/* ── Register Button ── */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading || success}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Icon name="person-add-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.registerButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Divider ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Back to Login ── */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.75}
          >
            <Text style={styles.loginButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* ── Password Requirements ── */}
        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Password Requirements</Text>
          {[
            { rule: 'At least 8 characters',         met: form.password.length >= 8           },
            { rule: 'One uppercase letter (A–Z)',     met: /[A-Z]/.test(form.password)         },
            { rule: 'One number (0–9)',               met: /[0-9]/.test(form.password)         },
            { rule: 'One special character (bonus)',  met: /[^A-Za-z0-9]/.test(form.password) },
          ].map((item, i) => (
            <View key={i} style={styles.requirementRow}>
              <Icon
                name={item.met ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={item.met ? colors.status.success : colors.text.disabled}
              />
              <Text style={[styles.requirementText, item.met && styles.requirementMet]}>
                {item.rule}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },

  heroSection:  { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, marginBottom: 14,
  },
  logoEmoji:  { fontSize: 38 },
  appName:    { fontSize: 26, fontWeight: '800', color: colors.text.primary, letterSpacing: 0.5 },
  appTagline: { fontSize: 13, color: colors.text.tertiary, marginTop: 4 },

  card: {
    backgroundColor: colors.surface, borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 28,
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16,
  },
  cardTitle:    { fontSize: 22, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.text.quaternary, marginBottom: 20 },

  generalErrorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.status.errorLight, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8,
  },
  generalErrorText: { fontSize: 12, color: colors.status.errorDark, flex: 1, lineHeight: 17 },
  successBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.status.successLight, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8,
  },
  successText: { fontSize: 12, color: colors.status.success, flex: 1, lineHeight: 17 },

  label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginBottom: 6, marginTop: 10 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.input.border, borderRadius: 12,
    backgroundColor: colors.input.background, paddingHorizontal: 12, height: 52, marginBottom: 4,
  },
  inputError:  { borderColor: colors.input.borderError, backgroundColor: colors.input.backgroundError },
  inputIcon:   { marginRight: 10 },
  input:       { flex: 1, fontSize: 14, color: colors.input.text, paddingVertical: 0 },
  eyeButton:   { padding: 4 },
  errorText:   { fontSize: 11, color: colors.status.errorDark, marginBottom: 4, marginLeft: 4 },

  strengthContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 4, gap: 8 },
  strengthBars:      { flexDirection: 'row', gap: 4, flex: 1 },
  strengthSegment:   { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel:     { fontSize: 11, fontWeight: '700', width: 44, textAlign: 'right' },

  registerButton: {
    flexDirection: 'row', backgroundColor: colors.button.primary, borderRadius: 12,
    height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 20,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
  },
  buttonDisabled:      { backgroundColor: colors.button.primaryDisabled },
  registerButtonText:  { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  dividerRow:   { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine:  { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerLabel: { fontSize: 12, color: colors.text.disabled, marginHorizontal: 12, fontWeight: '500' },

  loginButton: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12,
    height: 52, justifyContent: 'center', alignItems: 'center',
  },
  loginButtonText: { color: colors.primary, fontSize: 15, fontWeight: '700' },

  requirementsCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginTop: 16,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  requirementsTitle: {
    fontSize: 12, fontWeight: '700', color: colors.text.tertiary, marginBottom: 10,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  requirementRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  requirementText: { fontSize: 12, color: colors.text.quaternary },
  requirementMet:  { color: colors.status.success, fontWeight: '600' },
});

export default RegisterScreen;
