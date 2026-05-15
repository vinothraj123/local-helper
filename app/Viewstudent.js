import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform, // Platform detection சேர்க்கப்பட்டுள்ளது
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "../axios";

export default function Viewstudent() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudentStats, setSelectedStudentStats] = useState(null);
  const [countLoading, setCountLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get("/student/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = response.data.data || response.data;
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert("Session Expired", "Please login again.");
        await AsyncStorage.multiRemove(["token", "user_data"]);
        router.replace("/login");
        return;
      }
      Alert.alert("Error", "Unable to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Logic with Platform Support (Android, iOS, Web)
  const deleteProcess = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.delete(`/student/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 204) {
        if (Platform.OS === "web") {
          alert("Student deleted successfully");
        } else {
          Alert.alert("Success", "Student deleted successfully");
        }
        setStudents((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Delete Error:", error);
      Alert.alert("Error", "மாணவரை நீக்க முடியவில்லை.");
    }
  };

  const handleDelete = (id, name) => {
    if (Platform.OS === "web") {
      // Web/Safari-க்கு browser confirm பயன்படுத்தப்படுகிறது
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${name}?`,
      );
      if (confirmDelete) {
        deleteProcess(id);
      }
    } else {
      // Mobile-க்கு Native Alert
      Alert.alert(
        "Confirm Delete",
        `Are you sure you want to delete ${name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteProcess(id),
          },
        ],
      );
    }
  };

  const handlePhotoClick = async (student) => {
    setModalVisible(true);
    setCountLoading(true);
    setSelectedStudentStats({
      name: student.studentName,
      normalCount: 0,
      specialCount: 0,
    });

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`/student-count/${student.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status.code === 200) {
        const counts = response.data.data;
        setSelectedStudentStats({
          name: student.studentName,
          normalCount: counts.normal_count,
          specialCount: counts.special_count,
        });
      }
    } catch (error) {
      console.error("Count Error:", error);
    } finally {
      setCountLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.patch(
        `/student-status/${id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200) {
        const newStatus = response.data.new_status;
        setStudents((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
        );
      }
    } catch (error) {
      Alert.alert("Error", "நிலை மாற்ற முடியவில்லை.");
    }
  };

  const renderGroupedStudents = () => {
    const filtered = students.filter(
      (item) =>
        item.studentName?.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        item.mobilenumber?.includes(searchQuery),
    );

    const groups = {};
    filtered.forEach((item) => {
      const firstLetter = item.studentName
        ? item.studentName.charAt(0).toUpperCase()
        : "#";
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(item);
    });

    const sortedLetters = Object.keys(groups).sort();

    if (sortedLetters.length === 0) {
      return <Text style={styles.emptyText}>No students found.</Text>;
    }

    let globalIndex = 0;

    return sortedLetters.map((letter) => (
      <View key={letter}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionText}>{letter}</Text>
          <View style={styles.sectionLine} />
        </View>
        {groups[letter]
          .sort((a, b) => a.studentName.localeCompare(b.studentName))
          .map((item) => {
            const currentIndex = globalIndex++;
            return (
              <View key={item.id.toString()}>
                {renderStudentItem({ item, index: currentIndex })}
              </View>
            );
          })}
      </View>
    ));
  };

  const renderStudentItem = ({ item, index }) => (
    <View
      style={[styles.studentCard, item.status === 2 && styles.inactiveCard]}
    >
      <View style={styles.cardLeft}>
        <View style={styles.serialNumberContainer}>
          <Text style={styles.serialNumberText}>{index + 1}.</Text>
        </View>

        <TouchableOpacity onPress={() => handlePhotoClick(item)}>
          <View style={styles.avatar}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {item.studentName?.charAt(0)}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View>
          <Text
            style={[
              styles.studentName,
              item.status === 2 && styles.inactiveText,
            ]}
          >
            {item.studentName}
          </Text>
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color="#64748b" />
            <Text style={styles.phoneText}>{item.mobilenumber}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.statusToggle,
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

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            router.push({ pathname: "/Editstudent", params: { id: item.id } })
          }
        >
          <Ionicons name="create-outline" size={20} color="#1e3a8a" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.editBtn,
            { backgroundColor: "#fee2e2", marginLeft: 8 },
          ]}
          onPress={() => handleDelete(item.id, item.studentName)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
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
          <Text style={styles.headerTitle}>Academy Students</Text>
          <TouchableOpacity
            onPress={() => router.push("/Addstudent")}
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
            placeholder="Search by first letter..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderGroupedStudents()}
        </ScrollView>
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
            <Text style={styles.modalTitle}>{selectedStudentStats?.name}</Text>
            <Text style={styles.modalSubTitle}>Class Statistics</Text>
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
                    {selectedStudentStats?.normalCount}
                  </Text>
                  <Text style={styles.statLabel}>Normal Class</Text>
                </View>
                <View
                  style={[
                    styles.statBox,
                    { borderLeftWidth: 1, borderColor: "#e2e8f0" },
                  ]}
                >
                  <Text style={[styles.statNumber, { color: "#f97316" }]}>
                    {selectedStudentStats?.specialCount}
                  </Text>
                  <Text style={styles.statLabel}>Special Class</Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Dismiss</Text>
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
  actionButtons: { flexDirection: "row", alignItems: "center" },
  editBtn: {
    backgroundColor: "#eff6ff",
    padding: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  sectionText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  studentCard: {
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
  serialNumberContainer: { justifyContent: "center", marginRight: 8 },
  serialNumberText: { fontSize: 12, fontWeight: "bold", color: "#64748b" },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "white", fontSize: 20, fontWeight: "bold" },
  studentName: { fontSize: 15, fontWeight: "bold", color: "#1e293b" },
  inactiveText: { textDecorationLine: "line-through", color: "#94a3b8" },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  phoneText: { fontSize: 12, color: "#64748b" },
  statusToggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
    borderWidth: 1,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  bgActive: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  bgInactive: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  statusBtnText: { fontSize: 9, fontWeight: "bold" },
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
    elevation: 10,
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
