import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
  Animated,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import ScreenWrapper from "../ScreenWrapper";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";

const ManageUsers = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { currentProject } = useSelector((state) => state.project);
  const BASE_URL = "http://192.168.81.224:5000/api/users";

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, [currentProject]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}?projectId=${currentProject?._id}`);
      const json = await res.json();
      setUsers(Array.isArray(json.data?.users) ? json.data.users : []);
    } catch {
      Toast.show({ type: "error", text1: "Failed to fetch users" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch("http://192.168.81.224:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setProjects(json.data.projects || []);
    } catch {
      Toast.show({ type: "error", text1: "Failed to fetch projects" });
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await fetch(`${BASE_URL}/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (res.ok && json.success) {
              Toast.show({ type: "success", text1: "User deleted" });
              fetchUsers();
            } else throw new Error(json.message);
          } catch (err) {
            Toast.show({
              type: "error",
              text1: "Delete failed",
              text2: err.message,
            });
          }
        },
      },
    ]);
  };

  const handleResetPassword = async (userId, username) => {
    Alert.alert("Reset Password", `Reset password for ${username}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            const newPassword = Math.random().toString(36).slice(-8);
            const res = await fetch(`${BASE_URL}/${userId}/reset-password`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ newPassword }),
            });
            const json = await res.json();
            if (res.ok && json.success) {
              Toast.show({
                type: "success",
                text1: "Password reset and emailed to admin",
              });
            } else throw new Error(json.message);
          } catch (err) {
            Toast.show({
              type: "error",
              text1: "Reset failed",
              text2: err.message,
            });
          }
        },
      },
    ]);
  };

  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setEditUsername(user.username);
    setEditPhone(user.phone);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editUsername || !editPhone) {
      Toast.show({ type: "error", text1: "Fields can't be empty" });
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${BASE_URL}/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editUsername,
          phone: editPhone,
          role: selectedUser?.role,
          projectAssigned: selectedUser?.projectAssigned,
          createdAt: selectedUser?.createdAt,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        Toast.show({ type: "success", text1: "User updated" });
        setEditModalVisible(false);
        fetchUsers();
      } else throw new Error(json.message);
    } catch (err) {
      Toast.show({ type: "error", text1: "Update failed", text2: err.message });
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const scale = new Animated.Value(1);
    return (
      <Pressable
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
        }
      >
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={styles.topIcons}>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <Icon name="pencil-outline" size={22} color="#2196f3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Icon name="delete-outline" size={22} color="#f44336" />
            </TouchableOpacity>
          </View>

          <Text style={styles.usernameRow}>
            <Icon name="account" size={16} />{" "}
            <Text style={styles.boldText}>{item.username}</Text>
          </Text>
          <Text style={styles.userRow}>
            <Icon name="account-tie" size={16} /> Role: {item.role}
          </Text>
          <Text style={styles.userRow}>
            <Icon name="phone" size={16} /> Mobile: {item.phone}
          </Text>
          <Text style={styles.userRow}>
            <Icon name="briefcase-check" size={16} /> Project:{" "}
            {item.projectAssigned?.name || "Not Assigned"}
          </Text>
          <Text style={styles.userRow}>
            <Icon name="calendar" size={16} /> Joined:{" "}
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>

          <TouchableOpacity
            onPress={() => handleResetPassword(item._id, item.username)}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.wrapper}>
        <View style={styles.searchBar}>
          <Icon
            name="magnify"
            size={22}
            color="#555"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search username"
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ff9933" />
            <Text style={styles.loaderText}>Loading users...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Image
              source={require("../../assets/cloud.png")}
              style={styles.noDataImage}
            />
            <Text style={styles.noDataText}>No users found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(i) => i._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>

      {/* Edit User Modal */}
      <Modal
        isVisible={editModalVisible}
        onBackdropPress={() => setEditModalVisible(false)}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Edit User</Text>

          <TextInput
            placeholder="Username"
            value={editUsername}
            onChangeText={setEditUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone"
            value={editPhone}
            onChangeText={setEditPhone}
            keyboardType="number-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="Role"
            value={selectedUser?.role}
            onChangeText={(t) => setSelectedUser({ ...selectedUser, role: t })}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.input}
            onPress={() => setProjectModalVisible(true)}
          >
            <Text
              style={{ color: selectedUser?.projectAssigned ? "#000" : "#888" }}
            >
              {selectedUser?.projectAssigned?.name || "Select Project"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {selectedUser?.createdAt
                ? new Date(selectedUser.createdAt).toLocaleDateString()
                : "Pick Joined Date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={
                selectedUser?.createdAt
                  ? new Date(selectedUser.createdAt)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowDatePicker(false);
                if (d)
                  setSelectedUser({
                    ...selectedUser,
                    createdAt: d.toISOString(),
                  });
              }}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleEditSubmit}
              style={styles.saveButton}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Project Select Modal */}
      <Modal
        isVisible={projectModalVisible}
        onBackdropPress={() => setProjectModalVisible(false)}
      >
        <View style={styles.projectModal}>
          <Text style={styles.modalTitle}>Select Project</Text>
          <FlatList
            data={projects}
            keyExtractor={(p) => p._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.projectItem}
                onPress={() => {
                  setSelectedUser({ ...selectedUser, projectAssigned: item });
                  setProjectModalVisible(false);
                }}
              >
                <Icon
                  name={
                    selectedUser?.projectAssigned?._id === item._id
                      ? "radiobox-marked"
                      : "radiobox-blank"
                  }
                  size={22}
                  color="#ff9933"
                />
                <Text style={styles.projectName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.cancelProjectButton}
            onPress={() => setProjectModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Toast />
    </ScreenWrapper>
  );
};

export default ManageUsers;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    paddingHorizontal: 12,
    marginTop: -40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 14,
    color: "#000",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  loaderText: { marginTop: 10, color: "#555" },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  noDataImage: { width: 100, height: 100, marginBottom: 16 },
  noDataText: { fontSize: 16, color: "#888" },
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

  usernameRow: {
    fontSize: 15,
    color: "#000",
    fontWeight: "bold",
    marginTop: 6,
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#000",
  },
  topIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    position: "absolute",
    top: 10,
    right: 12,
    gap: 16,
  },
  userRow: { fontSize: 14, color: "#444", marginTop: 6 },
  resetButton: {
    marginTop: -5,
    marginLeft: 170,
    backgroundColor: "#ff9933",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  resetButtonText: { color: "#fff", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: "#ff9933",
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginRight: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#ccc",
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginLeft: 10,
    alignItems: "center",
  },
  cancelText: { color: "#333", fontWeight: "bold" },
  projectModal: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: 400,
  },
  projectItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  projectName: { marginLeft: 12, fontSize: 16, color: "#333" },
  cancelProjectButton: {
    marginTop: 15,
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
});
