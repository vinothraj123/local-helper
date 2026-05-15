import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import { Stack, useRouter } from "expo-router";
import { useState } from 'react'; // ✅ 'useState' இங்கே சேர்க்கப்பட்டுள்ளது
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import axios from "../axios";

export default function AddClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    mobilenumber: '',
    address: '',
    email: '', // Email ஸ்டேட்டையும் இங்கே சேர்த்துவிடுவது நல்லது
    dateOfJoining: new Date().toISOString().split('T')[0]
  });

  // காண்டாக்ட் பிக்கர் ஃபங்க்ஷன்
  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const contact = await Contacts.presentContactPickerAsync();
      
      if (contact) {
        const name = contact.name;
        const rawNumber = contact.phoneNumbers?.[0]?.number || '';
        const cleanNumber = rawNumber.replace(/\D/g, '').slice(-10); 

        setFormData({
          ...formData,
          clientName: name,
          mobilenumber: cleanNumber
        });
      }
    } else {
      Alert.alert("Permission Denied", "காண்டாக்ட்களைப் பார்க்க அனுமதி தேவை.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.mobilenumber) {
      Alert.alert("Required", "⚠️ Please fill Client Name and Mobile Number!");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post('client/', formData, config);

      // 
      if (response.status === 200 || response.status === 201) {
            const newClientId = response.data.data.id; // Unga API puthiya ID-ya tharumla, athai eduthukkonga
            Alert.alert("✅ Success", "Client added successfully!");
            
            // Back pogum pothu params anuppukirom
            router.replace({
              pathname: '/AddLoan', 
              params: { newAddedId: newClientId } 
            });
          }
    } catch (error) {
      console.error('Submit Error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Failed to add client. Check network.";
      Alert.alert("❌ Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Client</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formArea}>
        
        {/* காண்டாக்ட் செலக்ட் செய்யும் பட்டன் இப்போது ஃபார்மிற்குள் இருக்கிறது */}
        <TouchableOpacity 
          style={styles.contactPickerBtn} 
          onPress={pickContact}
        >
          <Ionicons name="person-add" size={20} color="#4c1d95" />
          <Text style={styles.contactPickerText}>Select from Contacts</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Client Name *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter Name"
          value={formData.clientName}
          onChangeText={(val) => setFormData({...formData, clientName: val})}
        />

        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="10 Digit Number"
          keyboardType="numeric"
          maxLength={10}
          value={formData.mobilenumber}
          onChangeText={(val) => setFormData({...formData, mobilenumber: val})}
        />

       

        <Text style={styles.label}>Address</Text>
        <TextInput 
          style={[styles.input, { height: 80 }]} 
          placeholder="Full Address"
          multiline
          value={formData.address}
          onChangeText={(val) => setFormData({...formData, address: val})}
        />

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Submit Client Details</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#4c1d95', padding: 20, paddingTop: 70, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  formArea: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 16, color: '#000' },
  submitBtn: { backgroundColor: '#4c1d95', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 40 },
  submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  contactPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#4c1d95',
    justifyContent: 'center'
  },
  contactPickerText: {
    color: '#4c1d95',
    fontWeight: 'bold',
    marginLeft: 8
  }
});