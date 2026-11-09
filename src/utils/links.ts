import { Linking, Platform } from 'react-native';
import { toast } from '../store/ui.store';

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
    toast('This address has no map location.', 'error', 'No location');
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
    toast('Please install Google Maps.', 'error', 'Could not open maps');
  }
};

export const callPhone = async (phone?: string | null): Promise<void> => {
  if (!phone) return;
  try {
    await Linking.openURL(`tel:${phone}`);
  } catch {
    toast(phone, 'error', 'Could not start call');
  }
};
