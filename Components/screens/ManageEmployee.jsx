import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import ScreenWrapper from "../ScreenWrapper ";
import { StatusBar } from "react-native";

const FILTER_OPTIONS = [
  { key: "name", label: "Employee Name" },
  { key: "role", label: "Role" },
  { key: "date", label: "Joining Date" },
];

const ManageEmployee = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filterType, setFilterType] = useState("name");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  const BASE_URL = "http://192.168.81.224:5000/api/employees";

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      Toast.show({ type: "error", text1: "Failed to fetch employees" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await new Promise((resolve) => {
      Alert.alert(
        "Delete Employee",
        "Are you sure you want to remove this employee?",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]
      );
    });

    if (!confirm) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to delete employee");
      }

      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      Toast.show({
        type: "success",
        text1: result.message || "Employee deleted successfully",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const value = searchText.toLowerCase();
    switch (filterType) {
      case "name":
        return emp.name?.toLowerCase().includes(value);
      case "role":
        return emp.role?.toLowerCase().includes(value);
      case "date":
        return emp.joiningDate?.toLowerCase().includes(value);
      default:
        return true;
    }
  });

  const renderEmployeeCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.matCode}>
          <Icon name="account-circle-outline" size={18} /> {item.name}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDelete(item._id)}
          >
            <Icon name="delete" size={22} color="#d9534f" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.cardText}>
        <Icon name="phone-outline" size={16} /> Phone: {item.phone || "N/A"}
      </Text>
      <Text style={styles.cardText}>
        <Icon name="calendar" size={16} /> Joining Date:{" "}
        {item.joiningDate
          ? new Date(item.joiningDate).toLocaleDateString()
          : "N/A"}
      </Text>
      <Text style={styles.cardText}>
        <Icon name="map-marker-outline" size={16} /> Address:{" "}
        {item.address || "N/A"}
      </Text>
      <Text style={styles.cardText}>
        <Icon name="cash" size={16} /> Salary/Day: ₹{item.salaryPerDay || "N/A"}
      </Text>
      <Text style={styles.cardText}>
        <Icon name="briefcase-check-outline" size={16} /> Assigned Projects:{" "}
        {item.assignedProjects?.length > 0
          ? item.assignedProjects
              .map((p) => (typeof p === "object" ? p.name : p))
              .join(", ")
          : "None"}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <StatusBar backgroundColor="#ff9933" barStyle="light-content" />
      <View style={styles.filterRow}>
        <Pressable
          style={styles.filterTypeBtn}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter" size={18} color="#fff" />
          <Text style={styles.filterTypeBtnText}>
            {FILTER_OPTIONS.find((f) => f.key === filterType)?.label}
          </Text>
          <Icon name="chevron-down" size={18} color="#fff" />
        </Pressable>
      </View>

      <TextInput
        style={styles.filterInput}
        placeholder={`Search by ${filterType}`}
        value={searchText}
        onChangeText={setSearchText}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff9933" />
          <Text style={{ marginTop: 10, color: "#555" }}>
            Loading Employees...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item._id}
          renderItem={renderEmployeeCard}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No employees found.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowFilterModal(false);
            Keyboard.dismiss();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {FILTER_OPTIONS.map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => {
                    setFilterType(key);
                    setSearchText("");
                    setShowFilterModal(false);
                  }}
                  style={styles.modalOption}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      filterType === key && { fontWeight: "bold" },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Toast />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    marginVertical: 12,
    alignItems: "center",
  },
  filterTypeBtn: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  filterTypeBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginHorizontal: 6,
  },
  filterInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 17,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  matCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  cardActions: {
    flexDirection: "row",
  },
  iconBtn: {
    marginLeft: 14,
  },
  cardText: {
    fontSize: 15,
    marginTop: 4,
    color: "#444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "80%",
    paddingVertical: 20,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 18,
    color: "#222",
  },
});

export default ManageEmployee;
