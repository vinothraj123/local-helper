import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
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

// ✅ Web-safe Alert
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ✅ Web-safe List — FlatList web-ல் height issue, ScrollView use பண்றோம்
const CrossPlatformList = ({
  data,
  renderItem,
  keyExtractor,
  onScroll,
  scrollRef,
  style,
}) => {
  if (Platform.OS === "web") {
    return (
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={style}
      >
        {data.map((item, index) => (
          <View key={keyExtractor ? keyExtractor(item, index) : index}>
            {renderItem({ item, index })}
          </View>
        ))}
      </ScrollView>
    );
  }
  return (
    <FlatList
      ref={scrollRef}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={style}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

export default function Splattendance() {
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

  // ✅ FIXED: Normal attendance log மாதிரி single isSyncing flag
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
      const specialStudents = allStudents.filter(
        (s) => s.classType === 2 || s.classType === 3,
      );
      setStudents([
        { id: "all", studentName: "All Special Students" },
        ...specialStudents,
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
        .filter((item) => item.classType === 2 || item.classType === 3)
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
      const THEME_COLOR = "#b91c1c";
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
            const s = item.attendance[`day_${d.day_num}_s`] || "-";
            dayCells += `<td class="${s === "P" ? "present" : "absent"}">${s}</td>`;
          }

          // iOS print: <img> block ஆகும் → div background-image use பண்றோம்
          // Web + Android: <img> tag works fine
          const photoCell = isIOS
            ? `<div style="
              width:30px;height:30px;border-radius:50%;
              background-image:url('${item.photoSrc}');
              background-size:cover;background-position:center;
              background-color:#e2e8f0;display:inline-block;
              -webkit-print-color-adjust:exact;print-color-adjust:exact;
            "></div>`
            : `<img
              src="${item.photoSrc}"
              class="img-cell"
              onerror="this.src='${placeholderSVG}'"
            />`;

          return `
        <tr>
          <td>${photoCell}</td>
          <td style="text-align:left;font-weight:bold;">${item.name}</td>
          ${dayCells}
          <td style="background:#f1f5f9;font-weight:bold;">${item.total_s_p}</td>
          <td style="background:#f1f5f9;font-weight:bold;">${item.total_s_a}</td>
        </tr>`;
        })
        .join("");

      // ── 6. HTML Content ────────────────────────────────────────────────────
      const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          @page { size: landscape; margin: 10mm; }
          body { font-family: Helvetica, sans-serif; color: #1e293b; }
          .header-box { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
          .academy-name { color: ${THEME_COLOR}; font-size: 24px; font-weight: bold; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #94a3b8; text-align: center; font-size: 10px; padding: 5px; }
          th { background-color: ${THEME_COLOR}; color: white; }
          .img-cell { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
          .present { color: #10b981; font-weight: bold; }
          .absent { color: #ef4444; font-weight: bold; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="academy-name">BSC Cricket Academy</div>
          <div style="font-size:14px;color:#64748b;">
            Special (Spl) Attendance Report: ${monthName} - ${selectedYear}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:40px;">PIC</th>
              <th>Student Name</th>
              ${data.days.map((d) => `<th>${d.display}</th>`).join("")}
              <th>Total P</th>
              <th>Total A</th>
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
        });
      }
    } catch (error) {
      console.error("PDF Error:", error);
      showAlert("Error", "PDF Failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Normal attendance log மாதிரி onScrollSync — loop prevent பண்ண isSyncing flag
  const onScrollSync = (offsetY, targetRef) => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    if (Platform.OS === "web") {
      targetRef.current?.scrollTo?.({ y: offsetY, animated: false });
    } else {
      targetRef.current?.scrollToOffset?.({
        offset: offsetY,
        animated: false,
      });
    }

    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  };

  // ✅ Left row renderer
  const renderLeftRow = ({ item, index }) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 1 && { backgroundColor: "#fff5f5" },
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
  );

  // ✅ Right row renderer
  const renderRightRow = ({ item, index }) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 1 && { backgroundColor: "#fff5f5" },
      ]}
    >
      {data.days.map((d, i) => (
        <View key={i} style={styles.dateColCell}>
          <Text
            style={[
              styles.pText,
              item.attendance[`day_${d.day_num}_s`] === "A" && styles.aText,
            ]}
          >
            {item.attendance[`day_${d.day_num}_s`] || "-"}
          </Text>
        </View>
      ))}
      <View style={styles.perfColCell}>
        <Text style={[styles.sumText, { color: "#b91c1c" }]}>
          Present: {item.total_s_p} | Absent: {item.total_s_a}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ===== TOP HEADER ===== */}
      <View style={[styles.topHeader, { backgroundColor: "#b91c1c" }]}>
        <View style={styles.headerTopRow}>
          <Text style={styles.brandTitle}>Spl Attendance</Text>
          <TouchableOpacity
            onPress={generatePDF}
            style={styles.downloadIconBtn}
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.downloadText}>DOWNLOAD SPL PDF</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                  selectedMonth === i + 1 && { color: "#b91c1c" },
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

      {/* ===== TABLE AREA ===== */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#b91c1c" />
        </View>
      ) : (
        <View style={styles.gridArea}>
          <View style={styles.tableContainer}>
            {/* ✅ FIXED LEFT */}
            <View style={styles.fixedLeft}>
              <View
                style={[styles.tableHeader, { backgroundColor: "#450a0a" }]}
              >
                <View style={styles.photoCol}>
                  <Text style={styles.headerLabel}>PIC</Text>
                </View>
                <View style={styles.stickyCol}>
                  <Text style={styles.headerLabel}>Student</Text>
                </View>
              </View>

              <CrossPlatformList
                scrollRef={leftFlatListRef}
                data={data.report}
                keyExtractor={(item, index) => `left_${index}`}
                renderItem={renderLeftRow}
                onScroll={(e) =>
                  onScrollSync(e.nativeEvent.contentOffset.y, rightFlatListRef)
                }
                style={{ flex: 1 }}
              />
            </View>

            {/* ✅ SCROLLABLE RIGHT */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              bounces={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={[styles.tableHeader, { backgroundColor: "#450a0a" }]}
                >
                  {data.days.map((d, i) => {
                    const dayName = new Date(
                      selectedYear,
                      selectedMonth - 1,
                      d.day_num,
                    ).toLocaleDateString("en-US", { weekday: "short" });
                    return (
                      <View key={i} style={styles.dateCol}>
                        <Text style={styles.headerLabel}>{d.display}</Text>
                        <Text style={styles.daySubLabel}>{dayName}</Text>
                      </View>
                    );
                  })}
                  <View style={styles.perfCol}>
                    <Text style={styles.headerLabel}>Spl Performance</Text>
                  </View>
                </View>

                <CrossPlatformList
                  scrollRef={rightFlatListRef}
                  data={data.report}
                  keyExtractor={(item, index) => `right_${index}`}
                  renderItem={renderRightRow}
                  onScroll={(e) =>
                    onScrollSync(e.nativeEvent.contentOffset.y, leftFlatListRef)
                  }
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* ===== YEAR MODAL ===== */}
      <Modal visible={showYearModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
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
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: "#b91c1c" }]}
              onPress={() => setShowYearModal(false)}
            >
              <Text style={{ color: "#fff" }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== STUDENT MODAL ===== */}
      <Modal visible={showStudentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "70%" }]}>
            <Text style={styles.modalTitle}>Select Student</Text>
            <ScrollView>
              {students.map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
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
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: "#b91c1c" }]}
              onPress={() => setShowStudentModal(false)}
            >
              <Text style={{ color: "#fff" }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  brandTitle: { fontSize: 20, fontWeight: "900", color: "#fff" },
  downloadIconBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  downloadText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeChip: { backgroundColor: "#fff" },
  chipText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  filterRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
    gap: 5,
  },
  filterBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  gridArea: { marginTop: 10, flex: 1 },
  tableContainer: { flexDirection: "row", flex: 1 },
  fixedLeft: {
    width: 170,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  tableHeader: { flexDirection: "row", paddingVertical: 10 },
  photoCol: { width: 50, alignItems: "center", justifyContent: "center" },
  studentPhoto: { width: 30, height: 30, borderRadius: 15 },
  avatarFallback: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  stickyCol: { width: 120, paddingLeft: 10, justifyContent: "center" },
  dateCol: { width: 60, alignItems: "center", justifyContent: "center" },
  perfCol: { width: 160, alignItems: "center", justifyContent: "center" },
  headerLabel: {
    color: "#fca5a5",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  daySubLabel: { color: "#fff", fontSize: 8 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#fee2e2",
    height: 50,
  },
  nameText: { fontSize: 12, fontWeight: "700", color: "#1e293b" },
  dateColCell: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#fee2e2",
  },
  pText: { fontSize: 13, fontWeight: "bold", color: "#10b981" },
  aText: { color: "#ef4444" },
  perfColCell: { width: 160, justifyContent: "center", alignItems: "center" },
  sumText: { fontSize: 10, fontWeight: "bold" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 25,
  },
  modalContent: { backgroundColor: "#fff", borderRadius: 25, padding: 25 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalItemText: { textAlign: "center", fontSize: 16, color: "#64748b" },
  activeModalItem: { color: "#b91c1c", fontWeight: "bold" },
  closeBtn: {
    marginTop: 15,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
});
