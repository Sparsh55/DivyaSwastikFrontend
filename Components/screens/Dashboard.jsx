import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";

const Dashboard = ({ navigation }) => {
  const user = useSelector((state) => state.user.user);

  const profileImageUri = user?.image
    ? `http://192.168.81.224:5000/${user.image.replace(/\\/g, "/")}`
    : null;

  const handleCreateProject = () => navigation.navigate("CreateNewProject");
  const handleManageProjects = () => navigation.navigate("ManageProjects");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f2f3f5" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => {
              if (profileImageUri) {
                navigation.navigate("FullImageScreen", {
                  imageUri: profileImageUri,
                });
              }
            }}
          >
            <View style={styles.iconCircle}>
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.iconText}>👤</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.userName}>
            {user?.name || user?.username || "User"}
          </Text>
          <View style={styles.onlineStatus}>
            <View style={styles.greenDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.chooseText}>Choose</Text>
          <Text style={styles.actionText}>what to do?</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreateProject}
              activeOpacity={0.85}
            >
              <Text style={styles.createButtonText}>Create new project</Text>
              <View style={styles.plusIcon}>
                <Ionicons name="add" size={22} color="#fff" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.manageButton]}
              onPress={handleManageProjects}
              activeOpacity={0.85}
            >
              <Text style={styles.manageButtonText}>Manage projects</Text>
              <View style={styles.arrowIcon}>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  profileIcon: {
    marginBottom: 16,
    marginTop: 30,
  },
  dateText: {
    fontSize: 16,
    color: "#888",
    marginTop: 30,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  iconText: {
    fontSize: 36,
  },
  greetingText: {
    fontSize: 18,
    color: "#555",
    marginTop: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 4,
  },
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4caf50",
    marginRight: 6,
  },

  onlineText: {
    color: "#4caf50",
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  chooseText: {
    fontSize: 26,
    color: "#37474f",
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.8,
    fontStyle: "italic",
  },
  actionText: {
    fontSize: 20,
    color: "#607d8b",
    fontWeight: "400",
    marginBottom: 40,
    textAlign: "center",
    marginLeft: 12,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 28,
    paddingHorizontal: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
  },
  createButton: {
    backgroundColor: "#ffd700",
  },
  manageButton: {
    backgroundColor: "#2d5a5a",
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  manageButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    flex: 1,
  },
  plusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  plusText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  arrowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ff9800",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  arrowText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Dashboard;
