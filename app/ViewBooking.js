import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import axios from "../axios";

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

export default function ViewBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showWebPicker, setShowWebPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const todayStr = new Date().toISOString().split("T")[0];
  const formattedDate = selectedDate.toISOString().split("T")[0];

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [formattedDate]),
  );

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/booking/?date=${formattedDate}`);
      setBookings(res.data.data || []);
    } catch (error) {
      Alert.alert("Error", "தகவல்களைப் பெற முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, d) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (d) setSelectedDate(d);
    } else {
      if (d) setTempDate(d);
    }
  };

  const confirmIOSDate = () => {
    setSelectedDate(tempDate);
    setShowPicker(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "நிச்சயமாக நீக்க வேண்டுமா?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`/booking/${id}/`);
            fetchBookings();
            Alert.alert("Success", "புக்கிங் நீக்கப்பட்டது.");
          } catch (error) {
            Alert.alert("Error", "நீக்க முடியவில்லை.");
          }
        },
      },
    ]);
  };

  const renderBooking = ({ item }) => {
    const isToday = item.booking_date === todayStr;
    const isCollected = item.payment_status === "Collected";

    return (
      <View style={[styles.bookingCard, !isToday && styles.upcomingCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.row}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isToday ? "#059669" : "#1e3a8a" },
              ]}
            >
              <Text style={styles.statusIndicatorText}>
                {isToday ? "TODAY" : "UPCOMING"}
              </Text>
            </View>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.booking_type === "Month" ? "#f59e0b" : "#64748b",
                },
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {item.booking_type === "Month" ? "MONTH" : "DAY"}
              </Text>
            </View>
          </View>
          <Text style={styles.amountText}>OMR {item.amount}</Text>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.rowBetween}>
            <Text style={styles.clientName}>{item.customer_name}</Text>
            <Text style={styles.dateLabel}>{item.booking_date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color="#64748b" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
          {item.booking_type === "Month" && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#f59e0b" />
              <Text
                style={[
                  styles.detailText,
                  { color: "#d97706", fontWeight: "bold" },
                ]}
              >
                Valid till: {item.end_date}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.infoGroup}>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={16} color="#1e3a8a" />
              <Text style={styles.timeText}>
                {item.start_time} - {item.end_time}
              </Text>
            </View>
            <View style={styles.netBadge}>
              <Text style={styles.netText}>{item.net_selection}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <View
              style={[
                styles.paymentStatus,
                { backgroundColor: isCollected ? "#dcfce7" : "#fee2e2" },
              ]}
            >
              <Text
                style={[
                  styles.paymentStatusText,
                  { color: isCollected ? "#166534" : "#991b1b" },
                ]}
              >
                {item.payment_status}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/EditBooking",
                  params: { id: item.id },
                })
              }
              style={styles.iconBtn}
            >
              <Ionicons name="pencil" size={18} color="#1e3a8a" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.iconBtn}
            >
              <Ionicons name="trash" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ Web Date Picker */}
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
        <View style={styles.headerLeftRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Bookings</Text>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "web") {
                  setShowWebPicker(true);
                } else {
                  setTempDate(selectedDate);
                  setShowPicker(true);
                }
              }}
              style={styles.dateBadge}
            >
              <Text style={styles.headerSub}>{formattedDate}</Text>
              <Ionicons name="caret-down" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addBookingBtn}
          onPress={() => router.push("/AddBooking")}
        >
          <Ionicons name="add" size={20} color="#1e3a8a" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ iOS Date Picker */}
      {Platform.OS === "ios" && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={{ color: "red" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmIOSDate}>
                  <Text style={{ color: "#1e3a8a", fontWeight: "bold" }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* ✅ Android Date Picker */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1e3a8a"
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBooking}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No bookings found for this date.
              </Text>
            }
            contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ✅ Web Picker Styles (plain object - not StyleSheet)
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "ios" ? 20 : 60,
    paddingBottom: 25,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerLeftRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  headerSub: { fontSize: 13, color: "#fff", fontWeight: "600" },
  addBookingBtn: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: "#1e3a8a", fontWeight: "bold", marginLeft: 3 },
  content: { flex: 1, paddingHorizontal: 15 },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: "#059669",
  },
  upcomingCard: { borderLeftColor: "#1e3a8a" },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  statusIndicatorText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  amountText: { fontWeight: "bold", color: "#059669", fontSize: 17 },
  customerInfo: { marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientName: { fontSize: 17, fontWeight: "bold", color: "#1e293b" },
  dateLabel: { fontSize: 12, color: "#64748b", fontWeight: "bold" },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  detailText: { color: "#64748b", fontSize: 13 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoGroup: { gap: 5 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  timeText: { color: "#1e293b", fontSize: 13, fontWeight: "700" },
  netBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  netText: { color: "#475569", fontWeight: "bold", fontSize: 10 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  paymentStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  paymentStatusText: { fontSize: 10, fontWeight: "bold" },
  iconBtn: { padding: 4 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#94a3b8" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
