import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { deliveryApi } from '../api/delivery.api';
import { FullScreenLoader } from '../components/ui';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAuthStore } from '../store/auth.store';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const status = useAuthStore(s => s.status);
  const bootstrap = useAuthStore(s => s.bootstrap);
  const setRider = useAuthStore(s => s.setRider);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Refresh the profile once signed in. This also validates a restored
  // token: a 401 here sends the rider back to login via the API client.
  useEffect(() => {
    if (status === 'signedIn') {
      deliveryApi.me().then(setRider).catch(() => {});
    }
  }, [status, setRider]);

  if (status === 'loading') {
    return <FullScreenLoader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {status === 'signedIn' ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
