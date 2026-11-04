import { Alert, Linking, Platform } from 'react-native';

/**
 * Hands navigation off to Google Maps. No maps SDK or API key needed.
 * Android: tries turn-by-turn two-wheeler navigation first, then the
 * universal directions URL (opens the Maps app, or the browser as a fallback).
 */
export const openDirections = async (
  lat: number | null,
  lng: number | null,
  fallbackAddress?: string,
): Promise<void> => {
  const destination =
    lat !== null && lng !== null
      ? `${lat},${lng}`
      : fallbackAddress
      ? encodeURIComponent(fallbackAddress)
      : null;

  if (!destination) {
    Alert.alert('No location', 'This address has no map location.');
    return;
  }

  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

  if (Platform.OS === 'android') {
    try {
      // mode=l is two-wheeler navigation in Google Maps
      await Linking.openURL(`google.navigation:q=${destination}&mode=l`);
      return;
    } catch {
      // Google Maps app missing: fall through to the web URL.
    }
  }

  try {
    await Linking.openURL(webUrl);
  } catch {
    Alert.alert('Could not open maps', 'Please install Google Maps.');
  }
};

export const callPhone = async (phone?: string | null): Promise<void> => {
  if (!phone) return;
  try {
    await Linking.openURL(`tel:${phone}`);
  } catch {
    Alert.alert('Could not start call', phone);
  }
};
