import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Pressable,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenWrapper from "../ScreenWrapper";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";

const API_URL = "http://192.168.81.224:5000/api/attendance";

const SeeAttendanceScreen = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/grouped`);
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error("Unexpected format");

      const selectedDateString = new Date(selectedDate).toDateString();

      const formatted = data
        .map((emp) => {
          const dateRecord = emp.records.find(
            (r) => new Date(r.date).toDateString() === selectedDateString
          );
          if (!dateRecord) return null;

          const presentDays = emp.records.filter(
            (r) => r.status === "Present"
          ).length;

          return {
            name: emp.name,
            employeeId: emp.employeeId,
            status: dateRecord.status,
            workedDays: presentDays,
            inTime: dateRecord.inTime || "-",
            outTime: dateRecord.outTime || "-",
            work: dateRecord.work || "-",
          };
        })
        .filter(Boolean);

      setAttendanceData(formatted);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to fetch attendance" });
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
    </View>
  );

  return (
    <ScreenWrapper>
      <StatusBar backgroundColor="#ff9933" barStyle="light-content" />
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by Date</Text>
          <Pressable
            style={styles.filterTypeBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={18} color="#fff" />
            <Text style={styles.filterTypeBtnText}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </Pressable>
        </View>

        <TextInput
          placeholder="Search by name"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.filterInput}
          placeholderTextColor="#888"
        />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={{ marginTop: 10, color: "#555" }}>
              Loading Attendance...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.employeeId}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <View style={styles.noDataContainer}>
                <Image
                  source={require("../../assets/cloud.png")}
                  style={styles.noDataImage}
                  resizeMode="contain"
                />
                <Text style={styles.noDataText}>No attendance found</Text>
              </View>
            }
          />
        )}

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    marginVertical: 6,
    alignItems: "center",
    marginTop: -8,
  },

  filterSection: {
    marginTop: 10,
    marginBottom: 6,
  },
  filterLabel: {
    marginBottom: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginLeft: 2,
  },
  filterTypeBtn: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  filterTypeBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginHorizontal: 6,
  },
  filterInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 15,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 10,
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

export default SeeAttendanceScreen;
