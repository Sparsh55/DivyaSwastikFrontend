import React from "react";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./../Components/screens/Login";
import OtpScreen from "../Components/screens/OtpScreen";
import Dashboard from "../Components/screens/Dashboard";
import CreateNewProject from "../Components/screens/CreateNewProject";
import ManageProjects from "../Components/screens/ManageProjects";
import Projectdashboard from "../Components/screens/Projectdashboard";
import AddUserScreen from "../Components/screens/AddUserScreen";
import Inventory from "../Components/screens/Inventory";
import AddMaterialScreen from "../Components/screens/AddMaterialScreen";
import TakeOutMaterialScreen from "../Components/screens/U-TakeOutMaterialScreen";
import LandingScreen from "../Components/screens/LandingScreen";
import UserManagement from "../Components/screens/UserManagment";
import ManageUsers from "../Components/screens/ManageUsers";
import ManageInventory from "../Components/screens/ManageInventory";
import FullImageScreen from "../Components/screens/FullImageScreen";
import AddNewEmployeeScreen from "../Components/screens/AddNewEmployeeScreen";
import Manpower from "../Components/screens/Manpower";
import LiveAvailabilityScreen from "../Components/screens/LiveAvailabilityScreen";
import MaterialDetailScreen from "../Components/screens/MaterialDetailScreen";
import EditProfileScreen from "../Components/screens/EditProfileScreen";
import CustomHeader from "../Components/screens/CustomHeader";
import ManageEmployee from "../Components/screens/ManageEmployee";
import ManageAttendance from "../Components/screens/ManageAttendance";
import SeeAttendanceScreen from "../Components/screens/SeeAttendanceScreen";
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LandingScreen">
        <Stack.Screen
          name="LandingScreen"
          component={LandingScreen}
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="OtpScreen"
          component={OtpScreen}
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="CreateNewProject"
          component={CreateNewProject}
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="ManageProjects"
          component={ManageProjects}
          options={({ route }) => ({
            animation: "slide_from_right",
            header: () => (
              <CustomHeader
                title={route?.params?.title || "Manage Projects"}
              />
            ),
          })}
        />
        <Stack.Screen
          name="Projectdashboard"
          component={Projectdashboard}
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="AddUserScreen"
          component={AddUserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Inventory"
          component={Inventory}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddMaterialScreen"
          component={AddMaterialScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TakeOutMaterialScreen"
          component={TakeOutMaterialScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserManagment"
          component={UserManagement}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManageUsers"
          component={ManageUsers}
           options={({ route }) => ({
            header: () => (
              <CustomHeader
                title={route?.params?.title || "Manage Users"}
              />
            ),
          })}
        />
        <Stack.Screen
          name="ManageInventory"
          component={ManageInventory}
          options={({ route }) => ({
            header: () => (
              <CustomHeader
                title={route?.params?.title || "Manage Inventory"}
              />
            ),
          })}
        />
        <Stack.Screen
          name="FullImageScreen"
          component={FullImageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddNewEmployeeScreen"
          component={AddNewEmployeeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Manpower"
          component={Manpower}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LiveAvailabilityScreen"
          component={LiveAvailabilityScreen}
         options={({ route }) => ({
            header: () => (
              <CustomHeader
                title={route?.params?.title || "Live Material Availability"}
              />
            ),
          })}
        />
        <Stack.Screen
          name="MaterialDetailScreen"
          component={MaterialDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManageEmployee"
          component={ManageEmployee}
          options={({ route }) => ({
            header: () => (
              <CustomHeader
                title={route?.params?.title || "Manage Employees"}
              />
            ),
          })}
        />
        <Stack.Screen
          name="ManageAttendance"
          component={ManageAttendance}
          options={({ route }) => ({
            header: () => (
              <CustomHeader
                title={route?.params?.title || "Mark Attendance"}
              />
            ),
          })}
        />
         <Stack.Screen
          name="SeeAttendanceScreen"
          component={SeeAttendanceScreen}
          options={({ route }) => ({
            header: () => (
              <CustomHeader
                title={route?.params?.title || "See Live Attendance"}
              />
            ),
          })}
        />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default AppNavigator;
