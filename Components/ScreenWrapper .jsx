import React from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        backgroundColor: '#eef3f7',
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#eef3f7"
        translucent={false}
      />
      {children}
    </View>
  );
};

export default ScreenWrapper;
