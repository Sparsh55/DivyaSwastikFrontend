import React from 'react';
import { View, StatusBar, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}> {/* Bottom nav bar remains white */}
      {/* TOP safe area matches container color */}
      <View style={{ height: insets.top, backgroundColor: '#eef3f7' }} />

      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="#ff9933"
      />

      {/* Main screen area with your custom container color */}
      <View style={styles.container}>
        {children}
      </View>

      {/* Bottom safe area remains white (matches screen wrapper bg) */}
      <View style={{ height: insets.bottom, backgroundColor: '#ffffff' }} />
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3f7',
    paddingHorizontal: 16,
  },
});
