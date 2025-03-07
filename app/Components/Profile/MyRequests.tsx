import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../../Auth/config/firebase';

interface BloodRequest {
  id: string;
  bloodType: string;
  units: number;
  hospital: string;
  city: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  urgency: 'normal' | 'urgent' | 'emergency';
}

const MyRequests = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const requestsRef = await db
          .collection('bloodRequests')
          .where('userId', '==', currentUser.uid)
          .orderBy('createdAt', 'desc')
          .get();

        const requestsData = requestsRef.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BloodRequest[];

        setRequests(requestsData);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await db.collection('bloodRequests').doc(requestId).update({
        status: 'cancelled'
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#2ecc71';
      case 'completed': return '#3498db';
      case 'cancelled': return '#e74c3c';
      default: return '#666';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return '#e74c3c';
      case 'urgent': return '#f39c12';
      case 'normal': return '#2ecc71';
      default: return '#666';
    }
  };

  const renderRequest = ({ item }: { item: BloodRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.bloodTypeContainer}>
          <Text style={styles.bloodType}>{item.bloodType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{(item.status || 'unknown').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="local-hospital" size={16} color="#666" />
          <Text style={styles.infoText}>{item.hospital}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.infoText}>{item.city}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="opacity" size={16} color="#666" />
          <Text style={styles.infoText}>{item.units} units needed</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.infoText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.urgencyBadge}>
          <Text style={[styles.urgencyText, { color: getUrgencyColor(item.urgency) }]}>
            {(item.urgency || 'normal').toUpperCase()}
          </Text>
        </View>

        {item.status === 'active' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(item.id)}
          >
            <MaterialIcons name="close" size={16} color="#fff" />
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRequests().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Blood Requests</Text>
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No blood requests found</Text>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#e74c3c']}
              tintColor="#e74c3c"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 15,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 5,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
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
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  urgencyBadge: {
    marginTop: 8,
    marginBottom: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MyRequests; 