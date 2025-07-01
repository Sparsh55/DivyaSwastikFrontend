import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";

const employeeImg = require("../../assets/incorporation.png");

const AddNewEmployeeScreen = () => {
  const navigation = useNavigation();
  const projectId = useSelector((state) => state.project.currentProject?._id);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("user");
  const [salary, setSalary] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [joiningDate, setJoiningDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await axios.get(
          "http://192.168.81.224:5000/api/projects",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const formatted = response.data.data.projects.map((proj) => ({
          id: proj._id,
          name: proj.name,
        }));
        setProjects(formatted);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        Alert.alert("Error", "Failed to load projects.");
      }
    };

    fetchProjects();
  }, []);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date) => {
    setJoiningDate(date);
    hideDatePicker();
  };

  const toggleProjectSelection = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !phone || !salary || selectedProjects.length === 0) {
      Alert.alert("Validation Error", "Please fill all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      await axios.post(
        "http://192.168.81.224:5000/api/employees",
        {
          name,
          phone,
          address,
          role,
          salaryPerDay: salary,
          assignedProjects: selectedProjects,
          joiningDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Employee added successfully!");
      navigation.navigate('ManageEmployee');
    } catch (err) {
      console.error("Error adding employee:", err);
      Alert.alert("Error", "Failed to add employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={30} color="#ff9933" />
        </TouchableOpacity>
        <Image
          source={employeeImg}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>Add Employee</Text>

        {/* Inputs */}
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#ff9933" />
          <TextInput
            style={styles.inputWithIcon}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
          />
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#ff9933" />
          <TextInput
            style={styles.inputWithIcon}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
          />
        </View>

        <Text style={styles.label}>Address(Optional)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#ff9933" />
          <TextInput
            style={styles.inputWithIcon}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.label}>Salary Per Day (₹)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="cash-outline" size={20} color="#ff9933" />
          <TextInput
            style={styles.inputWithIcon}
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            placeholder="Enter salary"
          />
        </View>

        {/* Custom Modal Picker */}
        <Text style={styles.label}>Assign to Projects</Text>
        <TouchableOpacity
          style={styles.dropdownSelector}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="briefcase-outline" size={20} color="#ff9933" />
          <Text style={styles.dateText}>
            {selectedProjects.length > 0
              ? `${selectedProjects.length} project(s) selected`
              : "Select Projects"}
          </Text>
        </TouchableOpacity>

        {/* Modal Project Picker */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Projects</Text>
              <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => toggleProjectSelection(item.id)}
                  >
                    <Ionicons
                      name={
                        selectedProjects.includes(item.id)
                          ? "checkbox-outline"
                          : "square-outline"
                      }
                      size={22}
                      color="#ff9933"
                    />
                    <Text style={styles.checkboxLabel}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <View style={styles.modalButtonRow}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: "#333", fontWeight: "600" }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: "#ff9933" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker */}
        <Text style={styles.label}>Joining Date</Text>
        <TouchableOpacity style={styles.dateInput} onPress={showDatePicker}>
          <Ionicons name="calendar-outline" size={20} color="#ff9933" />
          <Text style={styles.dateText}>{joiningDate.toDateString()}</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />

        <TouchableOpacity
          style={[
            styles.button,
            isSubmitting && { backgroundColor: "green" }, // ✅ override color
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Adding..." : "Add Employee"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F1F2F6",
    flexGrow: 1,
  },
  backButton: {
    position: "absolute",
    top: 60, // adjust for platform status bar
    left: 10,
    zIndex: 10,
  },
  headerImage: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    marginBottom: 14,
    elevation: 6,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingLeft: 10,
  },
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 14,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 14,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#ff9933",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
    textAlign: "center",
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },

  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 4,
  },
  modalDoneButton: {
    marginTop: 20,
    backgroundColor: "#ff9933",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
});

export default AddNewEmployeeScreen;
