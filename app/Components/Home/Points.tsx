import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Changed from react-icons
import { View, Text, StyleSheet } from 'react-native'; // Added React Native components
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../Auth/config/firebase';

const BloodPointsCard = () => {
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserPoints = async () => {
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPoints(userData.points || 0); // Default to 0 if points are undefined
        }
      }
    };

    fetchUserPoints();
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>My BloodPoints</Text>
        <Text style={styles.points}>{points !== null ? points : 'Loading...'}</Text>
        <Text style={styles.iconText}>Earn Points after every successful donation. T&C apply</Text>
      </View>
      <View>
        <Icon style={styles.icon} name="wallet" size={24} color="#e74c3c" />
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 25,
    paddingRight: 40,
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,


  },
  title: {
    fontSize: 16,
    fontWeight: 'medium',
  },
  points: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#666',
  },

  icon: {
    fontSize: 70,
    alignSelf: 'center',
  },

  iconText: {
    fontSize: 8.5,
    fontWeight: 'semibold',
    textAlign: 'left',
  },

});

export default BloodPointsCard;
