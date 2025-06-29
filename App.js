import React, { useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './Navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Prevent auto-hide
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      try {
        // Simulate loading (e.g., fetch tokens, init state)
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the splash screen
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  return (
    <SafeAreaProvider>
    <Provider store={store}>
      <AppNavigator />
      <Toast />
    </Provider>
    </SafeAreaProvider>
  );
}
