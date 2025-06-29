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

const UserManagement = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>

      <View style={styles.cardContainer}>
        {/* Add New User Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => navigation.navigate('AddUserScreen')}
        >
          <Icon name="account-plus" size={42} color="#4A90E2" />
          <Text style={styles.cardText}>Add New User</Text>
        </TouchableOpacity>

        {/* Manage Existing Users Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => navigation.navigate('ManageUsers')}
        >
          <Icon name="account-group-outline" size={42} color="#4A90E2" />
          <Text style={styles.cardText}>Manage Existing Users</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserManagement;

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
