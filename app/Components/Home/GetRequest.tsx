import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { auth, db } from '../../Auth/config/firebase';
import { MaterialIcons } from '@expo/vector-icons';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodType: string;
  units: number;
  hospital: string;
  contactNumber: string;
  needBloodBy: any; // firebase timestamp
  message?: string;
  status: string;
  userId: string;
  createdAt: any; // firebase timestamp
}

const GetRequest = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const requestsRef = db.collection('bloodRequests');
      const snapshot = await requestsRef
        .where('status', '==', 'active')
        .where('userId', '!=', currentUser.uid)
        .orderBy('userId')
        .orderBy('createdAt', 'desc')
        .get();

      const fetchedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BloodRequest[];

      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  };

  const handleCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Phone calls are not supported on this device');
          return;
        }
        return Linking.openURL(phoneUrl);
      })
      .catch(error => {
        console.error('Error making phone call:', error);
        Alert.alert('Error', 'Could not initiate phone call');
      });
  };

  const renderRequestCard = ({ item }: { item: BloodRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.bloodTypeContainer}>
          <Text style={styles.bloodType}>{item.bloodType}</Text>
        </View>
        <Text style={styles.urgencyLabel}>Need by: {formatDate(item.needBloodBy)}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={20} color="#666" />
          <Text style={styles.infoText}>Patient: {item.patientName}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="local-hospital" size={20} color="#666" />
          <Text style={styles.infoText}>Hospital: {item.hospital}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="opacity" size={20} color="#666" />
          <Text style={styles.infoText}>Units Required: {item.units}</Text>
        </View>

        {item.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => handleCall(item.contactNumber)}
        >
          <MaterialIcons name="phone" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contact: {item.contactNumber}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No active blood requests found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    padding: 15,
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    borderColor:'grey',
    borderWidth:1,
    marginHorizontal:15,
    marginVertical:10   
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bloodTypeContainer: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bloodType: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  urgencyLabel: {
    color: '#666',
    fontSize: 14,
  },
  cardBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  messageContainer: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  messageText: {
    color: '#666',
    fontSize: 14,
  },
  contactButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default GetRequest; 