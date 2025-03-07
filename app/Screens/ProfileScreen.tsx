import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { auth, db } from '../Auth/config/firebase';
import { UserData } from '../Auth/config/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BloodPointsCard from '../Components/Home/Points';
import MyRequests from '../Components/Profile/MyRequests';

type RootStackParamList = {
  EditProfile: { userData: UserData | null };
};

const ProfileScreen = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data() as UserData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserData().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#e74c3c"]}
          tintColor="#e74c3c"
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileInitial}>
            {userData?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{userData?.fullName}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </View>

      <BloodPointsCard />

      <MyRequests />

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => navigation.navigate('EditProfile', { userData })}
          >
            <MaterialIcons name="edit" size={20} color="#2ecc71" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialIcons name="bloodtype" size={24} color="#e74c3c" />
            <Text style={styles.infoLabel}>Blood Type</Text>
            <Text style={styles.infoValue}>{userData?.bloodType}</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={24} color="#3498db" />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{userData?.phoneNumber}</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="calendar-today" size={24} color="#f1c40f" />
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{userData?.age} years</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="fitness-center" size={24} color="#9b59b6" />
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{userData?.weight} kg</Text>
          </View>
        </View>

        <View style={styles.addressSection}>
          <MaterialIcons name="location-on" size={24} color="#e67e22" />
          <View style={styles.addressContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.addressValue}>{userData?.address}, {userData?.city}</Text>
          </View>
        </View>

        {userData?.lastDonation && (
          <View style={styles.donationInfo}>
            <MaterialIcons name="history" size={24} color="#16a085" />
            <View style={styles.donationContent}>
              <Text style={styles.infoLabel}>Last Donation</Text>
              <Text style={styles.infoValue}>{userData.lastDonation}</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileInitial: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
  },
  addressSection: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  addressContent: {
    marginLeft: 15,
    flex: 1,
  },
  addressValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
    lineHeight: 20,
  },
  donationInfo: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  donationContent: {
    marginLeft: 15,
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;
