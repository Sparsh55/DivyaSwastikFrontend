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
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { useDispatch } from "react-redux";
import { setProject } from "../../redux/projectSlice";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenWrapper from "../ScreenWrapper";
import { useSelector } from "react-redux";

const BASE_URL = "http://192.168.81.224:5000/api/projects";

const ManageProjects = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
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
      const extracted = Array.isArray(data?.data?.projects)
        ? data.data.projects
        : [];
      setProjects(extracted);
    } catch (error) {
      console.error("Error fetching projects:", error);
      Toast.show({ type: "error", text1: "Failed to fetch projects" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
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
              if (response.ok) {
                Toast.show({ type: "success", text1: "Project deleted successfully" });
                fetchProjects();
              } else {
                throw new Error("Delete failed");
              }
            } catch (err) {
              console.error(err);
              Toast.show({ type: "error", text1: "Failed to delete project" });
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const openStatusModal = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  const updateProjectStatus = async (status) => {
    if (!selectedProject) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${BASE_URL}/${selectedProject._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();
      if (result.success) {
        Toast.show({ type: "success", text1: "Status updated successfully" });
        setModalVisible(false);
        fetchProjects();
      } else {
        throw new Error(result.message || "Failed to update");
      }
    } catch (error) {
      console.error("Status update error:", error);
      Toast.show({ type: "error", text1: "Update failed" });
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setEditName(project.name || "");
    setEditDescription(project.description || "");
    setEditDate(project.date ? project.date.slice(0, 10) : "");
    setEditModalVisible(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${BASE_URL}/${selectedProject._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          date: editDate,
        }),
      });

      const result = await response.json();
      if (result.success) {
        Toast.show({ type: "success", text1: "Project updated successfully" });
        setEditModalVisible(false);
        fetchProjects();
      } else {
        throw new Error(result.message || "Update failed");
      }
    } catch (err) {
      console.error("Update Error:", err);
      Toast.show({ type: "error", text1: "Failed to update project" });
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderProjectCard = ({ item }) => {
    const scale = new Animated.Value(1);
    const handlePressIn = () =>
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    const handlePressOut = () =>
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    const formattedDate = moment(item.startDate || item.date).format(
      "DD-MM-YYYY"
    );

    const statusStyle = (() => {
      const status = item.status?.toLowerCase();
      if (status === "active") return styles.active;
      if (status === "on-hold") return styles.hold;
      if (status === "completed") return styles.completed;
      return styles.cancelled;
    })();

    const formattedStatus =
      item.status?.charAt(0).toUpperCase() + item.status?.slice(1);

    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          dispatch(setProject(item));
          navigation.navigate("Projectdashboard", { project: item });
        }}
      >
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={styles.cardHeader}>
            <Icon name="briefcase-outline" size={20} color="#ff9933" />
            <Text style={styles.projectTitle}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => openStatusModal(item)}
              style={styles.statusTopRight}
            >
              <Text style={[styles.statusBadge, statusStyle]}>
                {formattedStatus}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={16} color="#555" />
            <Text style={styles.projectDate}>Start: {formattedDate}</Text>
          </View>

          {item.description ? (
            <View style={styles.infoRow}>
              <Icon name="note-text-outline" size={16} color="#555" />
              <Text style={styles.projectDesc}>{item.description}</Text>
            </View>
          ) : null}

          <View style={styles.floatingIcons}>
            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={() => openEditModal(item)}
            >
              <Icon name="pencil" size={20} color="#2196f3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={() => handleDelete(item._id)}
            >
              <Icon name="delete" size={20} color="#e53935" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={styles.searchWrapper}>
        <Icon name="magnify" size={22} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search project name"
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#888"
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff9933" />
          <Text style={{ marginTop: 10, color: "#555" }}>
            Loading Projects...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Image
            source={require("../../assets/cloud.png")} // <-- your PNG path
            style={styles.noDataImage}
            resizeMode="contain"
          />
          <Text style={styles.noDataText}>No projects found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderProjectCard}
          contentContainerStyle={{ paddingBottom: 0 }}
        />
      )}

      {/* Status Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change Project Status</Text>
            {["active", "on-hold", "completed", "cancelled"].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => updateProjectStatus(option)}
                style={[
                  styles.statusOption,
                  selectedProject?.status?.toLowerCase() === option &&
                    styles.selectedOption,
                ]}
              >
                <Text style={styles.statusOptionText}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text
                style={{ color: "#ff9933", textAlign: "center", marginTop: 10 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        transparent
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackground}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalBox}
              keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
            >
              <Text style={styles.modalTitle}>Edit Project</Text>

              <Text style={styles.label}>Project Name</Text>
              <TextInput
                placeholder="Project Name"
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Project Description</Text>
              <TextInput
                placeholder="Description"
                value={editDescription}
                onChangeText={setEditDescription}
                style={[styles.input, { height: 80 }]}
                multiline
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Edit Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text style={{ color: editDate ? "#000" : "#888" }}>
                  {editDate || "Select Date"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={editDate ? new Date(editDate) : new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formatted =
                        moment(selectedDate).format("YYYY-MM-DD");
                      setEditDate(formatted);
                    }
                  }}
                />
              )}

              <TouchableOpacity
                onPress={handleUpdateProject}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text
                  style={{
                    color: "#ff9933",
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      </View>
    </ScreenWrapper>
  );
};

export default ManageProjects;

// Add these styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3f7",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
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
    marginBottom: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#000" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    position: "relative",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  projectDate: { fontSize: 14, color: "#555", marginLeft: 6 },
  projectDesc: { fontSize: 14, color: "#555", marginLeft: 6, marginRight: 60 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
  },
  active: { backgroundColor: "#4caf50" },
  hold: { backgroundColor: "#ff9800" },
  completed: { backgroundColor: "#2196f3" },
  cancelled: { backgroundColor: "#f44336" },
  noDataText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 30,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalBackground: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 4,
  },
  statusOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  selectedOption: { backgroundColor: "#f0f0f0" },
  statusOptionText: { fontSize: 16, color: "#333", textAlign: "center" },
  statusTopRight: {
    marginLeft: "auto",
    backgroundColor: "transparent",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  floatingIcons: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  floatingBtn: { padding: 10 },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
    color: "#000",
  },
  saveBtn: {
    backgroundColor: "#ff9933",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  noDataImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
  },
});
