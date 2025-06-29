import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenWrapper from "../ScreenWrapper ";
import Toast from "react-native-toast-message";

const API_URL = "http://192.168.81.224:5000/api/attendance";

const SeeAttendanceScreen = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/grouped`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      const formatted = data.map((emp) => {
        const presentDays = emp.records.filter((r) => r.status === "Present").length;
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = emp.records.find((r) => r.date.startsWith(today));
        const latestRecord = [...emp.records].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        return {
          name: emp.name,
          employeeId: emp.employeeId,
          status: todayRecord ? todayRecord.status : "Absent",
          workedDays: presentDays,
          inTime: todayRecord?.inTime || latestRecord?.inTime || "-",
          outTime: todayRecord?.outTime || latestRecord?.outTime || "-",
          work: todayRecord?.work || latestRecord?.work || "-",
          phone: emp.phone || "-",
          joinedDate: emp.joinedDate
            ? new Date(emp.joinedDate).toLocaleDateString()
            : "-",
          project: emp.project || "-",
        };
      });

      setAttendanceData(formatted);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      Toast.show({
        type: "error",
        text1: "Failed to fetch attendance data",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = attendanceData.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>
          <Icon name="account" size={18} /> {item.name}
        </Text>
        <View style={styles.statusRow}>
          <Icon
            name={item.status === "Present" ? "check-circle" : "close-circle"}
            size={18}
            color={item.status === "Present" ? "#28a745" : "#dc3545"}
          />
          <Text
            style={[
              styles.statusText,
              { color: item.status === "Present" ? "#28a745" : "#dc3545" },
            ]}
          >
            {"  "}
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Icon name="calendar-check" size={16} color="#555" />
        <Text style={styles.detailText}>
          {" "}
          Worked Days: <Text style={styles.boldText}>{item.workedDays}</Text>
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="clock-in" size={16} color="#555" />
        <Text style={styles.detailText}>
          {" "}
          In: <Text style={styles.boldText}>{item.inTime}</Text>
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="clock-out" size={16} color="#555" />
        <Text style={styles.detailText}>
          {" "}
          Out: <Text style={styles.boldText}>{item.outTime}</Text>
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="clipboard-text" size={16} color="#555" />
        <Text style={styles.detailText}>
          {" "}
          Work: <Text style={styles.boldText}>{item.work}</Text>
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="calendar" size={16} color="#555" />
        <Text style={styles.detailText}>
          {" "}
          Joined: <Text style={styles.boldText}>{item.joinedDate}</Text>
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="briefcase" size={16} color="#555" />
        <Text style={styles.detailText}>
          {" "}
          Project: <Text style={styles.boldText}>{item.project}</Text>
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="phone" size={16} color="#555" />
        <Text style={styles.detailText}>
          {" "}
          Phone: <Text style={styles.boldText}>{item.phone}</Text>
        </Text>
      </View>
    </View>
  );

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
            placeholder="Search by employee name"
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
            data={filteredData}
            keyExtractor={(item) => item.employeeId}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "#666" }}
              >
                No attendance records found.
              </Text>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
    marginHorizontal: 3,
    marginTop: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 3,
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
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
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
  },
  statusText: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default SeeAttendanceScreen;
