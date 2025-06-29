import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { Platform } from "react-native";
import { Image } from "react-native";

const AddUserScreen = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [toggleWidth, setToggleWidth] = useState(0);
  const [project, setProject] = useState("");
  const [projects, setProjects] = useState([]);

  const slideAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: role === "admin" ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [role]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProjects = async () => {
        try {
          const token = await AsyncStorage.getItem("userToken");
          const response = await axios.get(
            "http://192.168.81.224:5000/api/projects",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const formattedProjects = response.data.data.projects.map((proj) => ({
            label: proj.name,
            value: proj._id,
          }));
          setProjects(formattedProjects);
        } catch (error) {
          Toast.show({ type: "error", text1: "Failed to load projects" });
        }
      };

      fetchProjects();
    }, [])
  );

  const handleSubmit = async () => {
    if (!username.trim()) {
      Toast.show({ type: "error", text1: "Username is required" });
      return;
    }
    if (username.trim().length < 3) {
      Toast.show({
        type: "error",
        text1: "Username must be at least 3 characters",
      });
      return;
    }
    if (!password) {
      Toast.show({ type: "error", text1: "Password is required" });
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 6 characters",
      });
      return;
    }
    if (!phoneNumber) {
      Toast.show({ type: "error", text1: "Phone number is required" });
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      Toast.show({
        type: "error",
        text1: "Phone number must be exactly 10 digits",
      });
      return;
    }
    if (!role) {
      Toast.show({ type: "error", text1: "Role is required" });
      return;
    }
    if (!project) {
      Toast.show({ type: "error", text1: "Project assigned is required" });
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      await axios.post(
        "http://192.168.81.224:5000/api/users",
        {
          username: username.trim(),
          password,
          phone: phoneNumber,
          role,
          projectAssigned: project,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Toast.show({
        type: "success",
        text1: `${username} added as ${role}`,
      });

      setUsername("");
      setPassword("");
      setPhoneNumber("");
      setRole("user");
      setProject("");
      setLoading(false);
      navigation.goBack();
    } catch (err) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Failed to add user",
        text2: err.response?.data?.message || err.message,
      });
    }
  };

  const interpolatedSlide = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, toggleWidth / 2],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="chevron-back" size={30} color="#ff9933" />
      </TouchableOpacity>
      <View style={styles.titleSection}>
        <Image
          source={require("../../assets/add-contact.png")} // Replace with your actual image path
          style={styles.titleImage}
        />
        <Text style={styles.title}>Add New User</Text>
      </View>

      {/* Username */}
      <Text style={styles.label}>Username</Text>
      <View style={styles.inputWrapper}>
        <Icon
          name="person-outline"
          size={20}
          color="#ff9933"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputWrapper}>
        <Icon
          name="lock-closed-outline"
          size={20}
          color="#ff9933"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#ff9933"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Phone Number */}
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.inputWrapper}>
        <Icon
          name="call-outline"
          size={20}
          color="#ff9933"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
        />
      </View>

      {/* Project */}
      <Text style={styles.label}>Project Assigned</Text>
      <View style={styles.inputWrapper}>
        <Icon
          name="business-outline"
          size={20}
          color="#ff9933"
          style={styles.icon}
        />
        <View style={styles.pickerFlex}>
          <RNPickerSelect
            onValueChange={(value) => setProject(value)}
            value={project}
            placeholder={{ label: "Select a project", value: null }}
            items={projects}
            style={{
              inputIOS: styles.pickerText,
              inputAndroid: styles.pickerText,
              placeholder: { color: "#aaa" },
            }}
          />
        </View>
      </View>

      {/* Role Toggle */}
      <Text style={styles.label}>Role</Text>
      <View
        style={styles.toggleContainer}
        onLayout={(event) => setToggleWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            styles.toggleSlider,
            {
              width: toggleWidth / 2,
              transform: [{ translateX: interpolatedSlide }],
            },
          ]}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setRole("admin")}
        >
          <Text
            style={[styles.toggleText, role === "admin" && styles.activeText]}
          >
            Admin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setRole("user")}
        >
          <Text
            style={[styles.toggleText, role === "user" && styles.activeText]}
          >
            User
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Adding..." : "Add User"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddUserScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F1F2F6",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top:  70,
    left: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  titleImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#555",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 50,
    elevation: 7,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  pickerFlex: {
    flex: 1,
  },
  pickerText: {
    fontSize: 16,
    color: "#000",
    paddingVertical: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
    height: 45,
    marginBottom: 24,
  },
  toggleSlider: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#007bff",
    borderRadius: 30,
    zIndex: 0,
  },
  toggleButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  activeText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#ff9933",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  disabled: {
    backgroundColor: "#7fbfff",
  },
});
