import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import donorsData from '../../assets/donors.json';
import { MaterialIcons } from '@expo/vector-icons';

interface Donor {
  id: string;
  fullName: string;
  bloodType: string;
  lastDonation: string;
  phoneNumber: string;
  state: string;
  district: string;
  city: string;
}

const NearbyDonors = () => {
  const [donors] = useState<Donor[]>(donorsData.donors);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>(donorsData.donors);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Get unique states from all donors
  const states = [...new Set(donors.map(donor => donor.state))].sort();

  // Get districts based on selected state
  const districts = [...new Set(donors
    .filter(donor => donor.state === selectedState)
    .map(donor => donor.district))].sort();

  // Get cities based on selected state and district
  const cities = [...new Set(donors
    .filter(donor => 
      donor.state === selectedState && 
      donor.district === selectedDistrict
    )
    .map(donor => donor.city))].sort();

  useEffect(() => {
    filterDonors();
  }, [selectedState, selectedDistrict, selectedCity, selectedBloodType]);

  const filterDonors = () => {
    let filtered = [...donors];

    if (selectedState) {
      filtered = filtered.filter(donor => donor.state === selectedState);
    }

    if (selectedDistrict) {
      filtered = filtered.filter(donor => donor.district === selectedDistrict);
    }

    if (selectedCity) {
      filtered = filtered.filter(donor => donor.city === selectedCity);
    }

    if (selectedBloodType) {
      filtered = filtered.filter(donor => donor.bloodType === selectedBloodType);
    }

    setFilteredDonors(filtered);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedDistrict('');
    setSelectedCity('');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedCity('');
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCity('');
    setSelectedBloodType('');
    setFilteredDonors(donors);
    setRefreshing(false);
  }, [donors]);

  const renderDonorCard = ({ item }: { item: Donor }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.bloodTypeContainer}>
          <Text style={styles.bloodType}>{item.bloodType}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.lastDonation}>Last Donation: {item.lastDonation || 'Not Available'}</Text>
        <Text style={styles.location}>{item.city}, {item.district}, {item.state}</Text>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => handleCall(item.phoneNumber)}
        >
          <MaterialIcons name="phone" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.callButtonText}>{item.phoneNumber}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.locationFilters}>
          <View style={styles.pickerContainerThird}>
            <Text style={styles.pickerLabel}>Select State</Text>
            <Picker
              selectedValue={selectedState}
              onValueChange={handleStateChange}
              style={styles.picker}
              itemStyle={{ fontSize: 14, color: '#000' }}
            >
              <Picker.Item label="All States" value="" color="#000" />
              {states.map(state => (
                <Picker.Item key={state} label={state} value={state} color="#000" />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainerThird}>
            <Text style={styles.pickerLabel}>Select District</Text>
            <Picker
              selectedValue={selectedDistrict}
              onValueChange={handleDistrictChange}
              style={styles.picker}
              enabled={!!selectedState}
              itemStyle={{ fontSize: 14, color: '#000' }}
            >
              <Picker.Item label="All Districts" value="" color="#000" />
              {districts.map(district => (
                <Picker.Item key={district} label={district} value={district} color="#000" />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainerThird}>
            <Text style={styles.pickerLabel}>Select City</Text>
            <Picker
              selectedValue={selectedCity}
              onValueChange={setSelectedCity}
              style={styles.picker}
              enabled={!!selectedDistrict}
              itemStyle={{ fontSize: 14, color: '#000' }}
            >
              <Picker.Item label="All Cities" value="" color="#000" />
              {cities.map(city => (
                <Picker.Item key={city} label={city} value={city} color="#000" />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.bloodTypeFilter}>
          <Text style={styles.pickerLabel}>Select Blood Group</Text>
          <Picker
            selectedValue={selectedBloodType}
            onValueChange={setSelectedBloodType}
            style={styles.picker}
            itemStyle={{ fontSize: 14, color: '#000' }}
          >
            <Picker.Item label="All Blood Groups" value="" color="#000" />
            <Picker.Item label="A Positive (A+)" value="A+" color="#000" />
            <Picker.Item label="A Negative (A-)" value="A-" color="#000" />
            <Picker.Item label="B Positive (B+)" value="B+" color="#000" />
            <Picker.Item label="B Negative (B-)" value="B-" color="#000" />
            <Picker.Item label="AB Positive (AB+)" value="AB+" color="#000" />
            <Picker.Item label="AB Negative (AB-)" value="AB-" color="#000" />
            <Picker.Item label="O Positive (O+)" value="O+" color="#000" />
            <Picker.Item label="O Negative (O-)" value="O-" color="#000" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={filteredDonors}
        renderItem={renderDonorCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e74c3c']}
            tintColor="#e74c3c"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    
  },
  locationFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  pickerContainerThird: {
    flex: 1,
    marginHorizontal: 4,
  },
  bloodTypeFilter: {
    marginTop: 5,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    paddingLeft: 4,
  },
  picker: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 60,
    color: '#000',
  },
  list: {
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    
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
  cardBody: {
    padding: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  lastDonation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NearbyDonors; 