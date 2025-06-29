import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  Animated,
  Pressable,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../ScreenWrapper ";
import { useSelector } from "react-redux";

const ManageUsers = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigation = useNavigation();

  const BASE_URL = "http://192.168.81.224:5000/api/users";
  const { currentProject } = useSelector((state) => state.project);

  useEffect((currentProject) => {
    fetchUsers();
  }, [currentProject]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Toast.show({
          type: "error",
          text1: "No token found",
          text2: "Please login again.",
        });
        return;
      }
      if (!currentProject) {
      throw new Error("No project selected");
    }
      const response = await fetch(`${BASE_URL}?projectId=${currentProject._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const extractedUsers = Array.isArray(data.data.users)
        ? data.data.users
        : [];
      setUsers(extractedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      Toast.show({ type: "error", text1: "Failed to fetch users" });
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              const response = await fetch(`${BASE_URL}/${id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              const data = await response.json();

              if (response.ok && data.success) {
                Toast.show({
                  type: "success",
                  text1: "User deleted successfully",
                });
                fetchUsers(); // refresh list
              } else {
                throw new Error(data.message || "Delete failed");
              }
            } catch (err) {
              console.error("Delete user error:", err);
              Toast.show({
                type: "error",
                text1: "Failed to delete user",
                text2: err.message || "Please try again later",
              });
            }
          },
        },
      ]
    );
  };
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderUserCard = ({ item }) => {
    const scale = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={styles.topIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("EditUser", { user: item })}
            >
              <Icon name="pencil-outline" size={22} color="#2196f3" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Icon name="delete-outline" size={22} color="#f44336" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userRow}>
            <Icon name="account" size={16} color="#333" />{" "}
            <Text style={styles.userName}>{item.username}</Text>
          </Text>
          <Text style={styles.userRow}>
            <Icon name="account-tie" size={16} color="#555" />{" "}
            <Text style={styles.userRole}>{item.role}</Text>
          </Text>
          <Text style={styles.userRow}>
            <Icon name="phone" size={16} color="#444" />{" "}
            <Text style={styles.userPhone}>{item.phone}</Text>
          </Text>
          <Text style={styles.userRow}>
            <Icon name="briefcase-check" size={16} color="#444" />{" "}
            <Text style={styles.userProject}>
              {item.projectAssigned?.name || "Not Assigned"}
            </Text>
          </Text>
          <Text style={styles.userRow}>
            <Icon name="calendar" size={16} color="#444" />{" "}
            <Text style={styles.userJoined}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "Joined date unknown"}
            </Text>
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper>
      <StatusBar backgroundColor="#ff9933" barStyle="light-content" />
      <View style={styles.searchWrapper}>
        <Icon name="magnify" size={22} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search username"
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#888"
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff9933" />
          <Text style={{ marginTop: 12, color: "#666" }}>Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <Text style={styles.noDataText}>No users found.</Text>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUserCard}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </ScreenWrapper>
  );
};

export default ManageUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3f7",
    padding: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
  },
  userRow: {
    fontSize: 14,
    color: "#444",
    marginTop: 6,
    flexDirection: "row",
  },
  userName: {
    fontWeight: "bold",
    color: "#222",
  },
  userRole: {
    color: "#555",
  },
  userPhone: {
    color: "#444",
  },
  userProject: {
    color: "#444",
  },
  userJoined: {
    color: "#444",
  },
  topIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    position: "absolute",
    top: 10,
    right: 12,
    gap: 16,
  },
  noDataText: {
    marginTop: 30,
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
});
