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
  SafeAreaView,
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

// ✅ Optimized List for Both Platforms
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
      scrollEventThrottle={16} // ✅ Smooth scroll sync for Mobile
      showsVerticalScrollIndicator={false}
      style={style}
      initialNumToRender={15}
      removeClippedSubviews={Platform.OS === "android"}
    />
  );
};

export default function Monthlyattendance() {
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
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

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
      setStudents([
        { id: "all", studentName: "All Students" },
        ...(res.data.data || res.data),
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
      const sortedReport = (res.data.report || []).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setData({ ...res.data, report: sortedReport });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // const generatePDF = async () => {
  //   const THEME_COLOR = "#1e3a8a";
  //   const monthName = months[selectedMonth - 1];
  //   const htmlContent = `
  //     <html>
  //       <head>
  //         <style>
  //           @page { size: landscape; margin: 10mm; }
  //           body { font-family: 'Helvetica'; color: #1e293b; margin: 0; padding: 0; }
  //           .academy-name { text-align: center; color: ${THEME_COLOR}; font-size: 26px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
  //           .report-title { text-align: center; font-size: 14px; color: #64748b; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
  //           table { width: 100%; border-collapse: collapse; }
  //           th, td { border: 1px solid #94a3b8; text-align: center; font-size: 9px; padding: 4px; }
  //           th { background-color: ${THEME_COLOR}; color: white; }
  //           .img-cell { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="academy-name">BSC Cricket Academy</div>
  //         <div class="report-title">Monthly Attendance: ${monthName} - ${selectedYear}</div>
  //         <table>
  //           <thead>
  //             <tr>
  //               <th>PIC</th><th>Student Name</th>
  //               ${data.days.map((d) => `<th>${d.display}</th>`).join("")}
  //               <th colspan="4">Total Performance</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             ${data.report
  //               .map(
  //                 (item) => `
  //               <tr>
  //                 <td><img src="${item.photo || "https://via.placeholder.com/30"}" class="img-cell" /></td>
  //                 <td style="text-align:left;">${item.name}</td>
  //                 ${data.days.map((d) => `<td>${item.attendance[`day_${d.day_num}_n`] || "-"}</td>`).join("")}
  //                 <td>P:${item.total_n_p}</td><td>A:${item.total_n_a}</td>
  //                 <td>SP:${item.total_s_p}</td><td>SA:${item.total_s_a}</td>
  //               </tr>
  //             `,
  //               )
  //               .join("")}
  //           </tbody>
  //         </table>
  //       </body>
  //     </html>
  //   `;
  //   try {
  //     const { uri } = await Print.printToFileAsync({ html: htmlContent });
  //     await Sharing.shareAsync(uri, {
  //       UTI: ".pdf",
  //       mimeType: "application/pdf",
  //     });
  //   } catch (error) {
  //     showAlert("Error", "Failed to generate PDF");
  //   }
  // };

  const generatePDF = async () => {
    setLoading(true);
    try {
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

      // ── 4. Report data-ஐ photos-உடன் prepare பண்ணு ────────────────────────
      // ✅ Web: direct URL use பண்றோம்
      //    window.open() → same https:// session → browser images load பண்ணும்
      // ✅ iOS: base64 via FileSystem (auth header support)
      // ✅ Android: base64 via fetch
      let reportWithPhotos;

      if (Platform.OS === "web") {
        reportWithPhotos = data.report.map((item) => ({
          ...item,
          photoSrc: item.photo || placeholderSVG,
        }));
      } else if (Platform.OS === "ios") {
        reportWithPhotos = await Promise.all(
          data.report.map(async (item) => ({
            ...item,
            photoSrc: (await toBase64iOS(item.photo)) || placeholderSVG,
          })),
        );
      } else {
        reportWithPhotos = await Promise.all(
          data.report.map(async (item) => ({
            ...item,
            photoSrc: (await toBase64(item.photo)) || placeholderSVG,
          })),
        );
      }

      // ── 5. Table rows build ────────────────────────────────────────────────
      const isIOS = Platform.OS === "ios";

      const tableRows = reportWithPhotos
        .map((item) => {
          let dayCells = "";
          for (let d of data.days) {
            const n = item.attendance[`day_${d.day_num}_n`] || "-";
            const s = item.attendance[`day_${d.day_num}_s`] || "-";
            dayCells += `
          <td>
            ${n}<br/>
            <span style="color:#f59e0b;font-size:7px;">${s}</span>
          </td>`;
          }

          // iOS print: <img> block ஆகும் → div background-image use பண்றோம்
          // Web + Android: <img> tag works fine
          const photoCell = isIOS
            ? `<div style="
              width:25px;height:25px;border-radius:12px;
              background-image:url('${item.photoSrc}');
              background-size:cover;background-position:center;
              background-color:#e2e8f0;display:inline-block;
              -webkit-print-color-adjust:exact;print-color-adjust:exact;
            "></div>`
            : `<img
              src="${item.photoSrc}"
              style="width:25px;height:25px;border-radius:12px;object-fit:cover;"
              onerror="this.src='${placeholderSVG}'"
            />`;

          return `
        <tr>
          <td style="width:30px;">${photoCell}</td>
          <td style="text-align:left;font-weight:bold;width:100px;">${item.name}</td>
          ${dayCells}
          <td style="background:#f1f5f9;font-weight:bold;">${item.total_n_p}/${item.total_n_a}</td>
          <td style="background:#fff7ed;font-weight:bold;">${item.total_s_p}/${item.total_s_a}</td>
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
          body { font-family: Helvetica, sans-serif; font-size: 8px; margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 0.5px solid #cbd5e1; text-align: center; padding: 2px; overflow: hidden; }
          th { background-color: #1e3a8a; color: white; height: 30px; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center;color:#1e3a8a;margin:10px 0;">
          BSC Cricket Academy — ${monthName} ${selectedYear}
        </h2>
        <table>
          <thead>
            <tr>
              <th style="width:35px;">PIC</th>
              <th style="width:110px;">Name</th>
              ${data.days.map((d) => `<th style="width:25px;">${d.display}</th>`).join("")}
              <th style="width:45px;">Norm</th>
              <th style="width:45px;">Spec</th>
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
      showAlert(
        "Notice",
        "டேட்டா மிக அதிகமாக உள்ளது. ஒருவேளை எர்ரர் வந்தால் மாணவர்களின் எண்ணிக்கையை குறைத்து முயற்சிக்கவும்.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Smooth Sync Scroll for Mobile (Native Support)
  const handleLeftScroll = (event) => {
    if (isSyncingLeft.current) return;
    const offsetY = event.nativeEvent.contentOffset.y;
    isSyncingRight.current = true;
    if (Platform.OS === "web") {
      rightFlatListRef.current?.scrollTo?.({ y: offsetY, animated: false });
    } else {
      rightFlatListRef.current?.scrollToOffset?.({
        offset: offsetY,
        animated: false,
      });
    }
    setTimeout(() => {
      isSyncingRight.current = false;
    }, 16);
  };

  const handleRightScroll = (event) => {
    if (isSyncingRight.current) return;
    const offsetY = event.nativeEvent.contentOffset.y;
    isSyncingLeft.current = true;
    if (Platform.OS === "web") {
      leftFlatListRef.current?.scrollTo?.({ y: offsetY, animated: false });
    } else {
      leftFlatListRef.current?.scrollToOffset?.({
        offset: offsetY,
        animated: false,
      });
    }
    setTimeout(() => {
      isSyncingLeft.current = false;
    }, 16);
  };

  const renderLeftRow = ({ item, index }) => (
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
  );

  const renderRightRow = ({ item, index }) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 1 && { backgroundColor: "#f8fafc" },
      ]}
    >
      {data.days.map((d, i) => (
        <View key={i} style={styles.dateColCell}>
          <View style={styles.statusLine}>
            <Text style={styles.tag}>N</Text>
            <Text
              style={[
                styles.pText,
                item.attendance[`day_${d.day_num}_n`] === "A" && styles.aText,
              ]}
            >
              {item.attendance[`day_${d.day_num}_n`] || "-"}
            </Text>
          </View>
          <View style={styles.innerDivider} />
          <View style={styles.statusLine}>
            <Text style={[styles.tag, { color: "#f59e0b" }]}>S</Text>
            <Text
              style={[
                styles.pText,
                item.attendance[`day_${d.day_num}_s`] === "A" && styles.aText,
              ]}
            >
              {item.attendance[`day_${d.day_num}_s`] || "-"}
            </Text>
          </View>
        </View>
      ))}
      <View style={styles.perfColCell}>
        <Text style={styles.sumText}>
          N: P{item.total_n_p} A{item.total_n_a}
        </Text>
        <Text style={[styles.sumText, { color: "#f59e0b" }]}>
          S: P{item.total_s_p} A{item.total_s_a}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topHeader}>
        <View style={styles.headerTopRow}>
          <Text style={styles.brandTitle}>Monthly Attendance</Text>
          <TouchableOpacity
            onPress={generatePDF}
            style={styles.downloadIconBtn}
          >
            <Ionicons name="download-outline" size={16} color="#fff" />
            <Text style={styles.downloadText}>PDF</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipContainer}
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
                  selectedMonth === i + 1 && styles.activeChipText,
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

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.gridArea}>
          <View style={styles.tableContainer}>
            <View style={styles.fixedLeft}>
              <View style={styles.tableHeader}>
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
                keyExtractor={(item, i) => `l_${i}`}
                renderItem={renderLeftRow}
                onScroll={handleLeftScroll}
                style={{ flex: 1 }}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
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
                    <Text style={styles.headerLabel}>Total Perf</Text>
                  </View>
                </View>
                <CrossPlatformList
                  scrollRef={rightFlatListRef}
                  data={data.report}
                  keyExtractor={(item, i) => `r_${i}`}
                  renderItem={renderRightRow}
                  onScroll={handleRightScroll}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Year & Student Modals follow existing logic... */}
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
              style={styles.closeBtn}
              onPress={() => setShowYearModal(false)}
            >
              <Text style={{ color: "#fff" }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showStudentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "70%" }]}>
            <Text style={styles.modalTitle}>Select Student</Text>
            <ScrollView>
              {students.map((item) => (
                <TouchableOpacity
                  key={item.id}
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
              style={styles.closeBtn}
              onPress={() => setShowStudentModal(false)}
            >
              <Text style={{ color: "#fff" }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  topHeader: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 40,
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
  brandTitle: { fontSize: 18, fontWeight: "900", color: "#fff" },
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
    fontSize: 10,
  },
  chipContainer: { marginBottom: 15 },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  activeChip: { backgroundColor: "#fff" },
  chipText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "bold",
    fontSize: 11,
  },
  activeChipText: { color: "#1e3a8a" },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 8,
    borderRadius: 10,
    gap: 5,
  },
  filterBtnText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  gridArea: { flex: 1, marginTop: 5 },
  tableContainer: { flexDirection: "row", flex: 1 },
  fixedLeft: {
    width: 150,
    backgroundColor: "#fff",
    elevation: 5,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    height: 50,
    alignItems: "center",
  },
  photoCol: { width: 40, alignItems: "center" },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  studentPhoto: { width: 28, height: 28, borderRadius: 14 },
  stickyCol: { width: 110, paddingLeft: 5 },
  dateCol: { width: 60, alignItems: "center" },
  perfCol: { width: 120, alignItems: "center" },
  headerLabel: { color: "#94a3b8", fontSize: 9, fontWeight: "bold" },
  daySubLabel: { color: "#f59e0b", fontSize: 8 },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    height: 55,
    alignItems: "center",
  },
  nameText: { fontSize: 11, fontWeight: "700", color: "#1e293b" },
  dateColCell: {
    width: 60,
    paddingVertical: 5,
    borderRightWidth: 0.5,
    borderRightColor: "#f1f5f9",
  },
  statusLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  tag: { fontSize: 7, fontWeight: "900", color: "#64748b" },
  pText: { fontSize: 10, fontWeight: "bold", color: "#10b981" },
  aText: { color: "#ef4444" },
  innerDivider: { height: 1, backgroundColor: "#f8fafc", marginVertical: 2 },
  perfColCell: { width: 120, padding: 5, justifyContent: "center" },
  sumText: { fontSize: 9, fontWeight: "bold", color: "#1e3a8a" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#1e3a8a", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 25,
  },
  modalContent: { backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalItemText: { textAlign: "center", fontSize: 14, color: "#64748b" },
  activeModalItem: { color: "#1e3a8a", fontWeight: "bold" },
  closeBtn: {
    marginTop: 10,
    backgroundColor: "#1e3a8a",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
