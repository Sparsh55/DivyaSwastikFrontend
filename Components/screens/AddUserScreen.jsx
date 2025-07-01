import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  Pressable,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

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
  const [modalVisible, setModalVisible] = useState(false);

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
          const response = await axios.get("http://192.168.81.224:5000/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          });

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
    if (
      !username.trim() ||
      username.trim().length < 3 ||
      !password ||
      password.length < 6 ||
      !phoneNumber ||
      !/^\d{10}$/.test(phoneNumber) ||
      !role ||
      !project
    ) {
      Toast.show({ type: "error", text1: "Please fill all required fields correctly." });
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      await axios.post("http://192.168.81.224:5000/api/users", {
        username: username.trim(),
        password,
        phone: phoneNumber,
        role,
        projectAssigned: project,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Toast.show({ type: "success", text1: `${username} added as ${role}` });

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="chevron-back" size={30} color="#ff9933" />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <Image source={require("../../assets/add-contact.png")} style={styles.titleImage} />
            <Text style={styles.title}>Add New User</Text>
          </View>

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <Icon name="person-outline" size={20} color="#ff9933" style={styles.icon} />
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter username" />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock-closed-outline" size={20} color="#ff9933" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#ff9933" style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Icon name="call-outline" size={20} color="#ff9933" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Project Assigned</Text>
          <TouchableOpacity style={styles.dropdownSelector} onPress={() => setModalVisible(true)}>
            <Icon name="business-outline" size={20} color="#ff9933" />
            <Text style={styles.dateText}>
              {project ? projects.find((p) => p.value === project)?.label : "Select a project"}
            </Text>
          </TouchableOpacity>

          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select a Project</Text>
                <FlatList
                  data={projects}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.checkboxItem}
                      onPress={() => setProject(item.value)}
                    >
                      <Icon
                        name={project === item.value ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color="#ff9933"
                      />
                      <Text style={styles.checkboxLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
                <View style={styles.modalButtonRow}>
                  <Pressable style={[styles.modalButton, { backgroundColor: "#ccc" }]} onPress={() => setModalVisible(false)}>
                    <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, { backgroundColor: "#ff9933" }]} onPress={() => setModalVisible(false)}>
                    <Text style={{ color: "#fff", fontWeight: "600" }}>Done</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Text style={styles.label}>Role</Text>
          <View style={styles.toggleContainer} onLayout={(e) => setToggleWidth(e.nativeEvent.layout.width)}>
            <Animated.View
              style={[styles.toggleSlider, { width: toggleWidth / 2, transform: [{ translateX: interpolatedSlide }] }]}
            />
            <TouchableOpacity style={styles.toggleButton} onPress={() => setRole("admin")}>
              <Text style={[styles.toggleText, role === "admin" && styles.activeText]}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleButton} onPress={() => setRole("user")}>
              <Text style={[styles.toggleText, role === "user" && styles.activeText]}>User</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Adding..." : "Add User"}</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AddUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F1F2F6",
  },
  backButton: { position: "absolute", top: 70, left: 10, zIndex: 10 },
  titleSection: { alignItems: "center", marginBottom: 10 },
  titleImage: { width: 40, height: 40, marginBottom: 10 , marginTop:40,},
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", color: "#333" },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#555" },
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
    elevation: 6,
  },
  input: { flex: 1, fontSize: 16, color: "#000" },
  icon: { marginRight: 10 },
  eyeIcon: { paddingLeft: 10 },
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 20,
    elevation: 6,
  },
  dateText: { marginLeft: 10, fontSize: 15, color: "#333" },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 30,
    overflow: "hidden",
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
  toggleButton: { flex: 1, justifyContent: "center", alignItems: "center", zIndex: 1 },
  toggleText: { fontSize: 16, fontWeight: "600", color: "#333" },
  activeText: { color: "#fff" },
  button: {
    backgroundColor: "#ff9933",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 6,
  },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  disabled: { backgroundColor: "green" },
  modalBackdrop: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { margin: 20, backgroundColor: "#fff", borderRadius: 10, padding: 20, maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 14, textAlign: "center" },
  checkboxItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  checkboxLabel: { marginLeft: 10, fontSize: 15, color: "#333" },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 4,
  },
});
