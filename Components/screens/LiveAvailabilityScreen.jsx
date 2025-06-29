import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useDispatch } from "react-redux";
import { setSelectedMaterial } from "../../redux/selectedMaterialSlice";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../ScreenWrapper ";

const API_URL = "http://192.168.81.224:5000/api/materials";

const LiveAvailabilityScreen = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    fetchAvailabilityData();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchText, materials]);

  const fetchAvailabilityData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const [availabilityRes, consumedRes, groupedRes] = await Promise.all([
        fetch(`${API_URL}/total-availability`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/total-consumed`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/all-details-grouped`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const availableData = await availabilityRes.json();
      const consumedData = await consumedRes.json();
      const groupedData = await groupedRes.json();

      const merged = availableData.map((item) => {
        const matCode = item._id;
        const consumed = consumedData.find((c) => c._id === matCode);
        const totalConsumed = consumed ? consumed.totalConsumed : 0;
        const liveStatus =
          item.totalAvailable === 0
            ? "out of stock"
            : item.totalAvailable < 10
            ? "low Quantity"
            : "available";

        const fullDetails = groupedData.find((g) => g.matCode === matCode);

        return {
          matCode,
          totalAvailable: item.totalAvailable,
          totalConsumed,
          status: liveStatus,
          documents: fullDetails?.documents || [],
        };
      });

      setMaterials(merged);
      setFilteredMaterials(merged);
    } catch (error) {
      console.error("Error fetching live availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAvailabilityData();
    setRefreshing(false);
  };

  const filterMaterials = () => {
    const filtered = materials.filter((m) =>
      m.matCode.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredMaterials(filtered);
  };

  const statusIconMap = {
    available: { icon: "check-circle", color: "#28a745" },
    "low Quantity": { icon: "alert-circle", color: "#FFA500" },
    "out of stock": { icon: "close-circle", color: "#dc3545" },
  };

  const handleEdit = (matCode) => {
    console.log("Edit material:", matCode);
    // Add navigation or modal here
  };

  const handleDelete = (matCode) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete all records for "${matCode}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem("userToken");
              const response = await fetch(`${API_URL}/by-code/${matCode}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const result = await response.json();

              if (response.ok) {
                Toast.show({
                  type: "success",
                  text1: result.message || "Deleted successfully",
                });
                await fetchAvailabilityData();
              } else {
                Toast.show({
                  type: "error",
                  text1: result.error || "Failed to delete records",
                });
              }
            } catch (error) {
              console.error("Delete error:", error);
              Toast.show({
                type: "error",
                text1: "An error occurred while deleting",
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => {
    const iconData = statusIconMap[item.status] || {};

    return (
      <TouchableOpacity
        onPress={() => {
          dispatch(
            setSelectedMaterial({
              matCode: item.matCode,
              documents: item.documents,
            })
          );
          // If you have a detail screen, you can also do:
          navigation.navigate("MaterialDetailScreen");
        }}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.matCode}>
              <Icon name="barcode" size={18} /> {item.matCode}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item.matCode)}>
                <Icon name="pencil" size={20} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.matCode)}>
                <Icon
                  name="delete"
                  size={20}
                  color="#d9534f"
                  style={{ marginLeft: 16 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="warehouse" size={16} color="#555" />
            <Text style={styles.detailText}>
              {" "}
              Available:{" "}
              <Text style={styles.boldText}>{item.totalAvailable}</Text>
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="cart-remove" size={16} color="#555" />
            <Text style={styles.detailText}>
              {" "}
              Consumed:{" "}
              <Text style={styles.boldText}>{item.totalConsumed}</Text>
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Icon name={iconData.icon} size={18} color={iconData.color} />
            <Text style={[styles.statusText, { color: iconData.color }]}>
              {"  "}
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <StatusBar backgroundColor="#ff9933" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.searchInputWrapper}>
          <Icon
            name="magnify"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search by Material Code"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
          />
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : (
          <FlatList
            data={filteredMaterials}
            keyExtractor={(item) => item.matCode}
            renderItem={renderItem}
            refreshing={refreshing} // 👈 added
            onRefresh={handleRefresh}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "#666" }}
              >
                No materials found.
              </Text>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6fc",
  },
  topBar: {
    backgroundColor: "#FFA500",
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  container: {
    flex: 1,
    backgroundColor: "#f4f6fc",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 17,
    fontSize: 16,
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  matCode: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detailText: {
    fontSize: 15,
    color: "#444",
  },
  boldText: {
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default LiveAvailabilityScreen;
