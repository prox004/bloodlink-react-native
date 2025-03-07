import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NearbyDonors from '../Components/FindBlood/NearbyDonors';
import BloodBanks from '../Components/FindBlood/BloodBanks';

export default function FindBlood() {
  const [activeTab, setActiveTab] = useState(0);

  const renderNearbyDonors = () => {
    return <NearbyDonors />;
  };

  const renderBloodBanks = () => {
    return <BloodBanks />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Blood</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 0 && styles.activeTab]} 
          onPress={() => setActiveTab(0)}
        >
          <MaterialIcons 
            name="people-outline" 
            size={24} 
            color={activeTab === 0 ? '#e74c3c' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
            Nearby Donors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 1 && styles.activeTab]} 
          onPress={() => setActiveTab(1)}
        >
          <MaterialIcons 
            name="local-hospital" 
            size={24} 
            color={activeTab === 1 ? '#e74c3c' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
            Blood Banks
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 0 ? renderNearbyDonors() : renderBloodBanks()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#e74c3c',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#e74c3c',
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});