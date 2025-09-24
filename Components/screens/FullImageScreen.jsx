import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const FullImageScreen = ({ navigation }) => {
  const user = useSelector((state) => state.user.user);

  const profileImageUri = user?.image
    ? `http://192.168.133.224:5000/${user.image.replace(/\\/g, '/')}`
    : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      {profileImageUri ? (
        <Image
          source={{ uri: profileImageUri }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
});

export default FullImageScreen;
