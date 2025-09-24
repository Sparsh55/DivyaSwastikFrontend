import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const API_BASE_URL = "http://192.168.133.224:5000/api";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const screenWidth = Dimensions.get("window").width;

const Card = ({ title, icon, subtitle, onPress }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const onPressIn = () => {
    setPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    setPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.card,
        {
          transform: [{ scale: scaleValue }],
          shadowOpacity: pressed ? 0.65 : 0.45,
          elevation: pressed ? 16 : 12,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={36} color="#0f4c75" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={28}
        color="#0f4c75"
        style={{ marginLeft: 8 }}
      />
    </AnimatedPressable>
  );
};

const ProjectDashboard = ({ navigation }) => {
  const currentProject = useSelector((state) => state.project.currentProject);

  const projectId = currentProject?._id;
  const projectName = currentProject?.name || "Unnamed Project";
  const startDate = currentProject?.date?.split("T")[0] || "N/A";
  const projectStatus = currentProject?.status || "Unknown";

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor("#ff9933");
      StatusBar.setBarStyle("light-content");

      return () => {
        StatusBar.setBackgroundColor("transparent");
        StatusBar.setBarStyle("dark-content");
      };
    }, [])
  );

  const handleDelete = async () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
              Alert.alert("Deleted", "Project deleted successfully");
              navigation.navigate("ManageProjects");
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete project"
              );
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = () => {
    switch (projectStatus) {
      case "active":
        return {
          bg: "#43a047",
          textColor: "#ffffff",
          icon: "check-circle",
        };
      case "on-hold":
        return {
          bg: "#fbc02d",
          textColor: "#000",
          icon: "pause-circle",
        };
      case "completed":
        return {
          bg: "#2196f3",
          textColor: "#ffffff",
          icon: "close-circle",
        };
      case "cancelled":
        return {
          bg: "#e53935",
          textColor: "#ffffff",
          icon: "cancel",
        };
      default:
        return {
          bg: "#9e9e9e",
          textColor: "#ffffff",
          icon: "help-circle",
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View>
          <View style={styles.uShapeContainer}>
            <View style={styles.uShapeCard}>
              <Text style={styles.projectTitle} numberOfLines={1}>
                {projectName}
              </Text>
              <Text style={styles.projectDateCentered}>
                <MaterialCommunityIcons
                  name="calendar-start"
                  size={16}
                  color="#fff"
                />{" "}
                {startDate}
              </Text>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusBadgeBox,
                    { backgroundColor: statusStyle.bg },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={statusStyle.icon}
                    size={18}
                    color={statusStyle.textColor}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusStyle.textColor },
                    ]}
                  >
                    {projectStatus}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardsContainerBelowUShape}>
            <Card
              title="Manage Inventory"
              icon="warehouse"
              subtitle="Add, remove, track materials"
              onPress={() => navigation.navigate("Inventory", { projectName })}
            />
            <Card
              title="Manage Manpower"
              icon="account-group"
              subtitle="Assign, track workforce"
              onPress={() => navigation.navigate("Manpower", { projectName })}
            />
            <Card
              title="Manage Users"
              icon="account-cog"
              subtitle="Manage project access & roles"
              onPress={() => navigation.navigate("UserManagment")}
            />
            <Card
              title="Statistics & DPR"
              icon="chart-bar"
              subtitle="View reports & performance"
              onPress={() => navigation.navigate("StatsAndDprScreen")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  uShapeContainer: {
    backgroundColor: "#ff9933",
    paddingBottom: 40,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    alignItems: "center",
  },
  uShapeCard: {
    padding: 20,
    marginTop: 40,
    width: "90%",
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  projectDateCentered: {
    marginTop: 10,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  statusRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    elevation:6,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 14,
  },
  deleteBtnInline: {
    marginLeft: 12,
    padding: 4,
  },
  cardsContainerBelowUShape: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff9933",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 16,
    elevation: 25,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#d0e8f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "white",
    marginTop: 4,
    opacity: 0.9,
  },
});

export default ProjectDashboard;
