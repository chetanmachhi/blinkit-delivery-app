import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from './src/api/client';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ConfirmHost, ToastHost } from './src/components/Feedback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: (failureCount, error) => {
        // Don't hammer the server on 4xx (auth, not found, etc).
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
        <ToastHost />
        <ConfirmHost />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
