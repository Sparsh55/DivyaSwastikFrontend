import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  StatusBar,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Card = ({ title, icon, subtitle, onPress }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = React.useState(false);

  const onPressIn = () => {
    setPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 4,
      tension: 100,
    }).start();
  };

  const onPressOut = () => {
    setPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 100,
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
          backgroundColor: "#ff6700",
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

const ProjectDashboard = ({  navigation }) => {
  const currentProject = useSelector((state) => state.project.currentProject);

  const projectName = currentProject?.name || "Unnamed Project";
  const startDate = currentProject?.date?.split("T")[0] || "N/A";
  const projectStatus = currentProject?.status || "Unknown";
  const handleDelete = () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Cancel pressed"),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => navigation.navigate("ManageProjects"),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.header}>
          <Text style={styles.heading}>Project Dashboard</Text>
        </View> */}

        {/* Single expanded white card containing both project info and orange cards */}
        <View style={styles.expandedProjectCard}>
          {/* Project info section - keeping your original design */}
          <View style={styles.projectPill}>
            <View style={styles.projectPillTopRow}>
              <Text
                style={styles.projectPillName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {projectName}
              </Text>
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color="#d32f2f"
                />
              </Pressable>
            </View>

            <View style={styles.projectPillInfo}>
              <MaterialCommunityIcons
                name="calendar-start"
                size={16}
                color="#3d3d3d"
              />
              <Text style={styles.projectPillDate}>
                Starting Date: {startDate}
              </Text>
            </View>

            <View style={styles.projectPillInfo}>
              <View
                style={[
                  styles.statusIndicator,
                  projectStatus === "Active"
                    ? styles.statusActiveBg
                    : styles.statusInactiveBg,
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    projectStatus === "Active" ? "check-circle" : "alert-circle"
                  }
                  size={16}
                  color={projectStatus === "Active" ? "#2e7d32" : "#d32f2f"}
                />
              </View>
              <Text
                style={[
                  styles.projectPillStatus,
                  projectStatus === "Active"
                    ? styles.statusActive
                    : styles.statusInactive,
                ]}
              >
                {projectStatus}
              </Text>
            </View>
          </View>

          {/* Divider line between project info and cards */}
          <View style={styles.divider} />

          {/* Orange cards section inside the same white container */}
          <View style={styles.cardsContainer}>
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
              onPress={() => {}}
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
    backgroundColor: "orange",
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
    marginTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "black",
    marginBottom: 8,
  },

  // Expanded white card containing both project info and orange cards
  expandedProjectCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
    marginTop: 30,
  },

  // Project info section - keeping your original design
  projectPill: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ffe8d4",
  },
  projectPillTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#ffebee",
  },
  deleteButtonPressed: {
    backgroundColor: "#ffcdd2",
  },
  projectPillName: {
    color: "#0f4c75",
    fontWeight: "700",
    fontSize: 18,
    flex: 1,
  },
  projectPillInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  projectPillDate: {
    color: "#5a5a5a",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 8,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statusActiveBg: {
    backgroundColor: "#e8f5e9",
  },
  statusInactiveBg: {
    backgroundColor: "#ffebee",
  },
  projectPillStatus: {
    fontWeight: "600",
    fontSize: 14,
  },
  statusActive: {
    color: "#2e7d32",
  },
  statusInactive: {
    color: "#d32f2f",
  },

  // Divider between sections
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },

  // Container for orange cards
  cardsContainer: {
    padding: 20,
  },

  // Card Styles (unchanged as requested)
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6700",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: "#0f4c75",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
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
