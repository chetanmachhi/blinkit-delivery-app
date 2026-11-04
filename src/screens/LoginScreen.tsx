import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bike } from 'lucide-react-native';
import { deliveryApi } from '../api/delivery.api';
import { getErrorMessage } from '../api/client';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { env } from '../config/env';
import { colors, radii, spacing } from '../config/theme';
import { useAuthStore } from '../store/auth.store';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore(s => s.signIn);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = phone.trim().length >= 10 && password.length > 0;

  const onSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { accessToken, rider } = await deliveryApi.login(phone.trim(), password);
      await signIn(accessToken, rider);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + spacing.xxxl }]}>
          <View style={styles.logo}>
            <Bike size={40} color={colors.text} />
          </View>
          <AppText variant="xxl" weight="bold">
            blinkit
          </AppText>
          <AppText variant="base" weight="medium" color={colors.text}>
            Delivery Partner
          </AppText>
        </View>

        <View style={styles.form}>
          <AppText variant="lg" weight="bold" style={styles.title}>
            Log in to start delivering
          </AppText>

          <AppText variant="sm" weight="medium" color={colors.textMuted}>
            Phone number
          </AppText>
          <TextInput
            value={phone}
            onChangeText={t => setPhone(t.replace(/[^\d+]/g, ''))}
            placeholder="10-digit mobile number"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
            maxLength={13}
            style={styles.input}
            returnKeyType="next"
            accessibilityLabel="Phone number"
          />

          <AppText variant="sm" weight="medium" color={colors.textMuted}>
            Password
          </AppText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.textLight}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            accessibilityLabel="Password"
          />

          {error ? (
            <View style={styles.error}>
              <AppText variant="sm" color={colors.danger}>
                {error}
              </AppText>
            </View>
          ) : null}

          <Button
            title="Log in"
            size="large"
            onPress={onSubmit}
            loading={loading}
            disabled={!canSubmit}
          />

          <AppText variant="xs" color={colors.textMuted} style={styles.hint}>
            {env.DEMO_LOGIN_HINT}
          </AppText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1 },
  hero: {
    backgroundColor: colors.headerYellow,
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: radii.lg * 2,
    borderBottomRightRadius: radii.lg * 2,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  form: { padding: spacing.xxl },
  title: { marginBottom: spacing.xl },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  error: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  hint: { textAlign: 'center', marginTop: spacing.lg },
});
