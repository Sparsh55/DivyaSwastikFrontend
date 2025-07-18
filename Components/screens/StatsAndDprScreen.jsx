import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { LineChart, BarChart } from "react-native-chart-kit";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import ScreenWrapper from "../ScreenWrapper";
import axios from "axios";

const formatCurrency = (value) => {
  const number = parseInt(value, 10);
  if (isNaN(number)) return "₹0";
  return `₹${number.toLocaleString("en-IN")}`;
};

// Helper functions outside component
const calculateWeeklyStats = (employees) => {
  const dailyCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

  employees.forEach((emp) => {
    try {
      const date = new Date(emp.date);
      const day = date.getDay();
      dailyCounts[day]++;
    } catch (e) {
      console.warn("Invalid date format", emp.date);
    }
  });

  return [...dailyCounts.slice(1), dailyCounts[0]]; // Mon-Sun
};

const calculateMonthlyStats = (materials) => {
  const monthly = [0, 0, 0, 0, 0, 0]; // Jan-Jun

  materials.forEach((mat) => {
    try {
      const date = new Date(mat.date);
      const month = date.getMonth();
      if (month >= 0 && month <= 5) {
        monthly[month] += Number(mat.quantityAdded) || 0;
      }
    } catch (e) {
      console.warn("Invalid date format", mat.date);
    }
  });

  return monthly;
};

const StatsAndDprScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [materialUsage, setMaterialUsage] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [projectStats, setProjectStats] = useState({
    weekStats: [],
    monthStats: [],
    totalEmployees: 0,
    totalMaterials: 0,
    profit: 0,
    loss: 0,
  });

  const project = useSelector((state) => state.project.currentProject);

  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get("window");
      setDimensions({ width, height });
    };

    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );
    updateDimensions();
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (!project?._id) {
      console.log("No project ID available");
      setLoading(false);
      return;
    }

    const fetchDprData = async () => {
      try {
        setLoading(true);
        setError(null);
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        console.log(
          `Fetching data for project ${project._id}, month ${month}, year ${year}`
        );

        const [attendanceRes, materialRes] = await Promise.all([
          axios
            .get(
              `http://192.168.81.224:5000/api/dpr/attendance-report/${project._id}?month=${month}&year=${year}`
            )
            .catch((err) => {
              console.error(
                "Attendance API Error:",
                err.response?.data || err.message
              );
              throw err;
            }),
          axios
            .get(
              `http://192.168.81.224:5000/api/dpr/material-report/${project._id}?month=${month}&year=${year}`
            )
            .catch((err) => {
              console.error(
                "Material API Error:",
                err.response?.data || err.message
              );
              throw err;
            }),
        ]);

        console.log("API Responses:", {
          attendance: attendanceRes.data,
          material: materialRes.data,
        });

        // Process employee data
        const employees = attendanceRes.data?.employees || [];
        const allEmpRows = employees.flatMap((emp) =>
          (emp.attendance || []).map((att) => ({
            name: emp.employee?.name || "Unknown",
            date: att.date,
            inTime: att.inTime || "--:--",
            outTime: att.outTime || "--:--",
            dailyWork: att.dailyWork || "No work logged",
            status: att.status || "Unknown",
          }))
        );

        // Process material data
        const materials = materialRes.data?.materials || [];
        const allMatRows = materials.flatMap((mat) => [
          ...mat.additions.map((add) => ({
            matCode: mat.matCode || "N/A",
            matName: mat.matName || "Unknown",
            date: add.date,
            quantityAdded: add.quantity,
            addedBy: add.addedBy,
            quantityConsumed: 0,
            consumedBy: "",
            remaining: mat.remaining || 0,
          })),
          ...mat.consumptions.map((consume) => ({
            matCode: mat.matCode || "N/A",
            matName: mat.matName || "Unknown",
            date: consume.date,
            quantityAdded: 0,
            addedBy: "",
            quantityConsumed: consume.quantity,
            consumedBy: consume.consumedBy,
            remaining: mat.remaining || 0,
          })),
        ]);

        console.log("Processed data:", {
          employees: allEmpRows,
          materials: allMatRows,
        });

        setEmployeeDetails(allEmpRows);
        setMaterialUsage(allMatRows);

        setProjectStats({
          weekStats: calculateWeeklyStats(allEmpRows),
          monthStats: calculateMonthlyStats(allMatRows),
          totalEmployees: allEmpRows.length,
          totalMaterials: allMatRows.length,
          profit: 25000, // Should come from your API
          loss: 5000, // Should come from your API
        });
      } catch (err) {
        console.error("DPR Fetch Error:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDprData();
  }, [project]);

  if (loading) {
    return (
      <ScreenWrapper statusBarColor="#4caf50">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={styles.loadingText}>Loading project data...</Text>
          {project?._id ? (
            <Text style={styles.loadingSubtext}>Project ID: {project._id}</Text>
          ) : (
            <Text style={styles.loadingSubtext}>
              Waiting for project data...
            </Text>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper statusBarColor="#4caf50">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading data</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper statusBarColor="#4caf50">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.projectInfoContainer}>
          <Text style={styles.projectInfo}>
            <MaterialIcons name="business" size={16} /> Project:{" "}
            {project?.name || "N/A"}
          </Text>
          <Text style={styles.projectInfo}>
            <MaterialIcons name="date-range" size={16} /> Start Date:{" "}
            {project?.startDate?.split("T")[0] || "N/A"}
          </Text>
          <Text style={styles.projectInfo}>
            <MaterialIcons name="check-circle" size={16} /> Status:{" "}
            {project?.status || "N/A"}
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>🔍 Overview</Text>
          <View style={styles.metricRow}>
            <MaterialIcons
              name="people"
              size={18}
              color="#444"
              style={styles.iconLeft}
            />
            <Text style={styles.metricLabel}>Employees</Text>
            <Text style={styles.metricValue}>
              {projectStats.totalEmployees}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <MaterialIcons
              name="inventory"
              size={18}
              color="#444"
              style={styles.iconLeft}
            />
            <Text style={styles.metricLabel}>Materials</Text>
            <Text style={styles.metricValue}>
              {projectStats.totalMaterials}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <FontAwesome
              name="rupee"
              size={16}
              color="#2e7d32"
              style={styles.iconLeft}
            />
            <Text style={styles.metricLabel}>Profit</Text>
            <Text style={styles.metricValueGreen}>
              {formatCurrency(projectStats.profit)}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <FontAwesome
              name="rupee"
              size={16}
              color="#d32f2f"
              style={styles.iconLeft}
            />
            <Text style={styles.metricLabel}>Loss</Text>
            <Text style={styles.metricValueRed}>
              {formatCurrency(projectStats.loss)}
            </Text>
          </View>
        </View>

        {projectStats.weekStats.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>🗕️ Week-wise Progress</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                  datasets: [{ data: projectStats.weekStats }],
                }}
                width={Math.max(dimensions.width - 40, 300)}
                height={220}
                chartConfig={chartConfig}
                bezier
                fromZero
                style={styles.chart}
              />
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>
            No weekly attendance data available
          </Text>
        )}

        {projectStats.monthStats.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>📈 Month-wise Progress</Text>
            <View style={styles.chartContainer}>
              <BarChart
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [{ data: projectStats.monthStats }],
                }}
                width={Math.max(dimensions.width - 40, 300)}
                height={220}
                chartConfig={chartConfig}
                fromZero
                style={styles.chart}
              />
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>
            No monthly material data available
          </Text>
        )}

        <Text style={styles.sectionTitle}>📋 Employee Attendance</Text>
        {employeeDetails.length > 0 ? (
          <ScrollView horizontal style={styles.horizontalScroll}>
            <View style={{ minWidth: 700 }}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellHeaderWithBorder}>Name</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Date</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Status</Text>
                <Text style={styles.tableCellHeaderWithBorder}>In Time</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Out Time</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Work</Text>
              </View>
              <FlatList
                data={employeeDetails}
                keyExtractor={(item, index) =>
                  `${index}-${item.date}-${item.name}`
                }
                initialNumToRender={10}
                scrollEnabled={true}
                style={{ maxHeight: 250 }}
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCellWithBorder}>{item.name}</Text>
                    <Text style={styles.tableCellWithBorder}>{item.date}</Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.status}
                    </Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.inTime}
                    </Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.outTime}
                    </Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.dailyWork}
                    </Text>
                  </View>
                )}
              />
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>
            No employee attendance records found
          </Text>
        )}

        <Text style={styles.sectionTitle}>📦 Material Usage</Text>
        {materialUsage.length > 0 ? (
          <ScrollView horizontal style={styles.horizontalScroll}>
            <View style={{ minWidth: 800 }}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellHeaderWithBorder}>Code</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Material</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Date</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Added</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Added By</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Consumed</Text>
                <Text style={styles.tableCellHeaderWithBorder}>Remaining</Text>
              </View>
              <FlatList
                data={materialUsage}
                keyExtractor={(item, index) =>
                  `${index}-${item.date}-${item.matCode}`
                }
                initialNumToRender={10}
                scrollEnabled={true}
                style={{ maxHeight: 250 }}
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCellWithBorder}>
                      {item.matCode}
                    </Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.matName}
                    </Text>
                    <Text style={styles.tableCellWithBorder}>{item.date}</Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.quantityAdded}
                    </Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.addedBy}
                    </Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.quantityConsumed}
                    </Text>
                    <Text style={styles.tableCellWithBorder}>
                      {item.remaining}
                    </Text>
                  </View>
                )}
              />
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No material usage records found</Text>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 153, 51, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 10 },
  propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" },
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#eef3f7" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef3f7",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#333",
  },
  loadingSubtext: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#eef3f7",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  errorSubtext: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  projectInfoContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 5,
  },
  projectInfo: {
    fontSize: 15,
    color: "#444",
    marginVertical: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 12,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 20,
    color: "#666",
    fontStyle: "italic",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 3,
  },
  chart: {
    borderRadius: 10,
  },
  cardContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 6,
    marginBottom: 15,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  metricLabel: {
    fontSize: 16,
    color: "#444",
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  metricValueGreen: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  metricValueRed: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ff9933",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableCellHeaderWithBorder: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#fff",
    minWidth: 100,
  },
  tableCellWithBorder: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    minWidth: 100,
  },
  horizontalScroll: {
    marginBottom: 15,
  },
  iconLeft: {
    marginRight: 8,
  },
});

export default StatsAndDprScreen;
