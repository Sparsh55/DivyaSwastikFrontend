import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setProject } from "../../redux/projectSlice";
import { Vibration } from "react-native";

const API_BASE_URL = "http://192.168.133.224:5000/api/projects";

const CreateNewProject = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleSubmit = async () => {
    Vibration.vibrate(100);
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Enter project name",
        visibilityTime: 1000,
      });
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.post(
        `${API_BASE_URL}`,
        {
          name: name.trim(),
          startDate: formatDate(startDate),
          description: description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const createdProjectId = response.data.data._id; // adjust based on actual API
        if (createdProjectId) {
          dispatch(setProject(response.data.data)); // ✅ SET to Redux
        }
        Toast.show({
          type: "success",
          text1: "Project created successfully",
          visibilityTime: 3000,
        });
        navigation.navigate("Projectdashboard", {
          successMsg: `${name} created successfully`,
        });
      } else {
        throw new Error(response.data.message || "Failed to create project");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || error.message || "Something went wrong",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={30} color="#ff9933" />
      </TouchableOpacity>

      <Image
        source={require("../../assets/add.png")} // 🔁 Replace with your PNG path
        style={styles.headerImage}
      />

      <Text style={styles.title}>Create New Project</Text>

      {/* Project Name */}
      <Text style={styles.label}>Project Name</Text>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="create-outline"
          size={20}
          color="#ff9933"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your project name"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Start Date */}
      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color="#ff9933"
          style={styles.icon}
        />
        <View style={styles.input}>
          <Text style={{ color: "#000" }}>{formatDate(startDate)}</Text>
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}

      {/* Description */}
      <Text style={styles.label}>Description (optional)</Text>
      <View style={[styles.inputWrapper, { height: 100 }]}>
        <Ionicons
          name="document-text-outline"
          size={20}
          color="#ff9933"
          style={[styles.icon, { top: 12 }]}
        />
        <TextInput
          style={[
            styles.input,
            { height: 100, textAlignVertical: "top", paddingLeft: 40 },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          placeholderTextColor="#aaa"
          multiline
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Create Project"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateNewProject;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    flexGrow: 1,
    backgroundColor: "#F1F2F6",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 10,
    zIndex: 10,
    
  },

  headerImage: {
  width: 60,
  height: 80,
  alignSelf: "center",
  marginBottom: 1,
},
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  icon: {
    position: "absolute",
    top: 14,
    left: 12,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    elevation: 7,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  button: {
    backgroundColor: "#ff9933",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
     elevation: 6,
    
  },
  disabled: {
    backgroundColor: "green",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
