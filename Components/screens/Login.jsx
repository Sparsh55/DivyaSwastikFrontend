import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Vibration } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const LoginScreen = ({ navigation, route }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpVerifiedMessage, setOtpVerifiedMessage] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    if (route?.params?.otpVerified === true) {
      setOtpVerifiedMessage("OTP verified successfully!");
      if (route.params.username) setUsername(route.params.username);
      if (route.params.password) setPassword(route.params.password);
      setTimeout(() => setOtpVerifiedMessage(""), 4000);
    }
  }, [route?.params?.otpVerified]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Permission to access gallery is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
  };

  const handleSubmit = async () => {
    Vibration.vibrate(100);
    if (!username || !password) {
      Alert.alert("Error", "Username and password are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      if (profilePicture) {
        const uriParts = profilePicture.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("loginImage", {
          uri: profilePicture,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(
        "http://192.168.81.224:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        Alert.alert("Login Failed", data.message || "Something went wrong");
        return;
      }

      navigation.navigate("OtpScreen", {
        userId: data.data.userId,
        otp: data.data.otp,
        expiresAt: data.data.expiresAt,
        username,
        password,
      });

      setUsername("");
      setPassword("");
      setProfilePicture(null);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An error occurred during login");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#ff9933" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../../assets/77c9a4a2-a908-417c-99ab-884bff00444b.jpeg")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.tagline}>#We Care</Text>
              </View>

              <View style={styles.card}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.title}>Welcome Back!</Text>
                  <Text style={styles.subtitle}>
                    Please sign in to your account.
                  </Text>

                  <View style={styles.form}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Username *</Text>
                      <View style={styles.inputIconContainer}>
                        <Ionicons
                          name="person"
                          size={22}
                          color="#ff9933"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.inputWithIcon}
                          placeholder="Enter your username"
                          value={username}
                          onChangeText={setUsername}
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Password *</Text>
                      <View style={styles.inputIconContainer}>
                        <Ionicons
                          name="lock-closed"
                          size={22}
                          color="#ff9933"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.inputWithIcon}
                          placeholder="Enter your password"
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={setPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={22}
                            color="#ff9933"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Profile Picture (optional)
                      </Text>
                      <TouchableOpacity
                        onPress={pickImage}
                        style={styles.imagePicker}
                      >
                        {profilePicture ? (
                          <>
                            <View style={styles.imagePreviewWrapper}>
                              <Image
                                source={{ uri: profilePicture }}
                                style={styles.profileImage}
                              />
                              <TouchableOpacity
                                onPress={removeProfilePicture}
                                style={styles.removeImageButton}
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={20}
                                  color="#ff4444"
                                />
                              </TouchableOpacity>
                              <Text style={styles.imagePickerText}>Change</Text>
                            </View>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name="camera"
                              size={20}
                              color="#ff9933"
                              style={{ marginRight: 8 }}
                            />
                            <Text style={styles.imagePickerText}>
                              Choose Photo
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>

                    {otpVerifiedMessage !== "" && (
                      <Text style={styles.otpSuccess}>
                        {otpVerifiedMessage}
                      </Text>
                    )}

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ff9933",
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 110,
    height: 110,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  logo: {
    width: 90,
    height: 90,
  },
  tagline: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
  },
  card: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.7,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    marginTop: -10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  inputIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 16,
    height: 50,
  },
  otpSuccess: {
    color: "green",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#ff9933",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9e9e9",
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  imagePickerText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#bbb",
  },

  imagePreviewWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  removeImageButton: {
    position: "absolute",
    top: -4,
    left: 28, // Keep it *inside* the image
    backgroundColor: "#fff",
    borderRadius: 10,
    zIndex: 2,
  },
});
