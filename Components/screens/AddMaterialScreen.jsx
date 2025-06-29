import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Vibration
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddMaterialScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const [materialCode, setMaterialCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [document, setDocument] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const handleSubmit = async () => {
    Vibration.vibrate(100);
    if (isSubmitting) return; // Prevent double tap
    if (!materialCode || !quantity || !date) {
      Alert.alert("Validation Error", "Please fill all required fields.");
      return;
    }
    setIsSubmitting(true); // Start submitting

    try {
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();

      formData.append("matCode", materialCode);
      formData.append("quantity", quantity);
      formData.append("amount", amount);
      formData.append("addedBy", "admin");
      formData.append("date", date.toISOString());
      formData.append("projectAssigned", projectId);

      if (document) {
        const uriParts = document.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("document", {
          uri: document.uri,
          name: document.name || `file.${fileType}`,
          type: document.mimeType || `application/${fileType}`,
        });
      }

      const response = await fetch(
        "http://192.168.81.224:5000/api/materials/add",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add token here
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Material added successfully!", [
          {
            text: "OK",
            onPress: () => {
              setMaterialCode("");
              setQuantity("");
              setAmount("");
              setDate(new Date());
              setDocument(null);
              navigation.navigate("ManageInventory");
              setIsSubmitting(false);
            },
          },
        ]);
      } else {
        Alert.alert("Error", result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "Failed to add material. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={30} color="#ff9933" />
      </TouchableOpacity>

      {/* Title with PNG */}
      <View style={styles.titleSection}>
        <Image
          source={require("../../assets/add-cart.png")} // Make sure the path is correct
          style={styles.titleImage}
        />
        <Text style={styles.title}>Add Material</Text>
      </View>

      {/* Material Code */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Material Code</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="cube-outline"
            size={20}
            color="#ff9933"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={materialCode}
            onChangeText={setMaterialCode}
            placeholder="Enter Material Code"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Quantity */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Quantity</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="layers-outline"
            size={20}
            color="#ff9933"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Enter Quantity"
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Amount */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount (₹) (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="cash-outline"
            size={20}
            color="#ff9933"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter Amount"
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Receiving Date */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Receiving Date</Text>
        <TouchableOpacity onPress={showDatePicker} style={styles.dateInput}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#ff9933"
            style={styles.inputIcon}
          />
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </View>

      {/* Attach Document */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Attach Document(Optional)</Text>
        <View style={styles.uploadButton}>
          {document ? (
            <View style={styles.documentRow}>
              <Ionicons name="document-outline" size={20} color="#ff9933" />
              <Text style={styles.uploadText}>{document.name}</Text>
              <TouchableOpacity onPress={() => setDocument(null)}>
                <Text style={styles.crossText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickDocument}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#ff9933" />
              <Text style={[styles.uploadText, { marginLeft: 8 }]}>
                Upload Document
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: isSubmitting ? "green" : "#ff9933" },
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: "#F1F2F6",
    flexGrow: 1,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 10,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#444",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    elevation: 7,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: "#e8e8e8",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbb",
  },
  uploadText: {
    color: "#555",
    fontSize: 15,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  crossText: {
    color: "#ff4444",
    fontSize: 18,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#ff9933",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    elevation:6
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
