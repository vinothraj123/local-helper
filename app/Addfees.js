import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function Addfees() {
  const { editId, mode } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [paidNow, setPaidNow] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [editId]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/fees-api/${editId}/`);
      if (res.data.status.code === 200) {
        setData(res.data.data);
      } else {
        showAlert("Error", "Student record not found");
      }
    } catch (e) {
      showAlert("Error", "Failed to load fee details");
    }
  };

  if (!data)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>
          Loading Details...
        </Text>
      </View>
    );

  const isNormal = mode === "NORMAL";

  const totalPayable = isNormal
    ? parseFloat(data.normal_balance) || 0
    : parseFloat(data.special_balance) || 0;

  const currentMonthFee = isNormal
    ? parseFloat(data.normal_fees) || 0
    : parseFloat(data.special_fees) || 0;

  const currentMonthPaid = isNormal
    ? parseFloat(data.normal_paid) || 0
    : parseFloat(data.special_paid) || 0;

  const monthBalance =
    currentMonthFee - currentMonthPaid > 0
      ? currentMonthFee - currentMonthPaid
      : 0;

  const prevArrears =
    totalPayable - monthBalance > 0 ? totalPayable - monthBalance : 0;

  const enteredAmount = parseFloat(paidNow) || 0;
  const finalRemaining = totalPayable - enteredAmount;

  const handleSave = async () => {
    if (enteredAmount <= 0) {
      showAlert("Error", "Please enter a valid amount to pay");
      return;
    }

    if (enteredAmount > totalPayable) {
      showAlert("Error", `Amount exceeds the total ${mode} payable balance!`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`/fees-api/${editId}/`, {
        paid_amount: enteredAmount,
        balance_amount: finalRemaining,
        fee_type: mode,
      });

      if (response.data.status.code === 200) {
        showAlert("Success", `${mode} Fees recorded successfully!`);
        router.back();
      } else {
        throw new Error(response.data.message);
      }
    } catch (e) {
      showAlert("Error", "Payment could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: `Collect ${mode} Fees` }} />

      <View style={styles.card}>
        <Text style={styles.studentName}>{data.studentName}</Text>

        <View
          style={[
            styles.typeBadge,
            { backgroundColor: isNormal ? "#dcfce7" : "#e0e7ff" },
          ]}
        >
          <Text
            style={{
              color: isNormal ? "#16a34a" : "#1e3a8a",
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            {mode} CLASS ACCOUNT
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Month Balance ({mode}):</Text>
            <Text style={styles.value}>{monthBalance.toFixed(3)} OMR</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Previous Arrears:</Text>
            <Text style={[styles.value, { color: "#ef4444" }]}>
              {prevArrears.toFixed(3)} OMR
            </Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <Text style={{ color: "#fff", opacity: 0.9, fontSize: 13 }}>
            Total {mode} Payable Now
          </Text>
          <Text style={styles.totalPrice}>{totalPayable.toFixed(3)} OMR</Text>
        </View>

        {/* ✅ Input — web fix */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter Amount to Collect:</Text>
          <TextInput
            style={styles.input}
            placeholder="0.000"
            keyboardType="decimal-pad"
            value={paidNow}
            autoFocus={Platform.OS !== "web"}
            onChangeText={(text) => {
              if (/^\d*\.?\d{0,3}$/.test(text)) {
                const entered = parseFloat(text) || 0;
                if (entered > totalPayable) {
                  showAlert(
                    "Invalid Amount",
                    "You cannot collect more than the total balance.",
                  );
                  return;
                }
                setPaidNow(text);
              }
            }}
          />
        </View>

        <View style={styles.remainingBox}>
          <Text style={styles.remainingText}>
            Remaining {mode} Balance:{" "}
            <Text style={{ fontWeight: "bold" }}>
              {finalRemaining.toFixed(3)} OMR
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? "Processing..." : `Confirm ${mode} Payment`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 25,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  studentName: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  typeBadge: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 25,
  },
  infoSection: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  value: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  totalBox: {
    backgroundColor: "#1e3a8a",
    padding: 22,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 25,
  },
  totalPrice: { color: "#fff", fontSize: 32, fontWeight: "800", marginTop: 5 },
  inputContainer: { marginBottom: 15 },
  inputLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  input: {
    borderBottomWidth: 3,
    borderBottomColor: "#10b981",
    fontSize: 34,
    textAlign: "center",
    padding: 10,
    color: "#1e293b",
    fontWeight: "bold",
    // ✅ Web — outline remove + cursor fix
    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none",
          outlineWidth: 0,
          borderWidth: 0,
          borderBottomWidth: 3,
          borderBottomColor: "#10b981",
          backgroundColor: "transparent",
          width: "100%",
        }
      : {}),
  },
  remainingBox: {
    marginTop: 10,
    alignItems: "center",
  },
  remainingText: { fontSize: 13, color: "#64748b" },
  saveBtn: {
    backgroundColor: "#1e3a8a",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 30,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});
