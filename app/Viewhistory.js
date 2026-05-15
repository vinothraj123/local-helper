import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import axios from "../axios";

export default function Viewhistory() {
  const { studentId, name } = useLocalSearchParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("NORMAL");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`/fees-history/${studentId}/`);
      setHistory(res.data.data);
    } catch (e) {
      Alert.alert("Error", "வரலாற்றை ஏற்ற முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => item.fee_type === activeTab);

  const generateReceiptPDF = async (item) => {
    const formattedAmount = parseFloat(item.amount_paid).toFixed(3);
    const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 10px; margin-bottom: 20px; }
          .title { color: #065f46; font-size: 26px; font-weight: bold; margin: 0; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .info-table td { padding: 8px; font-size: 14px; border: 1px solid #e2e8f0; }
          .label { background-color: #f8fafc; font-weight: bold; width: 30%; color: #64748b; }
          .details-table { width: 100%; margin-top: 20px; border-collapse: collapse; }
          .details-table th { padding: 12px; background-color: #065f46; color: white; text-align: left; }
          .details-table td { padding: 12px; border: 1px solid #e2e8f0; }
          .footer { margin-top: 50px; text-align: right; }
          .sig-line { border-top: 1px solid #000; width: 150px; margin-top: 40px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">BSC CRICKET ACADEMY</h1>
          <p>Official Payment Receipt</p>
        </div>
        <table class="info-table">
          <tr><td class="label">Receipt No</td><td>#REC-${item.id}</td></tr>
          <tr><td class="label">Student Name</td><td>${name}</td></tr>
          <tr><td class="label">Date</td><td>${item.payment_date || item.month_name}</td></tr>
        </table>
        <table class="details-table">
          <thead><tr><th>Description</th><th>Status</th><th style="text-align:right;">Amount</th></tr></thead>
          <tbody>
            <tr>
              <td>${item.fee_type} Fees</td>
              <td>Paid</td>
              <td style="text-align:right;">${formattedAmount} OMR</td>
            </tr>
          </tbody>
        </table>
        <div class="footer"><div class="sig-line"></div><p>Authorized Signature</p></div>
      </body>
    </html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Error", "PDF உருவாக்க முடியவில்லை.");
    }
  };

  const renderHistoryItem = ({ item }) => (
    <View
      style={[styles.card, item.status === "NOT_PAID" && styles.unpaidCard]}
    >
      {/* Table Header */}
      <View style={styles.tableRowHeader}>
        <Text style={styles.headerText}>
          Receipt: {item.id ? `#${item.id}` : "N/A"}
        </Text>
        <View
          style={[
            styles.badge,
            item.status === "NOT_PAID" ? styles.unpaidBadge : styles.paidBadge,
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      {/* Table Body (PDF-ல் இருப்பது போல) */}
      <View style={styles.tableBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Month:</Text>
          <Text style={styles.value}>{item.month_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Paid Date:</Text>
          <Text style={styles.value}>{item.payment_date || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fee Type:</Text>
          <Text style={styles.value}>{item.fee_type}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Amount:</Text>
          <Text
            style={[
              styles.totalValue,
              item.status === "NOT_PAID" && { color: "#ef4444" },
            ]}
          >
            {item.status === "PAID"
              ? `${parseFloat(item.amount_paid).toFixed(3)} OMR`
              : "0.000 OMR"}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      {item.status === "PAID" && (
        <TouchableOpacity
          onPress={() => generateReceiptPDF(item)}
          style={styles.downloadBtn}
        >
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.downloadBtnText}>Download Receipt</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Payment Records" }} />
      <View style={styles.tabContainer}>
        {["NORMAL", "SPECIAL"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#065f46"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredHistory}
          // toString() எரரைத் தவிர்க்க index சேர்க்கப்பட்டது
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `unpaid-${index}`
          }
          renderItem={renderHistoryItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No records found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    margin: 15,
    borderRadius: 12,
    padding: 5,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#fff", elevation: 2 },
  tabText: { fontWeight: "bold", color: "#64748b" },
  activeTabText: { color: "#065f46" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  unpaidCard: { borderColor: "#fca5a5", backgroundColor: "#fffaf9" },
  tableRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerText: { fontWeight: "bold", color: "#1e293b" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  paidBadge: { backgroundColor: "#dcfce7" },
  unpaidBadge: { backgroundColor: "#fee2e2" },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#166534" },
  tableBody: { padding: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: "#64748b", fontSize: 14 },
  value: { color: "#1e293b", fontWeight: "600", fontSize: 14 },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  totalLabel: { fontWeight: "bold", color: "#1e293b" },
  totalValue: { fontWeight: "bold", color: "#065f46", fontSize: 16 },
  downloadBtn: {
    flexDirection: "row",
    backgroundColor: "#065f46",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#94a3b8" },
});
