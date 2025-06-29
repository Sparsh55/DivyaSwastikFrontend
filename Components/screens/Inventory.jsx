import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const Inventory = ({ navigation }) => {
  useFocusEffect(() => {
    StatusBar.setBackgroundColor("#F9F9FC");
    StatusBar.setBarStyle("dark-content");
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory Management</Text>

      <View style={styles.cardContainer}>
        {/* Row 1: Add Material + Manage Materials */}
        <View style={styles.row}>
          {/* Add Material Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate("AddMaterialScreen")}
          >
            <Icon name="plus-box" size={42} color="#4A90E2" />
            <Text style={styles.cardText}>Add Material</Text>
          </TouchableOpacity>

          {/* Manage Materials Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate("ManageInventory")}
          >
            <Icon name="clipboard-list-outline" size={42} color="#4A90E2" />
            <Text style={styles.cardText}>Manage Materials</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: See Live Availability */}
        <View style={[styles.row, { marginTop: 0 }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate("LiveAvailabilityScreen")} // <-- make sure this route exists
          >
            <Icon name="eye-check-outline" size={42} color="#4A90E2" />
            <Text style={styles.cardText}>See Live Availability</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Inventory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FC",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
   row: {
      flexDirection: "row",
      justifyContent: "center",
    },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 35,
    alignSelf: "center",
    paddingBottom: 8,
    width: "80%",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: width * 0.42,
    height: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    margin: 12,
    padding: 10,
    marginTop: 42,
  },
  cardText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
});
