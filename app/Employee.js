import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import axios from "../axios";

export default function Employee() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Stats Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmpStats, setSelectedEmpStats] = useState(null);
  const [countLoading, setCountLoading] = useState(false);

  // 1. பணியாளர் பட்டியலை எடுக்க (GET API)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      // உங்கள் Backend-ல் உள்ள URL (/register/ அல்லது /employees/)
      const response = await axios.get("/register/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data || response.data;
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      Alert.alert("Error", "Unable to fetch employee data");
      if (error.response && error.response.status === 401) {
        await AsyncStorage.multiRemove(["token", "user_data"]);
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Status மாற்ற (PATCH API)
  const toggleStatus = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.patch(
        `/employee-status/${id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200) {
        const newStatus = response.data.new_status;
        const updatedList = employees.map((e) =>
          e.id === id ? { ...e, status: newStatus } : e,
        );
        setEmployees(updatedList);
        setFilteredEmployees(updatedList);
      }
    } catch (error) {
      Alert.alert("Error", "நிலை மாற்ற முடியவில்லை.");
    }
  };

  // 4. Search Logic
  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = employees.filter(
      (item) =>
        item.employeeName?.toLowerCase().includes(text.toLowerCase()) ||
        item.phone?.includes(text),
    );
    setFilteredEmployees(filtered);
  };

  const renderEmployeeItem = ({ item }) => (
    <View style={[styles.card, item.status === 2 && styles.inactiveCard]}>
      <View style={styles.cardLeft}>
        <TouchableOpacity onPress={() => handlePhotoClick(item)}>
          <View style={styles.avatar}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {item.employeeName?.charAt(0)}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View>
          <Text
            style={[styles.empName, item.status === 2 && styles.inactiveText]}
          >
            {item.employeeName}
          </Text>
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color="#64748b" />
            <Text style={styles.phoneText}>{item.phone}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.statusBadge,
              item.status === 1 ? styles.bgActive : styles.bgInactive,
            ]}
            onPress={() => toggleStatus(item.id)}
          >
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: item.status === 1 ? "#22c55e" : "#ef4444",
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusBtnText,
                  { color: item.status === 1 ? "#166534" : "#991b1b" },
                ]}
              >
                {item.status === 1 ? "ACTIVE" : "INACTIVE"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() =>
          router.push({ pathname: "/Addemployee", params: { id: item.id } })
        }
      >
        <Ionicons name="create-outline" size={22} color="#1e3a8a" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconCircle}
          >
            <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Employees</Text>
          <TouchableOpacity
            onPress={() => router.push("/Addemployee")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchData} style={styles.iconCircle}>
            <Ionicons name="reload" size={20} color="#1e3a8a" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#94a3b8"
            style={{ marginLeft: 15 }}
          />
          <TextInput
            placeholder="Search employee..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={renderEmployeeItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No employees found.</Text>
          }
        />
      )}

      {/* STATS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedEmpStats?.name}</Text>
            <Text style={styles.modalSubTitle}>Performance Stats</Text>
            <View style={styles.divider} />
            {countLoading ? (
              <ActivityIndicator
                size="large"
                color="#1e3a8a"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {selectedEmpStats?.normalCount}
                  </Text>
                  <Text style={styles.statLabel}>Tasks</Text>
                </View>
                <View
                  style={[
                    styles.statBox,
                    { borderLeftWidth: 1, borderColor: "#e2e8f0" },
                  ]}
                >
                  <Text style={[styles.statNumber, { color: "#f97316" }]}>
                    {selectedEmpStats?.specialCount}
                  </Text>
                  <Text style={styles.statLabel}>Reports</Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerContainer: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  iconCircle: { backgroundColor: "#eff6ff", padding: 8, borderRadius: 12 },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 15,
    marginTop: 15,
    height: 45,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  searchInput: { flex: 1, paddingHorizontal: 15, fontSize: 14 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  inactiveCard: { opacity: 0.6 },
  cardLeft: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "white", fontSize: 22, fontWeight: "bold" },
  empName: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  inactiveText: { textDecorationLine: "line-through", color: "#94a3b8" },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  phoneText: { fontSize: 13, color: "#64748b" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginTop: 8,
    borderWidth: 1,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  bgActive: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  bgInactive: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  statusBtnText: { fontSize: 9, fontWeight: "bold" },
  editBtn: { backgroundColor: "#eff6ff", padding: 10, borderRadius: 12 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { textAlign: "center", marginTop: 50, color: "#94a3b8" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  modalSubTitle: { fontSize: 12, color: "#64748b", marginBottom: 15 },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 15,
  },
  statsContainer: { flexDirection: "row", width: "100%", marginBottom: 20 },
  statBox: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#1e3a8a" },
  statLabel: { fontSize: 11, color: "#64748b" },
  closeBtn: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeBtnText: { color: "white", fontWeight: "bold" },
});
