import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import ScreenWrapper from "../ScreenWrapper"; // adjust the path if needed

const MaterialDetailScreen = () => {
  const { matCode, matName, documents } = useSelector(
    (state) => state.selectedMaterial
  );

  if (!matCode || documents.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredContainer}>
          <Text style={styles.noData}>
            No material selected or no records available.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const allHistories = documents.flatMap((doc) => doc.usageHistory || []);
  const firstEntryDate = new Date(
    documents[0]?.createdAt || ""
  ).toLocaleDateString();
  const lastUpdateDate = new Date(
    documents[documents.length - 1]?.updatedAt || ""
  ).toLocaleDateString();

  return (
    <ScreenWrapper statusBarColor="#eef3f7">
      <FlatList
        data={allHistories}
        keyExtractor={(_, index) => index.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.headerCard}>
              <Text style={styles.title}>{matCode}</Text>

              <View style={styles.infoRow}>
                <Icon name="cube-outline" size={18} color="#FFA500" />
                <Text style={styles.infoText}>Material Name: {matName || "N/A"}</Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="file-document-outline" size={18} color="#FFA500" />
                <Text style={styles.infoText}>
                  Total Records: {documents.length}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="calendar-plus" size={18} color="#FFA500" />
                <Text style={styles.infoText}>First Entry: {firstEntryDate}</Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="clock-outline" size={18} color="#FFA500" />
                <Text style={styles.infoText}>Last Updated: {lastUpdateDate}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Usage History</Text>
            {allHistories.length === 0 && (
              <Text style={styles.noData}>
                No one has consumed this material yet.
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.usageCard}>
            <Icon name="account" size={20} color="#FFA500" />
            <View style={styles.usageContent}>
              <Text style={styles.usageName}>{item.takenBy || "Unknown"}</Text>
              <Text style={styles.usageDetail}>
                took <Text style={styles.bold}>{item.quantity}</Text> unit(s) on{" "}
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#eef3f7",
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginTop:20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 15,
    color: "#444",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 10,
  },
  usageCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    alignItems: "flex-start",
  },
  usageContent: {
    marginLeft: 10,
    flex: 1,
  },
  usageName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  usageDetail: {
    fontSize: 14,
    color: "#666",
  },
  bold: {
    fontWeight: "600",
    color: "#000",
  },
  noData: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#888",
    marginTop: 10,
    textAlign: "center",
  },
});

export default MaterialDetailScreen;
