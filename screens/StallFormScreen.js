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
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { stallsAPI } from '../api/apiService';
import { useTheme } from '../theme/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────
const CUISINES = ['Chinese', 'Malay', 'Indian', 'Western', 'Japanese', 'Korean', 'Thai', 'Dessert', 'Seafood', 'Mixed'];
const LOCATIONS = [
  'Petaling Jaya Food Court', 'Old Klang Road Hawker Centre', 'Chow Kit Market',
  'SS2 Night Market', 'Kampung Baru', 'Jalan Alor', 'Sunway Pyramid Food Court',
  'Sri Petaling', 'Wangsa Maju', 'Taman Megah',
];

// ─── Picker Row ───────────────────────────────────────────────────────────────
const OptionPicker = ({ label, options, value, onChange, error }) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const pickerStyles = StyleSheet.create({
    container:   { marginBottom: 12 },
    label:       { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginBottom: 6 },
    trigger: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderWidth: 1.5, borderColor: colors.input.border, borderRadius: 12,
      backgroundColor: colors.input.background, paddingHorizontal: 14, height: 50,
    },
    triggerError:       { borderColor: colors.input.borderError, backgroundColor: colors.input.backgroundError },
    triggerText:        { fontSize: 14, color: colors.input.text },
    placeholder:        { color: colors.input.placeholder },
    errorText:          { fontSize: 11, color: colors.status.error, marginTop: 4, marginLeft: 4 },
    dropdown: {
      backgroundColor: colors.surface, borderRadius: 12,
      borderWidth: 1, borderColor: colors.border,
      marginTop: 4, elevation: 6, shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8,
      maxHeight: 220, overflow: 'scroll',
    },
    option: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 12, paddingHorizontal: 16,
      borderBottomWidth: 1, borderBottomColor: colors.divider,
    },
    optionSelected:     { backgroundColor: colors.badge },
    optionText:         { fontSize: 14, color: colors.text.secondary },
    optionTextSelected: { color: colors.primary, fontWeight: '700' },
  });

  return (
    <View style={pickerStyles.container}>
      <Text style={pickerStyles.label}>{label}</Text>
      <TouchableOpacity
        style={[pickerStyles.trigger, error ? pickerStyles.triggerError : null]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <Text style={[pickerStyles.triggerText, !value && pickerStyles.placeholder]}>
          {value || `Select ${label}`}
        </Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.input.icon} />
      </TouchableOpacity>
      {error ? <Text style={pickerStyles.errorText}>{error}</Text> : null}
      {open && (
        <View style={pickerStyles.dropdown}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[pickerStyles.option, opt === value && pickerStyles.optionSelected]}
              onPress={() => { onChange(opt); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text style={[pickerStyles.optionText, opt === value && pickerStyles.optionTextSelected]}>
                {opt}
              </Text>
              {opt === value && <Icon name="checkmark" size={14} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── StallFormScreen ──────────────────────────────────────────────────────────
const StallFormScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const existingStall = route.params?.stall ?? null;
  const isEdit        = existingStall !== null;

  const [form, setForm] = useState({
    name:        existingStall?.name        ?? '',
    cuisine:     existingStall?.cuisine     ?? '',
    location:    existingStall?.location    ?? '',
    description: existingStall?.description ?? '',
    isOpen:      existingStall?.isOpen      ?? true,
  });

  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  // ── Field updater ───────────────────────────────────────────────────────────
  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Stall name is required.';
    if (!form.cuisine)        e.cuisine  = 'Cuisine type is required.';
    if (!form.location)       e.location = 'Location is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name:        form.name.trim(),
        cuisine:     form.cuisine,
        location:    form.location,
        description: form.description.trim(),
        isOpen:      form.isOpen,
      };

      if (isEdit) {
        await stallsAPI.update(existingStall.id, payload);
        Alert.alert('✅ Updated', `"${payload.name}" has been updated.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await stallsAPI.create(payload);
        Alert.alert('✅ Created', `"${payload.name}" has been added.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save the stall. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },

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
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
    headerSub: { fontSize: 11, color: colors.text.quaternary, marginTop: 1 },

    scroll: { padding: 16, paddingBottom: 40 },

    card: {
      backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12,
      elevation: 3, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8,
    },

    label: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginBottom: 6 },
    required: { color: colors.status.error },

    inputWrapper: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: colors.input.border, borderRadius: 12,
      backgroundColor: colors.input.background, paddingHorizontal: 12, height: 50, marginBottom: 4,
    },
    inputError: { borderColor: colors.input.borderError, backgroundColor: colors.input.backgroundError },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 14, color: colors.input.text, paddingVertical: 0 },
    errorText: { fontSize: 11, color: colors.status.error, marginBottom: 6, marginLeft: 4 },

    textAreaWrapper: {
      borderWidth: 1.5, borderColor: colors.input.border, borderRadius: 12,
      backgroundColor: colors.input.background, padding: 12,
    },
    textAreaActive: { borderColor: colors.primary },
    textArea: { fontSize: 14, color: colors.input.text, minHeight: 70, lineHeight: 22 },

    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggleSub: { fontSize: 11, color: colors.text.quaternary, marginTop: 2 },

    submitBtn: {
      flexDirection: 'row', backgroundColor: colors.button.primary, borderRadius: 14,
      height: 54, justifyContent: 'center', alignItems: 'center', gap: 8,
      marginBottom: 12, elevation: 5, shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.38, shadowRadius: 10,
    },
    submitDisabled: { backgroundColor: colors.button.primaryDisabled },
    submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

    cancelBtn: { height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: colors.border },
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

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Stall' : 'Add New Stall'}</Text>
          <Text style={styles.headerSub}>{isEdit ? existingStall.name : 'Admin only'}</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Name */}
          <Text style={styles.label}>Stall Name <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrapper, errors.name ? styles.inputError : null]}>
            <Icon name="storefront-outline" size={17} color={errors.name ? colors.status.error : colors.input.icon} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Ah Chong Wonton Noodle"
              placeholderTextColor={colors.input.placeholder}
              autoCapitalize="words"
              value={form.name}
              onChangeText={v => update('name', v)}
            />
          </View>
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <View style={[styles.textAreaWrapper, form.description.length > 0 ? styles.textAreaActive : null]}>
            <TextInput
              style={styles.textArea}
              placeholder="Short description of the stall…"
              placeholderTextColor={colors.input.placeholder}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={form.description}
              onChangeText={v => update('description', v)}
            />
          </View>
        </View>

        {/* Cuisine picker */}
        <View style={styles.card}>
          <OptionPicker
            label="Cuisine Type *"
            options={CUISINES}
            value={form.cuisine}
            onChange={v => update('cuisine', v)}
            error={errors.cuisine}
          />
        </View>

        {/* Location picker */}
        <View style={styles.card}>
          <OptionPicker
            label="Location *"
            options={LOCATIONS}
            value={form.location}
            onChange={v => update('location', v)}
            error={errors.location}
          />
        </View>

        {/* Is Open toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.label}>Currently Open?</Text>
              <Text style={styles.toggleSub}>
                {form.isOpen ? 'This stall is open for business' : 'This stall is currently closed'}
              </Text>
            </View>
            <Switch
              value={form.isOpen}
              onValueChange={v => update('isOpen', v)}
              trackColor={{ false: colors.border, true: colors.badge }}
              thumbColor={form.isOpen ? colors.primary : colors.text.disabled}
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.88}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Icon name={isEdit ? 'save-outline' : 'add-circle-outline'} size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>{isEdit ? 'Save Changes' : 'Add Stall'}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StallFormScreen;
