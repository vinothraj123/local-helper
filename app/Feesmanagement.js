import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
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

export default function Feesmanagement() {
  const router = useRouter();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("NORMAL");

  useFocusEffect(
    useCallback(() => {
      fetchFees();
    }, [activeTab]),
  );

  const fetchFees = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/fees-api/");
      if (response.data.status.code === 200) {
        setFees(response.data.data);
      }
    } catch (error) {
      showAlert("Error", "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ New Logic for A-Z Grouping & First Letter Search
  const renderGroupedFees = () => {
    // 1. Filter by Tab and Search Query (First Letter)
    const filtered = fees.filter((item) => {
      const cType = item.classType;
      let matchesTab =
        activeTab === "SPECIAL"
          ? cType === 2 || cType === 3
          : cType === 1 || cType === 3;

      const matchesSearch = item.studentName
        .toLowerCase()
        .startsWith(searchQuery.toLowerCase()); // 'startsWith' for instant jump

      return matchesTab && matchesSearch;
    });

    // 2. Sort and Group by First Letter
    const groups = {};
    filtered.forEach((item) => {
      const firstLetter = item.studentName.charAt(0).toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(item);
    });

    const sortedLetters = Object.keys(groups).sort();

    if (sortedLetters.length === 0) {
      return (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Ionicons name="folder-open-outline" size={50} color="#cbd5e1" />
          <Text
            style={{ textAlign: "center", marginTop: 10, color: "#64748b" }}
          >
            No records found.
          </Text>
        </View>
      );
    }

    return sortedLetters.map((letter) => (
      <View key={letter}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionText}>{letter}</Text>
          <View style={styles.sectionLine} />
        </View>
        {groups[letter]
          .sort((a, b) => a.studentName.localeCompare(b.studentName))
          .map((item) => (
            <View key={item.id.toString()}>{renderFeeItem({ item })}</View>
          ))}
      </View>
    ));
  };

  const renderFeeItem = ({ item }) => {
    const currentFee =
      activeTab === "NORMAL"
        ? parseFloat(item.normal_fees) || 0
        : parseFloat(item.special_fees) || 0;
    const currentPaid =
      activeTab === "NORMAL"
        ? parseFloat(item.normal_paid) || 0
        : parseFloat(item.special_paid) || 0;
    const currentGrandTotal =
      activeTab === "NORMAL"
        ? parseFloat(item.normal_balance) || 0
        : parseFloat(item.special_balance) || 0;

    const monthBal =
      currentFee - currentPaid > 0 ? currentFee - currentPaid : 0;
    const prevArrears =
      currentGrandTotal - monthBal > 0 ? currentGrandTotal - monthBal : 0;

    return (
      <View style={styles.feeCard}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.studentName}>{item.studentName}</Text>
              <TouchableOpacity
                style={styles.historyIconBtn}
                onPress={() =>
                  router.push({
                    pathname: "/Viewhistory",
                    params: { studentId: item.id, name: item.studentName },
                  })
                }
              >
                <Ionicons name="time-outline" size={18} color="#1e3a8a" />
              </TouchableOpacity>
            </View>
            <View style={styles.typeRow}>
              <View style={styles.avatar}>
                {item.photo ? (
                  <Image
                    source={{ uri: item.photo }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {item.studentName?.charAt(0)}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.typeTag,
                  activeTab === "SPECIAL" && {
                    backgroundColor: "#e0e7ff",
                    color: "#1e3a8a",
                  },
                ]}
              >
                {activeTab === "NORMAL"
                  ? "Normal Class Account"
                  : "Special Class Account"}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: currentGrandTotal <= 0 ? "#dcfce7" : "#fee2e2",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: currentGrandTotal <= 0 ? "#16a34a" : "#ef4444" },
              ]}
            >
              {currentGrandTotal <= 0 ? "PAID" : "PENDING"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{activeTab} FEE</Text>
            <Text style={styles.detailValue}>{currentFee.toFixed(3)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>PAID</Text>
            <Text style={[styles.detailValue, { color: "#10b981" }]}>
              {currentPaid.toFixed(3)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>MONTH BAL</Text>
            <Text
              style={[
                styles.detailValue,
                { color: monthBal > 0 ? "#ef4444" : "#1e293b" },
              ]}
            >
              {monthBal.toFixed(3)}
            </Text>
          </View>
        </View>

        <View style={styles.arrearsBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.arrearsLabel}>Old Arrears:</Text>
            <Text style={styles.arrearsValue}>
              {prevArrears.toFixed(3)} OMR
            </Text>
          </View>
          <View style={styles.dividerSmall} />
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total Payable:</Text>
            <Text style={styles.totalValue}>
              {currentGrandTotal.toFixed(3)} OMR
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            router.push({
              pathname: "/Addfees",
              params: { editId: item.id, mode: activeTab },
            })
          }
        >
          <Ionicons name="wallet-outline" size={20} color="#fff" />
          <Text style={styles.editBtnText}>Collect {activeTab} Fees</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>
            {activeTab === "NORMAL" ? "Normal Fees" : "Special Fees"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "NORMAL" && styles.activeTab]}
            onPress={() => setActiveTab("NORMAL")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "NORMAL" && styles.activeTabText,
              ]}
            >
              Normal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "SPECIAL" && styles.activeTab]}
            onPress={() => setActiveTab("SPECIAL")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "SPECIAL" && styles.activeTabText,
              ]}
            >
              Special
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#94a3b8"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Type first letter (e.g. V)..."
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
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1e3a8a"
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderGroupedFees()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  topHeader: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  backBtn: { padding: 8, backgroundColor: "#f1f5f9", borderRadius: 12 },
  mainTitle: { fontSize: 20, fontWeight: "bold", color: "#1e3a8a" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#1e3a8a" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  activeTabText: { color: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },

  // ✅ New A-Z Section Styles
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 5,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#cbd5e1" },
  sectionText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "#1e3a8a",
  },

  feeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  studentName: { fontSize: 17, fontWeight: "bold", color: "#1e293b" },
  typeRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { fontSize: 14, fontWeight: "bold", color: "#1e3a8a" },
  typeTag: {
    fontSize: 10,
    fontWeight: "700",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "900" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
  dividerSmall: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
    borderStyle: "dashed",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailItem: { alignItems: "center", flex: 1 },
  detailLabel: { fontSize: 9, color: "#94a3b8", fontWeight: "900" },
  detailValue: { fontSize: 15, fontWeight: "800", color: "#334155" },
  arrearsBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1e3a8a",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrearsLabel: { fontSize: 12, color: "#64748b" },
  arrearsValue: { fontSize: 13, fontWeight: "bold", color: "#ef4444" },
  totalLabel: { fontSize: 14, fontWeight: "bold", color: "#1e3a8a" },
  totalValue: { fontSize: 17, fontWeight: "900", color: "#1e3a8a" },
  editBtn: {
    backgroundColor: "#1e3a8a",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  historyIconBtn: {
    marginLeft: 8,
    padding: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
});
