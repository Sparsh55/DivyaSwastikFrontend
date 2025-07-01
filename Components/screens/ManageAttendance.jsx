import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const ManageAttendanceScreen = () => {
  const [employees, setEmployees] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("Absent");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [work, setWork] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({
    type: null,
    visible: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await axios.get("http://192.168.81.224:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch {
      Toast.show({ type: "error", text1: "Failed to load employees" });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const formatted = selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (showTimePicker.type === "in") setInTime(formatted);
      if (showTimePicker.type === "out") setOutTime(formatted);
    }
    setShowTimePicker({ type: null, visible: false });
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) setDate(selectedDate);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    if (!selected) {
      return Toast.show({ type: "error", text1: "Please select an employee" });
    }
    if (!inTime) {
      return Toast.show({ type: "error", text1: "Please select in-time" });
    }
    if (!outTime) {
      return Toast.show({ type: "error", text1: "Please select out-time" });
    }
    const selectedDateStr = date.toISOString().split("T")[0];
    const inDate = new Date(`${selectedDateStr} ${inTime}`);
    const outDate = new Date(`${selectedDateStr} ${outTime}`);

    if (outDate < inDate) {
      return Toast.show({
        type: "error",
        text1: "Out Time cannot be earlier than In Time",
      });
    }
    if (!date) {
      return Toast.show({ type: "error", text1: "Please select a date" });
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        "http://192.168.81.224:5000/api/attendance",
        {
          employeeId: selected._id,
          status,
          inTime,
          outTime,
          work,
          date: date.toISOString().split("T")[0],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({ type: "success", text1: "Attendance saved successfully" });
      resetForm();
    } catch (err) {
      console.error("Submit error:", err?.response?.data || err.message || err);
      Toast.show({
        type: "error",
        text1: "Failed to mark attendance",
        text2: err?.response?.data?.message || "Check console for details",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelected(null);
    setStatus("Absent");
    setInTime("");
    setOutTime("");
    setWork("");
    setDate(new Date());
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar backgroundColor="#ff9933" barStyle="light-content" />

        <TouchableOpacity
          style={styles.employeePicker}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="people-outline" size={24} color="#ff9933" />
          <Text style={styles.employeeText}>
            {selected ? selected.name : "Select Employee"}
          </Text>
          <Icon name="chevron-down-outline" size={20} color="#aaa" />
        </TouchableOpacity>

        <View style={styles.statusRow}>
          {["Present", "Absent"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statusBtn, status === s && styles[`btn${s}`]]}
              onPress={() => setStatus(s)}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  status === s && { color: "#fff" },
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.inputWithIcon}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon
            name="calendar-outline"
            size={20}
            color="#ff9933"
            style={{ marginRight: 10 }}
          />
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>In Time</Text>
        <TouchableOpacity
          style={styles.inputWithIcon}
          onPress={() => setShowTimePicker({ type: "in", visible: true })}
        >
          <Icon
            name="time-outline"
            size={20}
            color="#ff9933"
            style={{ marginRight: 10 }}
          />
          <Text>{inTime || "Select In Time"}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Out Time</Text>
        <TouchableOpacity
          style={styles.inputWithIcon}
          onPress={() => setShowTimePicker({ type: "out", visible: true })}
        >
          <Icon
            name="time-outline"
            size={20}
            color="#ff9933"
            style={{ marginRight: 10 }}
          />
          <Text>{outTime || "Select Out Time"}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Daily Work (optional)</Text>
        <TextInput
          placeholder="What did they work on?"
          style={[styles.input, { height: 80 }]}
          value={work}
          onChangeText={setWork}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, submitting && { backgroundColor: "#4caf50" }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Submitting..." : "Submit Attendance"}
          </Text>
        </TouchableOpacity>

        <Toast />

        {showTimePicker.visible && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalWrapper}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Employee</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={22} color="#333" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={employees}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: 10 }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => {
                  const isSelected = selected?._id === item._id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.employeeItem,
                        isSelected && { backgroundColor: "#ffecd9" },
                      ]}
                      onPress={() => {
                        setSelected(item);
                        setModalVisible(false);
                      }}
                    >
                      <Icon
                        name="person-circle-outline"
                        size={24}
                        color="#ff9933"
                      />
                      <Text style={styles.employeeName}>{item.name}</Text>
                      {isSelected && (
                        <Icon
                          name="checkmark-circle"
                          size={20}
                          color="#4caf50"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default ManageAttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F1F2F6",
  },
  employeePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
    elevation: 5,
  },
  employeeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statusBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  btnPresent: {
    backgroundColor: "#4caf50",
  },
  btnAbsent: {
    backgroundColor: "#f44336",
  },
  statusBtnText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
    fontSize: 16,
    elevation: 6,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff9933",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_WIDTH + 100,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 5,
  },
  employeeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  employeeName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
});
