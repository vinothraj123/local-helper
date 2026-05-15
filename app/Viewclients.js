import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../axios"; // ✅ CORRECT

import { Stack, useRouter } from "expo-router";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Viewclients() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token'); 

      // 2. Auth Header Setup pannunga
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Inga thaan token set aaguthu
        },
      };

   
      const response = await axios.get("/client/", config); 
      
      const clientData = response.data.data || response.data;
      setClients(clientData);

    } catch (error) {
      console.error("Terminal Error:", error.response?.data || error.message);

      if (error.response) {
        // Token thappa irunthaal (401) login-ku thirumba anuppunga
        if (error.response.status === 401) {
          Alert.alert("Session Expired", "Thirumba Login pannunga thambi!");
          router.replace("/login");
          return;
        }
        Alert.alert("Server Error", error.response.data?.message || "Data kidaikkala");
      } else {
        Alert.alert("Network Error", "Server connection check pannunga!");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
                  <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Clients</Text>
        <TouchableOpacity onPress={fetchData}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* LOADING SPINNER */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4c1d95" />
          <Text style={{marginTop: 10, color: '#64748b'}}>Loading clients...</Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No clients found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.clientCard}>
              <View style={styles.cardInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.client_name?.charAt(0) || 'C'}</Text>
                </View>
                <View>
                  <Text style={styles.clientName}>{item.client_name}</Text>
                  <Text style={styles.clientInfo}>
                    <Ionicons name="call-outline" size={14} /> {item.phone}
                  </Text>
                  <Text style={styles.clientInfo}>
                    <Ionicons name="location-outline" size={14} /> {item.address || item.pincode}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.viewBtn}
                // onPress={() => router.push({ pathname: '/ClientDetails', params: { id: item.id } })}
              >
                <Ionicons name="chevron-forward" size={20} color="#4c1d95" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { 
    backgroundColor: '#4c1d95', 
    padding: 20, 
    paddingTop: 70, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  clientCard: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#ede9fe', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  avatarText: { color: '#4c1d95', fontSize: 20, fontWeight: 'bold' },
  clientName: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },
  clientInfo: { fontSize: 13, color: '#64748b', marginTop: 2 },
  
  viewBtn: { backgroundColor: '#f5f3ff', padding: 8, borderRadius: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b', fontSize: 16 }
});