import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const Manpower = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manpower Management</Text>

      <View style={styles.cardContainer}>
        {/* Row 1: Add New Employee + Manage Employees */}
        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('AddNewEmployeeScreen')}
          >
            <Icon name="account-plus" size={42} color="#4A90E2" />
            <Text style={styles.cardText}>Add New Employee</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('ManageEmployee')}
          >
            <Icon name="account-multiple" size={42} color="#4A90E2" />
            <Text style={styles.cardText}>Manage Employees</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Manage Attendance + See Attendance */}
        <View style={[styles.row, { marginTop: 0 }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('ManageAttendance')}
          >
            <Icon name="calendar-check" size={42} color="#4A90E2" />
            <Text style={styles.cardText}>Mark Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('SeeAttendanceScreen')}
          >
            <Icon name="clipboard-list-outline" size={42} color="#4A90E2" />
            <Text style={styles.cardText}>See Attendance</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Manpower;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FC',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 35,
    alignSelf: 'center',
    paddingBottom: 8,
    width: '80%',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.42,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    padding: 10,
    marginTop: 42,
  },
  cardText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
});
