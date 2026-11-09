import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CircleCheck, Info, X } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../config/theme';
import { useUiStore } from '../store/ui.store';
import { AppText } from './AppText';
import { Button } from './Button';

const TOAST_MS = 2600;

const TOAST_STYLE = {
  success: { bg: colors.primaryDark, Icon: CircleCheck },
  error: { bg: colors.danger, Icon: AlertCircle },
  info: { bg: colors.text, Icon: Info },
};

/** Slide-down banner at the top of the screen. Mounted once in App. */
export const ToastHost: React.FC = () => {
  const insets = useSafeAreaInsets();
  const toast = useUiStore(s => s.toast);
  const hideToast = useUiStore(s => s.hideToast);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }).start();
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => hideToast());
    }, TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast, anim, hideToast]);

  if (!toast) return null;
  const { bg, Icon } = TOAST_STYLE[toast.type];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toastWrap,
        {
          top: insets.top + spacing.sm,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
        },
      ]}
    >
      <Pressable
        onPress={hideToast}
        style={[styles.toast, { backgroundColor: bg }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Icon size={20} color={colors.white} />
        <View style={styles.toastText}>
          {toast.title ? (
            <AppText variant="sm" weight="bold" color={colors.white}>
              {toast.title}
            </AppText>
          ) : null}
          <AppText variant="sm" weight={toast.title ? 'regular' : 'semibold'} color={colors.white}>
            {toast.message}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
};

/** Bottom-sheet confirmation. Mounted once in App, driven by confirmAsync(). */
export const ConfirmHost: React.FC = () => {
  const insets = useSafeAreaInsets();
  const confirm = useUiStore(s => s.confirm);
  const closeConfirm = useUiStore(s => s.closeConfirm);

  return (
    <Modal
      visible={!!confirm}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => closeConfirm(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => closeConfirm(false)} accessibilityLabel="Close" />
      {confirm ? (
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <AppText variant="lg" weight="bold" style={styles.flex}>
              {confirm.title}
            </AppText>
            <TouchableOpacity onPress={() => closeConfirm(false)} hitSlop={12} accessibilityLabel="Close">
              <X size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          {confirm.message ? (
            <AppText color={colors.textMuted} style={styles.message}>
              {confirm.message}
            </AppText>
          ) : null}
          {confirm.highlight ? (
            <View style={styles.highlight}>
              <AppText variant="md" weight="bold" color={colors.warning}>
                {confirm.highlight}
              </AppText>
            </View>
          ) : null}
          <View style={styles.actions}>
            <Button
              title={confirm.cancelText || 'Cancel'}
              variant="outline"
              size="large"
              onPress={() => closeConfirm(false)}
              style={styles.flex}
            />
            <Button
              title={confirm.confirmText || 'Confirm'}
              variant={confirm.tone === 'danger' ? 'danger' : 'primary'}
              size="large"
              onPress={() => closeConfirm(true)}
              style={[styles.flex, styles.confirmBtn]}
            />
          </View>
        </View>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  toastWrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, zIndex: 1000, elevation: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.floating,
  },
  toastText: { marginLeft: spacing.md, flex: 1 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg * 1.5,
    borderTopRightRadius: radii.lg * 1.5,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center' },
  message: { marginTop: spacing.sm },
  highlight: {
    marginTop: spacing.lg,
    backgroundColor: colors.warningSoft,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  actions: { flexDirection: 'row', marginTop: spacing.xl },
  confirmBtn: { marginLeft: spacing.md },
});
