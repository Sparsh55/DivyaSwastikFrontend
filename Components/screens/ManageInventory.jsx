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
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenWrapper from "../ScreenWrapper";
import { StatusBar } from "react-native";
import { Linking } from "react-native";

const FILTER_OPTIONS = [
  { key: "code", label: "Material Code" },
  { key: "date", label: "Date" },
  { key: "addedBy", label: "Added By" },
];

const ManageInventory = () => {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [filterType, setFilterType] = useState("code");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [designSearchText, setDesignSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const BASE_URL = "http://192.168.81.224:5000/api/materials";

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (filterType === "date" && selectedDate) {
      setSearchText(selectedDate.toISOString().slice(0, 10));
    }
  }, [selectedDate, filterType]);

  const fetchMaterials = async () => {
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
      setMaterials(data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      Toast.show({ type: "error", text1: "Failed to fetch materials" });
    } finally {
      setLoading(false); // 🔵 hide loader
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirm = await new Promise((resolve) => {
        Alert.alert(
          "Delete Confirmation",
          "Are you sure you want to delete this material record?",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => resolve(true),
            },
          ],
          { cancelable: true }
        );
      });

      if (!confirm) return;
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({ type: "success", text1: "Material deleted successfully" });
        // Remove deleted material from local state
        setMaterials((prev) => prev.filter((mat) => mat._id !== id));
      } else {
        Toast.show({
          type: "error",
          text1: data.error || "Failed to delete material",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      Toast.show({ type: "error", text1: "An error occurred while deleting" });
    } finally {
      setLoading(false); // 🔵 hide loader
    }
  };

  const filteredMaterials = materials
    .filter((item) => {
      if (!designSearchText) return true;
      return item?.design
        ?.toLowerCase()
        .includes(designSearchText.toLowerCase());
    })
    .filter((item) => {
      if (!searchText || filterType === "no_selection") return true;
      const value = searchText.toLowerCase();
      switch (filterType) {
        case "code":
          return item.matCode?.toLowerCase().includes(value);
        case "date":
          return item.date
            ? new Date(item.date).toISOString().slice(0, 10).includes(value)
            : false;
        case "addedBy":
          return item.addedBy?.toLowerCase().includes(value);
        default:
          return true;
      }
    });

  const getPlaceholder = () => {
    switch (filterType) {
      case "code":
        return "Search by Material Code";
      case "date":
        return "Search by Date (YYYY-MM-DD)";
      case "addedBy":
        return "Search by Added By";
      default:
        return "Search...";
    }
  };

  const onChangeDate = (event, selected) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) setSelectedDate(selected);
  };

  const renderMaterialCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.matCode}>
          <Icon name="barcode" size={16} /> {item.matCode}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDelete(item._id)}
          >
            <Icon name="delete" size={22} color="#d9534f" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              if (item.document) {
                Alert.alert(
                  "Material Document",
                  `Uploaded on: ${
                    item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "Unknown date"
                  }`,
                  [
                    {
                      text: "Open Document",
                      onPress: () => {
                        // Open the document in browser
                        Linking.openURL(item.document);
                      },
                    },
                    { text: "Cancel", style: "cancel" },
                  ]
                );
              } else {
                Toast.show({
                  type: "info",
                  text1: "No document uploaded for this material",
                });
              }
            }}
          >
            <Icon name="file-document" size={22} color="#5cb85c" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.cardText}>
        <Icon name="scale" size={16} /> Quantity: {item.quantity}
      </Text>
      <Text style={styles.cardText}>
        <Icon name="cash" size={16} /> Amount: ₹{item.amount}
      </Text>
      <Text style={styles.cardText}>
        <Icon name="calendar" size={16} /> Date:{" "}
        {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
      </Text>
      <Text style={styles.cardText}>
        <Icon name="account" size={16} /> Added By: {item.addedBy || "N/A"}
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
            {FILTER_OPTIONS.find((f) => f.key === filterType)?.label ||
              "Select Filter"}
          </Text>
          <Icon name="chevron-down" size={18} color="#fff" />
        </Pressable>
      </View>

      <View>
        {filterType === "date" ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={[styles.filterInput, { flex: 1 }]}
              placeholder={getPlaceholder()}
              value={searchText}
              editable={false}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{ marginLeft: 8, padding: 6 }}
              activeOpacity={0.7}
            >
              <Icon name="calendar" size={24} color="#007bff" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}
          </View>
        ) : (
          <TextInput
            style={styles.filterInput}
            placeholder={getPlaceholder()}
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing"
          />
        )}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff9933" />
          <Text style={{ marginTop: 10, color: "#555" }}>
            Loading Records...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMaterials}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderMaterialCard}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No materials found.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Filter Modal */}
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
              <Pressable
                onPress={() => {
                  setFilterType("no_selection");
                  setSearchText("");
                  setShowFilterModal(false);
                }}
                style={styles.modalOption}
              >
                <Text style={styles.modalOptionText}>No Selection</Text>
              </Pressable>
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
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: "#f2f2f2",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginVertical: 12,
    textAlign: "center",
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

export default ManageInventory;
