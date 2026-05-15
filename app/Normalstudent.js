import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "../axios";

// ✅ Web-safe Alert
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ✅ Web Date Picker Modal
const WebDatePickerModal = ({ visible, value, onClose, onSelect }) => {
  if (!visible) return null;
  const formatted = value.toISOString().split("T")[0];
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={webPickerStyles.overlay}>
        <View style={webPickerStyles.box}>
          <Text style={webPickerStyles.title}>Select Date</Text>
          <input
            type="date"
            defaultValue={formatted}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split("-");
                onSelect(new Date(y, m - 1, d));
              }
            }}
            style={webPickerStyles.input}
          />
          <View style={webPickerStyles.btnRow}>
            <TouchableOpacity
              style={webPickerStyles.cancelBtn}
              onPress={onClose}
            >
              <Text style={webPickerStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={webPickerStyles.doneBtn} onPress={onClose}>
              <Text style={webPickerStyles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function NormalStudents() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [markedList, setMarkedList] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showWebPicker, setShowWebPicker] = useState(false);

  // ✅ Safe Date Formatting for API
  const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedDate]),
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const resStudents = await axios.get("/student/", config);
      const allStudents = resStudents.data.data || resStudents.data;

      let normalOnes = allStudents.filter(
        (s) => s.classType === 1 || s.classType === 3,
      );

      if (Array.isArray(normalOnes)) {
        normalOnes.sort((a, b) =>
          (a.studentName || "").localeCompare(b.studentName || ""),
        );
      }

      const resAttendance = await axios.get(
        `/attendance/?date=${formattedDate}&session_type=1`,
        config,
      );
      const attendanceData = resAttendance.data.data || [];

      const markedMap = {};
      attendanceData.forEach((att) => {
        markedMap[att.studentId] = att.status;
      });

      setMarkedList(markedMap);
      setStudents(normalOnes);
    } catch (error) {
      showAlert("Error", "தகவல்களைப் பெற முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ New Logic for Grouping

  const renderGroupedStudents = () => {
    const filtered = students.filter((s) =>
      s.studentName.toLowerCase().startsWith(searchQuery.toLowerCase()),
    );

    const groups = {};
    filtered.forEach((student) => {
      const firstLetter = student.studentName.charAt(0).toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(student);
    });

    return Object.keys(groups)
      .sort()
      .map((letter) => (
        <View key={letter}>
          {/* Section Header: --- A --- */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionText}>{letter}</Text>
            <View style={styles.sectionLine} />
          </View>
          {groups[letter].map((student) => (
            <View key={student.id}>{renderStudent({ item: student })}</View>
          ))}
        </View>
      ));
  };

  const markAttendance = async (studentId, status) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        studentId,
        status,
        date: formattedDate,
        session_type: 1,
      };
      const response = await axios.post("/attendance/", payload, config);
      if (response.data.status.response === "success") {
        setMarkedList((prev) => ({ ...prev, [studentId]: status }));
      }
    } catch (error) {
      showAlert("Error", "பதிவு செய்ய முடியவில்லை.");
    }
  };

  const resetAttendance = (studentId) => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to reset this attendance?"))
        doReset(studentId);
    } else {
      Alert.alert(
        "Reset Attendance",
        "Are you sure you want to reset this attendance?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reset",
            style: "destructive",
            onPress: () => doReset(studentId),
          },
        ],
      );
    }
  };

  const doReset = async (studentId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.delete(`/attendance/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { studentId, date: formattedDate, session_type: 1 },
      });

      if (
        response.data.status.code === 200 ||
        response.data.status.response === "success"
      ) {
        setMarkedList((prev) => {
          const newList = { ...prev };
          delete newList[studentId];
          return newList;
        });
      }
    } catch (error) {
      showAlert("Error", "Attendance reset failed.");
    }
  };

  const onDateChange = (event, date) => {
    setShowPicker(false);
    if (date) setSelectedDate(date);
  };

  const renderStudent = ({ item }) => {
    const isMarked = markedList[item.id];
    return (
      <View style={[styles.studentCard, isMarked && styles.markedCard]}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {item.studentName?.charAt(0)}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={[styles.studentName, isMarked && { color: "#94a3b8" }]}
              >
                {item.studentName}
              </Text>
              {isMarked && (
                <TouchableOpacity
                  onPress={() => resetAttendance(item.id)}
                  style={styles.miniRefresh}
                >
                  <Ionicons name="refresh-circle" size={28} color="#1e3a8a" />
                </TouchableOpacity>
              )}
            </View>
            {isMarked ? (
              <View style={styles.statusBadge}>
                <Ionicons
                  name={
                    isMarked === "Absent" ? "close-circle" : "checkmark-circle"
                  }
                  size={16}
                  color={isMarked === "Absent" ? "#ef4444" : "#059669"}
                />
                <Text
                  style={[
                    styles.markedText,
                    { color: isMarked === "Absent" ? "#ef4444" : "#059669" },
                  ]}
                >
                  {isMarked}
                </Text>
              </View>
            ) : (
              <Text style={styles.studentPhone}>{item.mobilenumber}</Text>
            )}
          </View>
        </View>
        {!isMarked && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.absentBtn]}
              onPress={() => markAttendance(item.id, "Absent")}
            >
              <Text style={styles.absentText}>Absent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.presentBtn]}
              onPress={() => markAttendance(item.id, "Present")}
            >
              <Text style={styles.presentText}>Present</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {Platform.OS === "web" && (
        <WebDatePickerModal
          visible={showWebPicker}
          value={selectedDate}
          onClose={() => setShowWebPicker(false)}
          onSelect={(date) => {
            setSelectedDate(date);
            setShowWebPicker(false);
          }}
        />
      )}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconCircle}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Platform.OS === "web" ? setShowWebPicker(true) : setShowPicker(true)
          }
          style={styles.dateSelector}
        >
          <Text style={styles.headerTitle}>Normal Class</Text>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color="#bfdbfe" />
            <Text style={styles.headerSub}>{selectedDate.toDateString()}</Text>
            <Ionicons name="chevron-down" size={12} color="#bfdbfe" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={fetchData} style={styles.iconCircle}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {showPicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748b" />
          <TextInput
            placeholder="Search Student..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(t) => setSearchQuery(t)}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1e3a8a"
            style={{ marginTop: 50 }}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {renderGroupedStudents()}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const webPickerStyles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    width: 300,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    marginBottom: "16px",
    outline: "none",
  },
  btnRow: { flexDirection: "row", gap: 10, width: "100%" },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  cancelText: { color: "#64748b", fontWeight: "700" },
  doneBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
  },
  doneText: { color: "#fff", fontWeight: "700" },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f7ff" },
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  dateSelector: { alignItems: "center" },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 13, color: "#bfdbfe" },
  iconCircle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
  },
  content: { flex: 1, paddingHorizontal: 18 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    marginTop: -27,
    elevation: 8,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#1e293b", fontWeight: "500" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#cbd5e1",
  },
  sectionText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
  },
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginTop: 15,
    elevation: 3,
  },
  markedCard: {
    backgroundColor: "#f8fafc",
    elevation: 0,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#1e3a8a" },
  studentName: { fontSize: 16, fontWeight: "bold", color: "#1e3a8a" },
  miniRefresh: { padding: 4 },
  studentPhone: { fontSize: 12, color: "#64748b" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  markedText: { fontSize: 13, fontWeight: "bold" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  absentBtn: { backgroundColor: "#fff", borderColor: "#ef4444" },
  absentText: { color: "#ef4444", fontWeight: "bold" },
  presentBtn: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  presentText: { color: "#fff", fontWeight: "bold" },
});
