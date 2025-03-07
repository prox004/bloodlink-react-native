
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { auth, db } from '../Auth/config/firebase';
import { UserData } from '../Auth/config/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

interface EditProfileProps {
  route: {
    params: {
      userData: UserData;
    };
  };
}

const EditProfileScreen: React.FC<EditProfileProps> = ({ route }) => {
  const { userData } = route.params;
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    fullName: userData.fullName || '',
    phoneNumber: userData.phoneNumber || '',
    age: userData.age || '',
    weight: userData.weight || '',
    address: userData.address || '',
    city: userData.city || '',
    bloodType: userData.bloodType || '',
    lastDonation: userData.lastDonation || '',
    medicalConditions: userData.medicalConditions || '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleUpdate = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Basic validation
      if (!formData.fullName || !formData.phoneNumber || !formData.bloodType) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      await db.collection('users').doc(currentUser.uid).update({
        ...formData,
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            placeholder="Enter full name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Blood Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.bloodType}
              onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Blood Type" value="" />
              {bloodTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            keyboardType="numeric"
            placeholder="Enter phone number"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            keyboardType="numeric"
            placeholder="Enter age"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            keyboardType="numeric"
            placeholder="Enter weight"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Enter address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            placeholder="Enter city"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Donation Date</Text>
          <TextInput
            style={styles.input}
            value={formData.lastDonation}
            onChangeText={(text) => setFormData({ ...formData, lastDonation: text })}
            placeholder="DD/MM/YYYY"
          />
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  picker: {
    height: 50,
  },
  updateButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 