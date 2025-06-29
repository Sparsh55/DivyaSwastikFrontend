import React, { useRef, useState, useEffect } from "react";
import { Vibration } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/userSlice";
import otpImage from "../../assets/one-time-password.png";

const API_BASE_URL = "http://192.168.81.224:5000/api";

const OtpScreen = ({ navigation, route }) => {
  const { userId = "", phoneNumber = "", otpId = "" } = route?.params || {};

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(300);
  const [timerActive, setTimerActive] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef([]);
  const dispatch = useDispatch();

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text && index < 3) inputsRef.current[index + 1]?.focus();
      if (!text && index > 0) inputsRef.current[index - 1]?.focus();
    }
  };

  const resendOtp = async () => {
    setIsResending(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        userId,
        phoneNumber,
      });

      if (response.data.success) {
        Alert.alert("OTP Resent", "A new OTP has been sent to your number");
        setTimer(180);
        setTimerActive(true);
        setOtp(["", "", "", ""]);
        inputsRef.current[0]?.focus();
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const verifyOtp = async () => {
    Vibration.vibrate(100); 
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      Alert.alert("Error", "Please enter all 4 digits");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        userId,
        otp: enteredOtp,
        otpId,
      });

      if (response.data.success) {
        const token = response.data.data?.token;
        const user = response.data.data?.user;

        if (token) {
          await AsyncStorage.setItem("userToken", token);
        }

        dispatch(setUserInfo(user));
        navigation.replace("Dashboard", { user, token });
      } else {
        Alert.alert("Verification Failed", response.data.message || "Invalid OTP");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={30} color="#ff9933" />
          </TouchableOpacity>

          <Image source={otpImage} style={styles.image} />
          <Text style={styles.heading}>Verify OTP</Text>

          <Text style={styles.info}>
            We've sent an OTP to your registered mobile number.
            {timerActive && ` It will expire in ${formatTime(timer)}.`} Please enter it below to continue.
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputsRef.current[index] = ref)}
                style={styles.otpBox}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                textAlign="center"
                editable={!isVerifying && !isResending}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              isVerifying ? styles.verifyingButton : null,
              isResending && styles.disabledButton,
            ]}
            onPress={verifyOtp}
            disabled={isVerifying || isResending}
          >
            <Text style={styles.verifyButtonText}>
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resendOtp}
            disabled={timerActive || isVerifying || isResending}
          >
            {isResending ? (
              <ActivityIndicator color="#4287f5" />
            ) : (
              <Text
                style={[
                  styles.resendText,
                  (timerActive || isVerifying || isResending) && styles.disabledText,
                ]}
              >
                Resend OTP
              </Text>
            )}
          </TouchableOpacity>

          {timerActive && (
            <Text style={styles.timerText}>
              You can resend OTP in {formatTime(timer)}
            </Text>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },
  image: {
    width: 70,
    height: 80,
    resizeMode: "contain",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  info: {
    marginBottom: 30,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "#999",
    width: 50,
    height: 50,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 8,
    backgroundColor: "#f5f5f5",
  },
  verifyButton: {
    backgroundColor: "#ff9933",
    paddingVertical: 14,
    paddingHorizontal: 70,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyingButton: {
    backgroundColor: "#28a745", // green while verifying
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendText: {
    color: "#4287f5",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  disabledText: {
    color: "#ccc",
  },
  timerText: {
    marginTop: 15,
    fontSize: 14,
    color: "#888",
  },
});

export default OtpScreen;
