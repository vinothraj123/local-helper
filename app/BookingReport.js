import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
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
      <View style={webStyles.overlay}>
        <View style={webStyles.box}>
          <Text style={webStyles.title}>📅 Select Date</Text>
          <input
            type="date"
            defaultValue={formatted}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m, d] = e.target.value.split("-");
              onSelect(new Date(y, m - 1, d));
            }}
            style={webStyles.input}
          />
          <View style={webStyles.btnRow}>
            <TouchableOpacity style={webStyles.cancelBtn} onPress={onClose}>
              <Text style={webStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={webStyles.doneBtn} onPress={onClose}>
              <Text style={webStyles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function BookingReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [overall, setOverall] = useState({});

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  // iOS picker states
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(new Date());
  const [tempToDate, setTempToDate] = useState(new Date());

  // Web picker states
  const [showWebFrom, setShowWebFrom] = useState(false);
  const [showWebTo, setShowWebTo] = useState(false);

  const formatDate = (date) => date.toISOString().split("T")[0];
  const formatDisplay = (date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/booking-report/?from_date=${formatDate(fromDate)}&to_date=${formatDate(toDate)}`,
      );
      setReportData(res.data.detailed_report || []);
      setOverall(res.data.overall || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const openFromPicker = () => {
    if (Platform.OS === "web") {
      setShowWebFrom(true);
    } else {
      setTempFromDate(fromDate);
      setShowFromPicker(true);
    }
  };

  const openToPicker = () => {
    if (Platform.OS === "web") {
      setShowWebTo(true);
    } else {
      setTempToDate(toDate);
      setShowToPicker(true);
    }
  };

  const onChangeFrom = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowFromPicker(false);
      if (selectedDate) setFromDate(selectedDate);
    } else {
      if (selectedDate) setTempFromDate(selectedDate);
    }
  };

  const onChangeTo = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowToPicker(false);
      if (selectedDate) setToDate(selectedDate);
    } else {
      if (selectedDate) setTempToDate(selectedDate);
    }
  };

  const collectednTotal = reportData.reduce(
    (sum, item) => sum + (parseFloat(item.total_revenue) || 0),
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ Web From Date Picker */}
      <WebDatePickerModal
        visible={showWebFrom}
        value={fromDate}
        onClose={() => setShowWebFrom(false)}
        onSelect={(date) => {
          setFromDate(date);
          setShowWebFrom(false);
        }}
      />

      {/* ✅ Web To Date Picker */}
      <WebDatePickerModal
        visible={showWebTo}
        value={toDate}
        onClose={() => setShowWebTo(false)}
        onSelect={(date) => {
          setToDate(date);
          setShowWebTo(false);
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Business Analytics</Text>
          <Text style={styles.headerSub}>Booking Revenue Report</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="bar-chart-outline" size={22} color="#fff" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Date Filter Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="filter-outline" size={16} color="#1e3a8a" />
            <Text style={styles.cardTitle}>Date Range Filter</Text>
          </View>

          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>FROM</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={openFromPicker}>
                <Ionicons name="calendar-outline" size={16} color="#1e3a8a" />
                <Text style={styles.dateBtnText}>
                  {formatDisplay(fromDate)}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.arrowBox}>
              <Text style={styles.arrowText}>→</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>TO</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={openToPicker}>
                <Ionicons name="calendar-outline" size={16} color="#f59e0b" />
                <Text style={styles.dateBtnText}>{formatDisplay(toDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.generateBtn} onPress={fetchReport}>
            <Ionicons name="sync-outline" size={18} color="#fff" />
            <Text style={styles.generateBtnText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ iOS From Date Picker */}
        {Platform.OS === "ios" && (
          <Modal visible={showFromPicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowFromPicker(false)}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>From Date</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setFromDate(tempFromDate);
                      setShowFromPicker(false);
                    }}
                  >
                    <Text style={styles.modalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempFromDate}
                  mode="date"
                  display="spinner"
                  onChange={onChangeFrom}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* ✅ iOS To Date Picker */}
        {Platform.OS === "ios" && (
          <Modal visible={showToPicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowToPicker(false)}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>To Date</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setToDate(tempToDate);
                      setShowToPicker(false);
                    }}
                  >
                    <Text style={styles.modalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempToDate}
                  mode="date"
                  display="spinner"
                  onChange={onChangeTo}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* ✅ Android From Date Picker */}
        {Platform.OS === "android" && showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={onChangeFrom}
            maximumDate={new Date()}
          />
        )}

        {/* ✅ Android To Date Picker */}
        {Platform.OS === "android" && showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            onChange={onChangeTo}
            maximumDate={new Date()}
          />
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.statCard, { borderTopColor: "#3b82f6" }]}>
            <View style={[styles.statIconBox, { backgroundColor: "#dbeafe" }]}>
              <Ionicons name="bookmarks-outline" size={20} color="#1e3a8a" />
            </View>
            <Text style={styles.statLabel}>Total Slots</Text>
            <Text style={styles.statValue}>
              {overall.grand_total_bookings || 0}
            </Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: "#10b981" }]}>
            <View style={[styles.statIconBox, { backgroundColor: "#dcfce7" }]}>
              <Ionicons name="cash-outline" size={20} color="#059669" />
            </View>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={[styles.statValue, { color: "#059669" }]}>
              OMR {overall.grand_total_revenue || 0}
            </Text>
          </View>
        </View>

        {/* Report List */}
        {loading ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text
              style={{ marginTop: 12, color: "#64748b", fontWeight: "600" }}
            >
              Generating report...
            </Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            <View style={styles.listHeaderRow}>
              <Ionicons name="grid-outline" size={16} color="#1e3a8a" />
              <Text style={styles.listTitle}>Net-wise Breakdown</Text>
            </View>

            {reportData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={56}
                  color="#cbd5e1"
                />
                <Text style={styles.emptyTitle}>No Data Found</Text>
                <Text style={styles.emptyText}>
                  Try selecting a different date range.
                </Text>
              </View>
            ) : (
              reportData.map((item, index) => (
                <View key={item.net_selection} style={styles.reportCard}>
                  <View style={styles.reportLeft}>
                    <View style={styles.reportIndexBox}>
                      <Text style={styles.reportIndex}>{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.netName}>{item.net_selection}</Text>
                      <View style={styles.bookingBadge}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color="#64748b"
                        />
                        <Text style={styles.bookingCount}>
                          {item.total_bookings} Bookings
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.reportRight}>
                    <Text style={styles.revenueText}>
                      OMR {item.total_revenue}
                    </Text>
                    <Text style={styles.revenueLabel}>Revenue</Text>
                  </View>
                </View>
              ))
            )}

            {reportData.length > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>
                  OMR{" "}
                  {overall.grand_total_revenue || collectednTotal.toFixed(3)}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const webStyles = {
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
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "ios" ? 20 : 55,
    paddingBottom: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
  },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 11, color: "#bfdbfe", marginTop: 2 },
  headerIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#1e3a8a" },
  dateRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 16 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0f7ff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  dateBtnText: { fontSize: 13, color: "#1e3a8a", fontWeight: "700", flex: 1 },
  arrowBox: { paddingHorizontal: 8, paddingBottom: 4 },
  arrowText: { fontSize: 18, color: "#94a3b8" },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1e3a8a",
    padding: 15,
    borderRadius: 14,
  },
  generateBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderTopWidth: 4,
    elevation: 2,
    alignItems: "center",
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e3a8a",
    marginTop: 4,
  },
  listSection: { paddingHorizontal: 16 },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  listTitle: { fontSize: 15, fontWeight: "800", color: "#1e293b" },
  reportCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  reportLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  reportIndexBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  reportIndex: { fontWeight: "800", color: "#f59e0b", fontSize: 14 },
  netName: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  bookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  bookingCount: { fontSize: 12, color: "#64748b" },
  reportRight: { alignItems: "flex-end" },
  revenueText: { fontSize: 16, fontWeight: "800", color: "#059669" },
  revenueLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  totalRow: {
    backgroundColor: "#1e3a8a",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#bfdbfe" },
  totalValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
  emptyContainer: { alignItems: "center", marginTop: 40, padding: 20 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 12,
  },
  emptyText: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalCancel: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
  modalTitle: { fontSize: 15, fontWeight: "800", color: "#1e3a8a" },
  modalDone: { color: "#1e3a8a", fontWeight: "800", fontSize: 15 },
});
