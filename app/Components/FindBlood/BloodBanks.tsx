import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Linking, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import banksData from '../../assets/banks.json';

interface BloodInventory {
  [key: string]: number;  // e.g., "A+": 50
}

interface BloodBank {
  id: string;
  name: string;
  address: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  phoneNumber: string;
  operatingHours: string;
  bloodInventory: BloodInventory;
}

const BloodBanks = () => {
  const [banks] = useState<BloodBank[]>(banksData.banks as BloodBank[]);
  const [filteredBanks, setFilteredBanks] = useState<BloodBank[]>(banksData.banks as BloodBank[]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const states = [...new Set(banks.map(bank => bank.state))].sort();
  const districts = [...new Set(banks
    .filter(bank => bank.state === selectedState)
    .map(bank => bank.district))].sort();
  const cities = [...new Set(banks
    .filter(bank => 
      bank.state === selectedState && 
      bank.district === selectedDistrict
    )
    .map(bank => bank.city))].sort();

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedDistrict('');
    setSelectedCity('');
    filterBanks(value, '', '', selectedBloodType);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedCity('');
    filterBanks(selectedState, value, '', selectedBloodType);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    filterBanks(selectedState, selectedDistrict, value, selectedBloodType);
  };

  const handleBloodTypeChange = (value: string) => {
    setSelectedBloodType(value);
    filterBanks(selectedState, selectedDistrict, selectedCity, value);
  };

  const filterBanks = (state: string, district: string, city: string, bloodType: string) => {
    let filtered = [...banks];

    if (state) {
      filtered = filtered.filter(bank => bank.state === state);
    }
    if (district) {
      filtered = filtered.filter(bank => bank.district === district);
    }
    if (city) {
      filtered = filtered.filter(bank => bank.city === city);
    }
    if (bloodType) {
      filtered = filtered.filter(bank => bank.bloodInventory[bloodType] > 0);
    }

    setFilteredBanks(filtered);
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
    setFilteredBanks(banks);
    setRefreshing(false);
  }, [banks]);

  const renderBankCard = ({ item }: { item: BloodBank }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.bankName}>{item.name}</Text>
        <Text style={styles.operatingHours}>{item.operatingHours}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.address}>{item.address}</Text>
          </View>
          <Text style={styles.locationText}>
            {item.city}, {item.district}, {item.state} - {item.pincode}
          </Text>
        </View>

        <View style={styles.bloodInventorySection}>
          <Text style={styles.sectionTitle}>Available Blood Units</Text>
          <View style={styles.bloodGrid}>
            {Object.entries(item.bloodInventory).map(([type, volume]) => (
              <View 
                key={type} 
                style={[
                  styles.bloodTypeChip,
                  { backgroundColor: volume === 0 ? '#f8f8f8' : '#fff' }
                ]}
              >
                <Text style={styles.bloodType}>{type}</Text>
                <Text style={[
                  styles.bloodVolume,
                  { color: volume === 0 ? '#666' : volume < 10 ? '#e74c3c' : '#2ecc71' }
                ]}>
                  {volume} units
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => handleCall(item.phoneNumber)}
        >
          <MaterialIcons name="phone" size={24} color="#fff" />
          <Text style={styles.callButtonText}>Call {item.phoneNumber}</Text>
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
              onValueChange={handleCityChange}
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
            onValueChange={handleBloodTypeChange}
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
        data={filteredBanks}
        renderItem={renderBankCard}
        keyExtractor={item => item.id}
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bankName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  operatingHours: {
    color: '#666',
    fontSize: 14,
  },
  cardBody: {
    padding: 15,
  },
  infoSection: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 15,
  },
  locationText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 30,
  },
  bloodInventorySection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodTypeChip: {
    width: '23%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  bloodType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bloodVolume: {
    fontSize: 12,
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BloodBanks; 