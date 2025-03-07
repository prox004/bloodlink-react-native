import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase, db, auth } from './config/firebase';
import { UserData } from './config/firebase';

type RootStackParamList = {
  Home: undefined;
  AdditionalData: undefined;
  TabNavigator: undefined;
};

type AdditionalDataScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdditionalData'>;

export default function AdditionalDataScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    bloodType: '',
    phoneNumber: '',
    age: '',
    weight: '',
    address: '',
    city: '',
    lastDonation: '',
    medicalConditions: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigation = useNavigation<AdditionalDataScreenNavigationProp>();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Required fields validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    // Blood type validation
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    if (!formData.bloodType.trim()) {
      newErrors.bloodType = 'Blood type is required';
      isValid = false;
    } else if (!validBloodTypes.includes(formData.bloodType.toUpperCase())) {
      newErrors.bloodType = 'Invalid blood type';
      isValid = false;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number (10 digits required)';
      isValid = false;
    }

    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
      isValid = false;
    } else if (isNaN(age) || age < 18 || age > 65) {
      newErrors.age = 'Age must be between 18 and 65';
      isValid = false;
    }

    // Weight validation
    const weight = parseInt(formData.weight);
    if (!formData.weight.trim()) {
      newErrors.weight = 'Weight is required';
      isValid = false;
    } else if (isNaN(weight) || weight < 45) {
      newErrors.weight = 'Weight must be at least 45 kg';
      isValid = false;
    }

    // Address and city validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveData = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
  
    setIsLoading(true);
    const user = auth.currentUser;
  
    if (!user?.email) {
      Alert.alert('Error', 'User not authenticated or email missing. Please sign in again.');
      setIsLoading(false);
      return;
    }
  
    try {
      // Create base user data
      const userData: Partial<UserData> = {
        uid: user.uid,
        email: user.email,
        fullName: formData.fullName.trim(),
        bloodType: formData.bloodType.toUpperCase().trim(),
        phoneNumber: formData.phoneNumber.trim(),
        age: formData.age.trim(),
        weight: formData.weight.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        isAvailableToDonate: true,
        createdAt: firebase.firestore.Timestamp.now(),
        lastLogin: firebase.firestore.Timestamp.now(),
         // Default points value set to zero
      };
  
      // Only add optional fields if they have values
      if (formData.lastDonation.trim()) {
        userData.lastDonation = formData.lastDonation.trim();
      }
  
      if (formData.medicalConditions.trim()) {
        userData.medicalConditions = formData.medicalConditions.trim();
      }
  
      await db.collection('users').doc(user.uid).set(userData);
  
      Alert.alert(
        'Success',
        'Your profile has been created successfully!',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert(
        'Error',
        'Failed to save your details. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Complete Your Profile</Text>

        {Object.entries({
          fullName: {
            placeholder: "Full Name",
            keyboardType: 'default' as const,
          },
          bloodType: {
            placeholder: "Blood Type (e.g., A+, B-, O+)",
            keyboardType: 'default' as const,
            autoCapitalize: 'characters' as const,
          },
          phoneNumber: {
            placeholder: "Phone Number (10 digits)",
            keyboardType: 'phone-pad' as const,
            maxLength: 10,
          },
          age: {
            placeholder: "Age",
            keyboardType: 'numeric' as const,
          },
          weight: {
            placeholder: "Weight (kg)",
            keyboardType: 'numeric' as const,
          },
          address: {
            placeholder: "Address",
            keyboardType: 'default' as const,
          },
          city: {
            placeholder: "City",
            keyboardType: 'default' as const,
          },
          lastDonation: {
            placeholder: "Last Donation Date (Optional)",
            keyboardType: 'default' as const,
          },
          medicalConditions: {
            placeholder: "Medical Conditions (Optional)",
            keyboardType: 'default' as const,
            multiline: true,
            numberOfLines: 3,
          },
        }).map(([field, config]) => (
          <View key={field} style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                config.multiline && styles.multilineInput,
                errors[field] && styles.inputError
              ]}
              placeholder={config.placeholder}
              value={formData[field as keyof typeof formData]}
              onChangeText={(value) => handleInputChange(field, value)}
              keyboardType={config.keyboardType}
              autoCapitalize={config.autoCapitalize}
              maxLength={config.maxLength}
              multiline={config.multiline}
              numberOfLines={config.numberOfLines}
              editable={!isLoading}
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSaveData}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#fab1a0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});