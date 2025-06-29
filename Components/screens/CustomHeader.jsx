import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: '#ff9933',
        paddingTop: insets.top, // dynamic safe area padding
        paddingBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* 🔙 Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          left: 18,
          top: insets.top + 13,
        }}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text
        style={{
          color: '#fff',
          fontSize: 22,
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export default CustomHeader;
