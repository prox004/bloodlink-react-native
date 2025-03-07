import 'react-native-get-random-values';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { auth, db } from '../Auth/config/firebase'
import firebase from 'firebase/compat/app'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = {
  TabNavigator: { screen: string } | undefined;
};

const validationSchema = Yup.object().shape({
  patientName: Yup.string().required('Patient name is required'),
  patientDOB: Yup.date().required('Date of birth is required'),
  bloodType: Yup.string()
    .matches(/^(A|B|AB|O)[+-]$/, 'Invalid blood type')
    .required('Blood type is required'),
  units: Yup.number()
    .min(0.5, 'Must be at least 0.5 units')
    .max(10, 'Cannot exceed 10 units')
    .required('Number of units is required'),
  needBloodBy: Yup.date()
    .min(new Date(), 'Date cannot be in the past')
    .required('Blood requirement date is required'),
  message: Yup.string()
    .max(500, 'Message cannot exceed 500 characters'),
  hospital: Yup.string().required('Hospital name is required'),
  contactNumber: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Contact number is required'),
})

export default function AddRequest() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false)
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleSubmit = async (values: any) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('You must be logged in to submit a request')
        return;
      }
  
      const requestData = {
        ...values,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'active',  // Added status field
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        patientDOB: firebase.firestore.Timestamp.fromDate(values.patientDOB),
        needBloodBy: firebase.firestore.Timestamp.fromDate(values.needBloodBy),
        units: Number(values.units)
      }
  
      await db.collection('bloodRequests').add(requestData)
      alert('Blood request submitted successfully!')
      navigation.navigate('TabNavigator', { screen: 'Dashboard' })
      
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request. Please try again.')
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Blood Donation Request</Text>
      
      <Formik
        initialValues={{
          patientName: '',
          patientDOB: new Date(),
          bloodType: '',
          units: '',
          hospital: '',
          contactNumber: '',
          needBloodBy: new Date(),
          message: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('patientName')}
                value={values.patientName}
                placeholder="Enter patient name"
              />
              {touched.patientName && errors.patientName && (
                <Text style={styles.errorText}>{errors.patientName}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{values.patientDOB.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={values.patientDOB}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false)
                    if (selectedDate) {
                      setFieldValue('patientDOB', selectedDate)
                    }
                  }}
                />
              )}
              {touched.patientDOB && errors.patientDOB && (
                <Text style={styles.errorText}>{String(errors.patientDOB)}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Blood Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  style={styles.picker}
                  selectedValue={values.bloodType}
                  onValueChange={(itemValue) => setFieldValue('bloodType', itemValue)}
                >
                  <Picker.Item label="Select Blood Type" value="" />
                  {bloodTypes.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
              {touched.bloodType && errors.bloodType && (
                <Text style={styles.errorText}>{errors.bloodType}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Units Required ( Max 10 Units )</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('units')}
                value={String(values.units)}
                keyboardType="numeric"
                placeholder="Enter number of units needed"
              />
              {touched.units && errors.units && (
                <Text style={styles.errorText}>{errors.units}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Need Blood By</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDeadlinePicker(true)}
              >
                <Text>{values.needBloodBy.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showDeadlinePicker && (
                <DateTimePicker
                  value={values.needBloodBy}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDeadlinePicker(false)
                    if (selectedDate) {
                      setFieldValue('needBloodBy', selectedDate)
                    }
                  }}
                />
              )}
              {touched.needBloodBy && errors.needBloodBy && (
                <Text style={styles.errorText}>{String(errors.needBloodBy)}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hospital Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('hospital')}
                value={values.hospital}
                placeholder="Enter hospital name"
              />
              {touched.hospital && errors.hospital && (
                <Text style={styles.errorText}>{errors.hospital}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Additional Message</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                onChangeText={handleChange('message')}
                value={values.message}
                placeholder="Enter additional details or message"
                multiline
                numberOfLines={4}
              />
              {touched.message && errors.message && (
                <Text style={styles.errorText}>{errors.message}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('contactNumber')}
                value={values.contactNumber}
                keyboardType="numeric"
                placeholder="Enter 10-digit number"
              />
              {touched.contactNumber && errors.contactNumber && (
                <Text style={styles.errorText}>{errors.contactNumber}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'semibold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 60,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
})