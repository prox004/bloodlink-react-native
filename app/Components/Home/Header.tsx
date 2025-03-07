import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, db } from '../../Auth/config/firebase'; // Import Firestore
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions

type RootStackParamList = {
  Profile: undefined;
  Dashboard: undefined;
  Inbox: undefined;
};

const Header = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = auth?.currentUser; // Assuming `Auth` is your Firebase Auth instance
  const [userFullName, setUserFullName] = useState<string>('User');
  const [loading, setLoading] = useState<boolean>(true); // To handle loading state
  const userUID = user?.uid || "Unknown UID"; // Get the user UID

  // Fetch user's full name from Firestore
  useEffect(() => {
    const fetchUserFullName = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserFullName(userDoc.data()?.fullName || 'User');
          } else {
            console.log('No such user!');
            setUserFullName('User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false); // Set loading state to false once data is fetched
        }
      }
    };

    fetchUserFullName();
  }, [user?.uid]);

  const profileIcon = userFullName[0];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.greeting}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hello ,</Text>
        <Text style={styles.userName}>{userFullName}</Text>
      </View>
      <TouchableOpacity
        style={styles.profileIcon}
        onPress={() => navigation.navigate('Profile')} // Navigating to ProfileScreen
      >
        <Text style={styles.profileIconText}>{profileIcon}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'normal',
    //fontFamily: 'lato',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    //fontFamily: 'lato',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Header;
