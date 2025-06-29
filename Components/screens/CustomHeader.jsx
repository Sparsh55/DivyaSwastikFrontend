import { View, Text, SafeAreaView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView
        style={{
          backgroundColor: "#ff9933",
        }}
      >
        <View
          style={{
            height: 70,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* 🔙 Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: "absolute", left: 16, top: Platform.OS === 'android' ?  (StatusBar.currentHeight || 24) + 4 : 48,     }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom:10
            }}
          >
            {title}
          </Text>
        </View>
      </SafeAreaView>
  );
};


export default CustomHeader;