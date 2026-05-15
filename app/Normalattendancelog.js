import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "../axios";

const { width } = Dimensions.get("window");

const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function NormalAttendance() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ days: [], report: [] });
  const [students, setStudents] = useState([]);

  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStudent, setSelectedStudent] = useState({
    id: "all",
    name: "All Students",
  });

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const leftFlatListRef = useRef(null);
  const rightFlatListRef = useRef(null);
  const isSyncing = useRef(false);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear, selectedStudent]);

  const fetchInitialData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get("/student/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allStudents = res.data.data || res.data;
      const normalStudents = allStudents.filter(
        (s) => s.classType === 1 || s.classType === 3,
      );
      setStudents([
        { id: "all", studentName: "All Normal Students" },
        ...normalStudents,
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(
        `/monthlyattendance/?month=${selectedMonth}&year=${selectedYear}&student_id=${selectedStudent.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const reportData = res.data.report || [];
      const filteredReport = reportData
        .filter((item) => item.classType === 1 || item.classType === 3)
        .sort((a, b) => a.name.localeCompare(b.name));
      setData({ ...res.data, report: filteredReport });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const generatePDF = async () => {
    setLoading(true);
    try {
      const THEME_COLOR = "#1e3a8a";
      const monthName = months[selectedMonth - 1];

      // ── 1. Placeholder SVG ─────────────────────────────────────────────────
      const placeholderSVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><circle cx='15' cy='15' r='15' fill='%23e2e8f0'/><circle cx='15' cy='12' r='5' fill='%2394a3b8'/><ellipse cx='15' cy='24' rx='8' ry='5' fill='%2394a3b8'/></svg>`;

      // ── 2. toBase64 — Android only ─────────────────────────────────────────
      const toBase64 = async (url) => {
        try {
          if (!url) return null;
          const response = await fetch(url, { cache: "no-cache" });
          const blob = await response.blob();
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.log("Photo load error:", err);
          return null;
        }
      };

      // ── 3. toBase64iOS — iOS native only ──────────────────────────────────
      const toBase64iOS = async (url) => {
        try {
          if (!url) return null;
          const token = await AsyncStorage.getItem("token");
          const localUri =
            FileSystem.cacheDirectory + "tmp_photo_" + Date.now() + ".jpg";
          const downloadResult = await FileSystem.downloadAsync(url, localUri, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (downloadResult.status !== 200) return null;
          const base64 = await FileSystem.readAsStringAsync(
            downloadResult.uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            },
          );
          return `data:image/jpeg;base64,${base64}`;
        } catch {
          return null;
        }
      };

      // ── 4. Report data photos prepare ─────────────────────────────────────
      let reportWithPhotos;

      if (Platform.OS === "web") {
        // ✅ Web: direct URL — window.open() same session-ல் images load ஆகும்
        reportWithPhotos = data.report.map((item) => ({
          ...item,
          photoSrc: item.photo || placeholderSVG,
        }));
      } else if (Platform.OS === "ios") {
        // ✅ iOS: FileSystem base64 (auth header support)
        reportWithPhotos = await Promise.all(
          data.report.map(async (item) => ({
            ...item,
            photoSrc: (await toBase64iOS(item.photo)) || placeholderSVG,
          })),
        );
      } else {
        // ✅ Android: fetch base64
        reportWithPhotos = await Promise.all(
          data.report.map(async (item) => ({
            ...item,
            photoSrc: (await toBase64(item.photo)) || placeholderSVG,
          })),
        );
      }

      // ── 5. Table Rows Build ────────────────────────────────────────────────
      const isIOS = Platform.OS === "ios";

      const tableRows = reportWithPhotos
        .map((item) => {
          let dayCells = "";
          for (let d of data.days) {
            const n = item.attendance[`day_${d.day_num}_n`] || "-";
            const color =
              n === "P" ? "#10b981" : n === "A" ? "#ef4444" : "#94a3b8";
            dayCells += `<td style="color:${color};font-weight:bold;">${n}</td>`;
          }

          // iOS print: <img> block ஆகும் → div background-image use பண்றோம்
          // Web + Android: <img> tag works fine
          const photoCell = isIOS
            ? `<div style="
              width:25px;height:25px;border-radius:50%;
              background-image:url('${item.photoSrc}');
              background-size:cover;background-position:center;
              background-color:#e2e8f0;display:inline-block;
              -webkit-print-color-adjust:exact;print-color-adjust:exact;
            "></div>`
            : `<img
              src="${item.photoSrc}"
              style="width:25px;height:25px;border-radius:50%;object-fit:cover;"
              onerror="this.src='${placeholderSVG}'"
            />`;

          return `
        <tr>
          <td>${photoCell}</td>
          <td style="text-align:left;font-weight:bold;overflow:hidden;white-space:nowrap;">
            ${item.name}
          </td>
          ${dayCells}
          <td style="background:#f1f5f9;font-weight:bold;">${item.total_n_p}</td>
          <td style="background:#f1f5f9;font-weight:bold;">${item.total_n_a}</td>
        </tr>`;
        })
        .join("");

      // ── 6. HTML Content ────────────────────────────────────────────────────
      const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          @page { size: A3 landscape; margin: 5mm; }
          body { font-family: Helvetica, sans-serif; margin: 0; padding: 0; color: #1e293b; }
          .header { text-align: center; padding: 10px; border-bottom: 2px solid #e2e8f0; }
          .academy-name { color: ${THEME_COLOR}; font-size: 22px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 0.5px solid #94a3b8; text-align: center; font-size: 8px; padding: 3px; }
          th { background-color: ${THEME_COLOR}; color: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="academy-name">BSC Cricket Academy</div>
          <div style="font-size:12px;color:#64748b;">
            Normal Attendance Report: ${monthName} - ${selectedYear}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:35px;">PIC</th>
              <th style="width:120px;">Student Name</th>
              ${data.days.map((d) => `<th style="width:25px;">${d.display}</th>`).join("")}
              <th style="width:40px;">P</th>
              <th style="width:40px;">A</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>`;

      // ── 7. Platform-specific Export ────────────────────────────────────────
      if (Platform.OS === "web") {
        // ✅ Chrome + Safari இரண்டுக்கும்:
        // window.open() → புது tab → same https:// session
        // → browser images தானா load பண்ணும் ✅
        // → print dialog → "Save as PDF" ✅
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              printWindow.onafterprint = () => printWindow.close();
            }, 800);
          };
        }
      } else if (Platform.OS === "ios") {
        // ✅ iOS Native: Print sheet
        // Images: div background-image (Safari print safe) ✅
        await Print.printAsync({ html: htmlContent });
      } else {
        // ✅ Android: PDF file → share
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: `Normal_Attendance_${monthName}`,
        });
      }
    } catch (error) {
      console.error("PDF Error:", error);
      showAlert(
        "Error",
        "PDF உருவாக்க முடியவில்லை. ஒருமுறை பில்டர்களைச் செக் செய்யவும்.",
      );
    } finally {
      setLoading(false);
    }
  };
  // ✅ High-Performance Scroll Sync for Android/iOS
  const onScrollSync = (offsetY, targetRef) => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    targetRef.current?.scrollToOffset({
      offset: offsetY,
      animated: false,
    });

    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  };

  const renderLeftRow = useCallback(
    ({ item, index }) => (
      <View
        style={[
          styles.tableRow,
          index % 2 === 1 && { backgroundColor: "#f8fafc" },
        ]}
      >
        <View style={styles.photoCol}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.studentPhoto} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={16} color="#94a3b8" />
            </View>
          )}
        </View>
        <View style={styles.stickyCol}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      </View>
    ),
    [],
  );

  const renderRightRow = useCallback(
    ({ item, index }) => (
      <View
        style={[
          styles.tableRow,
          index % 2 === 1 && { backgroundColor: "#f8fafc" },
        ]}
      >
        {data.days.map((d, i) => (
          <View key={i} style={styles.dateColCell}>
            <Text
              style={[
                styles.pText,
                item.attendance[`day_${d.day_num}_n`] === "A" && styles.aText,
              ]}
            >
              {item.attendance[`day_${d.day_num}_n`] || "-"}
            </Text>
          </View>
        ))}
        <View style={styles.perfColCell}>
          <Text style={styles.sumText}>
            P: {item.total_n_p} | A: {item.total_n_a}
          </Text>
        </View>
      </View>
    ),
    [data.days],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerTopRow}>
          <Text style={styles.brandTitle}>Normal Attendance</Text>
          <TouchableOpacity
            onPress={generatePDF}
            style={styles.downloadIconBtn}
          >
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={styles.downloadText}>PDF</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
        >
          {months.map((m, i) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.chip,
                selectedMonth === i + 1 && styles.activeChip,
              ]}
              onPress={() => setSelectedMonth(i + 1)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedMonth === i + 1 && { color: "#1e3a8a" },
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowYearModal(true)}
          >
            <Text style={styles.filterBtnText}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, { flex: 1 }]}
            onPress={() => setShowStudentModal(true)}
          >
            <Text style={styles.filterBtnText} numberOfLines={1}>
              {selectedStudent.name}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* TABLE AREA */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <View style={styles.gridArea}>
          <View style={styles.tableContainer}>
            {/* FIXED LEFT (Names) */}
            <View style={styles.fixedLeft}>
              <View style={styles.tableHeader}>
                <View style={styles.photoCol}>
                  <Text style={styles.headerLabel}>PIC</Text>
                </View>
                <View style={styles.stickyCol}>
                  <Text style={styles.headerLabel}>Student</Text>
                </View>
              </View>
              <FlatList
                ref={leftFlatListRef}
                data={data.report}
                keyExtractor={(item, index) => `left_${index}`}
                renderItem={renderLeftRow}
                onScroll={(e) =>
                  onScrollSync(e.nativeEvent.contentOffset.y, rightFlatListRef)
                }
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={Platform.OS !== "web"}
                initialNumToRender={12}
              />
            </View>

            {/* SCROLLABLE RIGHT (Data) */}
            <ScrollView horizontal bounces={false}>
              <View>
                <View style={styles.tableHeader}>
                  {data.days.map((d, i) => (
                    <View key={i} style={styles.dateCol}>
                      <Text style={styles.headerLabel}>{d.display}</Text>
                      <Text style={styles.daySubLabel}>
                        {new Date(
                          selectedYear,
                          selectedMonth - 1,
                          d.day_num,
                        ).toLocaleDateString("en-US", { weekday: "short" })}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.perfCol}>
                    <Text style={styles.headerLabel}>Performance</Text>
                  </View>
                </View>
                <FlatList
                  ref={rightFlatListRef}
                  data={data.report}
                  keyExtractor={(item, index) => `right_${index}`}
                  renderItem={renderRightRow}
                  onScroll={(e) =>
                    onScrollSync(e.nativeEvent.contentOffset.y, leftFlatListRef)
                  }
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={Platform.OS !== "web"}
                  initialNumToRender={12}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* MODALS remain the same logic, styles updated for mobile */}
      <Modal visible={showYearModal} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year</Text>
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedYear(y);
                  setShowYearModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedYear === y && styles.activeModalItem,
                  ]}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showStudentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "70%" }]}>
            <Text style={styles.modalTitle}>Select Student</Text>
            <FlatList
              data={students}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedStudent({
                      id: item.id,
                      name: item.studentName || item.name,
                    });
                    setShowStudentModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {item.studentName || item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowStudentModal(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  topHeader: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  brandTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  downloadIconBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  downloadText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 11,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  activeChip: { backgroundColor: "#fff" },
  chipText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
    gap: 5,
  },
  filterBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  gridArea: { flex: 1, marginTop: 5 },
  tableContainer: { flexDirection: "row", flex: 1 },
  fixedLeft: {
    width: 160,
    backgroundColor: "#fff",
    zIndex: 10,
    elevation: 5,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  tableHeader: { flexDirection: "row", backgroundColor: "#0f172a", height: 50 },
  photoCol: { width: 45, alignItems: "center", justifyContent: "center" },
  studentPhoto: { width: 30, height: 30, borderRadius: 15 },
  avatarFallback: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  stickyCol: { width: 115, paddingLeft: 5, justifyContent: "center" },
  dateCol: {
    width: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 0.2,
    borderRightColor: "#334155",
  },
  perfCol: { width: 130, alignItems: "center", justifyContent: "center" },
  headerLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
  daySubLabel: { color: "#f59e0b", fontSize: 9 },
  tableRow: {
    flexDirection: "row",
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  nameText: { fontSize: 12, fontWeight: "600", color: "#1e293b" },
  dateColCell: {
    width: 55,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#f1f5f9",
  },
  pText: { fontSize: 14, fontWeight: "bold", color: "#10b981" },
  aText: { color: "#ef4444" },
  perfColCell: { width: 130, justifyContent: "center", alignItems: "center" },
  sumText: { fontSize: 11, fontWeight: "700", color: "#1e3a8a" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalItemText: { textAlign: "center", fontSize: 16, color: "#475569" },
  activeModalItem: { color: "#1e3a8a", fontWeight: "bold" },
  closeBtn: {
    marginTop: 10,
    backgroundColor: "#1e3a8a",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
