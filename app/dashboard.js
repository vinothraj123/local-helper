// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import * as Print from "expo-print";
// import { Stack, useRouter } from "expo-router";
// import * as Sharing from "expo-sharing";
// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   Dimensions,
//   Image,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   RefreshControl,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import axios from "../axios";

// const { width, height } = Dimensions.get("window");

// const showAlert = (title, message, buttons) => {
//   if (Platform.OS === "web") {
//     const hasConfirm = buttons && buttons.length > 1;
//     if (hasConfirm) {
//       const confirmed = window.confirm(`${title}\n\n${message}`);
//       if (confirmed) {
//         const d = buttons.find(
//           (b) => b.style === "destructive" || b.text === "Logout",
//         );
//         if (d?.onPress) d.onPress();
//       }
//     } else {
//       window.alert(`${title}\n\n${message}`);
//       const ok = buttons?.find((b) => b.onPress);
//       if (ok?.onPress) ok.onPress();
//     }
//   } else {
//     Alert.alert(title, message, buttons);
//   }
// };

// // ============================================================
// // ✅ DRUM SCROLL PICKER (Native only)
// // ============================================================
// const ITEM_HEIGHT = 48;
// const VISIBLE_ITEMS = 5;
// const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// function DrumPicker({ values, selected, onChange, pickerWidth = 80 }) {
//   const scrollRef = useRef(null);
//   const selectedIndex = values.indexOf(selected);

//   useEffect(() => {
//     if (scrollRef.current && selectedIndex >= 0) {
//       setTimeout(() => {
//         scrollRef.current?.scrollTo({
//           y: selectedIndex * ITEM_HEIGHT,
//           animated: false,
//         });
//       }, 80);
//     }
//   }, []);

//   const handleMomentumEnd = (e) => {
//     const y = e.nativeEvent.contentOffset.y;
//     const index = Math.round(y / ITEM_HEIGHT);
//     const clamped = Math.max(0, Math.min(index, values.length - 1));
//     scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
//     onChange(values[clamped]);
//   };

//   const handleScroll = (e) => {
//     const y = e.nativeEvent.contentOffset.y;
//     const index = Math.round(y / ITEM_HEIGHT);
//     const clamped = Math.max(0, Math.min(index, values.length - 1));
//     if (values[clamped] !== selected) onChange(values[clamped]);
//   };

//   return (
//     <View style={[drum.container, { width: pickerWidth }]}>
//       <View style={drum.selectorHighlight} pointerEvents="none" />
//       <ScrollView
//         ref={scrollRef}
//         showsVerticalScrollIndicator={false}
//         snapToInterval={ITEM_HEIGHT}
//         decelerationRate="fast"
//         onScroll={handleScroll}
//         onMomentumScrollEnd={handleMomentumEnd}
//         scrollEventThrottle={16}
//         contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
//       >
//         {values.map((val, i) => {
//           const isSelected = val === selected;
//           return (
//             <TouchableOpacity
//               key={i}
//               style={[drum.item, { height: ITEM_HEIGHT }]}
//               onPress={() => {
//                 scrollRef.current?.scrollTo({
//                   y: i * ITEM_HEIGHT,
//                   animated: true,
//                 });
//                 onChange(val);
//               }}
//               activeOpacity={0.7}
//             >
//               <Text
//                 style={[drum.itemText, isSelected && drum.itemTextSelected]}
//               >
//                 {val}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>
//     </View>
//   );
// }

// const drum = StyleSheet.create({
//   container: {
//     height: PICKER_HEIGHT,
//     overflow: "hidden",
//     position: "relative",
//   },
//   selectorHighlight: {
//     position: "absolute",
//     top: ITEM_HEIGHT * 2,
//     left: 0,
//     right: 0,
//     height: ITEM_HEIGHT,
//     borderTopWidth: 1.5,
//     borderBottomWidth: 1.5,
//     borderColor: "#6366f1",
//     zIndex: 10,
//     borderRadius: 0,
//   },
//   item: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   itemText: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: "#cbd5e1",
//     letterSpacing: 1,
//   },
//   itemTextSelected: {
//     color: "#0f172a",
//     fontWeight: "900",
//     fontSize: 26,
//   },
// });

// // ── Native Time Picker Block ──────────────────────────────────
// function NativeTimePicker({ label, color, time, onChangeTime }) {
//   const hours = Array.from({ length: 24 }, (_, i) =>
//     String(i).padStart(2, "0"),
//   );
//   const minutes = Array.from({ length: 60 }, (_, i) =>
//     String(i).padStart(2, "0"),
//   );
//   const [h, m] = time ? time.split(":") : ["06", "00"];
//   const pickerW = Math.floor((width - 96) / 2 - 28);

//   return (
//     <View style={ntp.wrapper}>
//       <View style={[ntp.labelRow, { borderLeftColor: color }]}>
//         <Text style={[ntp.label, { color }]}>{label}</Text>
//         <Text style={ntp.timeDisplay}>
//           {h}:{m}
//         </Text>
//       </View>
//       <View style={ntp.pickerRow}>
//         <DrumPicker
//           values={hours}
//           selected={h}
//           onChange={(val) => onChangeTime(`${val}:${m}`)}
//           pickerWidth={pickerW}
//         />
//         <Text style={ntp.colon}>:</Text>
//         <DrumPicker
//           values={minutes}
//           selected={m}
//           onChange={(val) => onChangeTime(`${h}:${val}`)}
//           pickerWidth={pickerW}
//         />
//       </View>
//     </View>
//   );
// }

// const ntp = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: "#f8fafc",
//     borderRadius: 20,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   labelRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//     paddingLeft: 8,
//     borderLeftWidth: 3,
//   },
//   label: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
//   timeDisplay: {
//     fontSize: 15,
//     fontWeight: "900",
//     color: "#1e293b",
//     letterSpacing: 1,
//   },
//   pickerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   colon: {
//     fontSize: 26,
//     fontWeight: "900",
//     color: "#e2e8f0",
//     marginHorizontal: 4,
//     marginBottom: 4,
//   },
// });

// // ── Web Time Picker ───────────────────────────────────────────
// function WebTimePicker({ label, color, time, onChangeTime }) {
//   const [h, m] = time ? time.split(":") : ["", ""];

//   const handleH = (e) => {
//     let v = e.target.value.replace(/\D/g, "").slice(0, 2);
//     if (v !== "" && parseInt(v) > 23) v = "23";
//     onChangeTime(`${v.padStart(2, "0")}:${m || "00"}`);
//   };
//   const handleM = (e) => {
//     let v = e.target.value.replace(/\D/g, "").slice(0, 2);
//     if (v !== "" && parseInt(v) > 59) v = "59";
//     onChangeTime(`${h || "00"}:${v.padStart(2, "0")}`);
//   };

//   const inputStyle = {
//     width: 48,
//     height: 48,
//     fontSize: 22,
//     fontWeight: 900,
//     color: "#0f172a",
//     textAlign: "center",
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     letterSpacing: 1,
//     borderRadius: 10,
//     cursor: "text",
//     WebkitAppearance: "none",
//     MozAppearance: "textfield",
//   };

//   return (
//     <div
//       style={{
//         flex: 1,
//         backgroundColor: "#f8fafc",
//         borderRadius: 20,
//         padding: 12,
//         border: "1px solid #e2e8f0",
//         display: "flex",
//         flexDirection: "column",
//         gap: 8,
//       }}
//       onMouseDown={(e) => e.stopPropagation()}
//       onClick={(e) => e.stopPropagation()}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           borderLeft: `3px solid ${color}`,
//           paddingLeft: 8,
//         }}
//       >
//         <span
//           style={{ fontSize: 10, fontWeight: 900, color, letterSpacing: 1.5 }}
//         >
//           {label}
//         </span>
//         <span
//           style={{
//             fontSize: 14,
//             fontWeight: 900,
//             color: "#1e293b",
//             letterSpacing: 1,
//           }}
//         >
//           {h || "--"}:{m || "--"}
//         </span>
//       </div>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: "#fff",
//           borderRadius: 14,
//           border: "1px solid #e2e8f0",
//           padding: "6px 8px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <span
//             style={{
//               fontSize: 9,
//               color: "#94a3b8",
//               fontWeight: 700,
//               letterSpacing: 1,
//             }}
//           >
//             HH
//           </span>
//           <input
//             type="number"
//             min="0"
//             max="23"
//             value={h}
//             onChange={handleH}
//             placeholder="--"
//             style={inputStyle}
//           />
//         </div>
//         <span
//           style={{
//             fontSize: 26,
//             fontWeight: 900,
//             color: "#e2e8f0",
//             margin: "0 2px",
//             paddingBottom: 4,
//           }}
//         >
//           :
//         </span>
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <span
//             style={{
//               fontSize: 9,
//               color: "#94a3b8",
//               fontWeight: 700,
//               letterSpacing: 1,
//             }}
//           >
//             MM
//           </span>
//           <input
//             type="number"
//             min="0"
//             max="59"
//             value={m}
//             onChange={handleM}
//             placeholder="--"
//             style={inputStyle}
//           />
//         </div>
//       </div>
//       <div style={{ display: "flex", gap: 4 }}>
//         {["00", "15", "30", "45"].map((min) => (
//           <button
//             key={min}
//             onMouseDown={(e) => e.stopPropagation()}
//             onClick={(e) => {
//               e.stopPropagation();
//               onChangeTime(`${h || "06"}:${min}`);
//             }}
//             style={{
//               flex: 1,
//               padding: "5px 0",
//               fontSize: 10,
//               fontWeight: 800,
//               color: m === min ? "#fff" : "#64748b",
//               backgroundColor: m === min ? color : "#f1f5f9",
//               border: "none",
//               borderRadius: 8,
//               cursor: "pointer",
//             }}
//           >
//             :{min}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ============================================================
// // ✅ TIME RANGE PICKER MODAL — FULLY RESPONSIVE
// // ============================================================
// function TimeRangePickerModal({
//   visible,
//   fromTime,
//   toTime,
//   onApply,
//   onClear,
//   onClose,
// }) {
//   const [localFrom, setLocalFrom] = useState(fromTime || "06:00");
//   const [localTo, setLocalTo] = useState(toTime || "09:00");
//   const [error, setError] = useState("");
//   const slideAnim = useRef(new Animated.Value(height)).current;

//   useEffect(() => {
//     if (visible) {
//       setLocalFrom(fromTime || "06:00");
//       setLocalTo(toTime || "09:00");
//       setError("");
//       if (Platform.OS !== "web") {
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           tension: 80,
//           friction: 12,
//           useNativeDriver: true,
//         }).start();
//       }
//     } else {
//       if (Platform.OS !== "web") {
//         Animated.timing(slideAnim, {
//           toValue: height,
//           duration: 220,
//           useNativeDriver: true,
//         }).start();
//       }
//     }
//   }, [visible]);

//   const validate = (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);

//   const handleApply = () => {
//     if (!validate(localFrom)) {
//       setError("From time சரியாக இல்ல (HH:MM)");
//       return;
//     }
//     if (!validate(localTo)) {
//       setError("To time சரியாக இல்ல (HH:MM)");
//       return;
//     }
//     if (localFrom >= localTo) {
//       setError("From time, To time-ஐ விட குறைவாக இருக்கணும்");
//       return;
//     }
//     setError("");
//     onApply(localFrom, localTo);
//     onClose();
//   };

//   const handleClear = () => {
//     setLocalFrom("06:00");
//     setLocalTo("09:00");
//     setError("");
//     onClear();
//     onClose();
//   };

//   const presets = [
//     { label: "Morning", from: "05:00", to: "09:00", icon: "sunny-outline" },
//     {
//       label: "Afternoon",
//       from: "09:00",
//       to: "13:00",
//       icon: "partly-sunny-outline",
//     },
//     { label: "Evening", from: "15:00", to: "20:00", icon: "moon-outline" },
//   ];

//   const SheetContent = () => (
//     <View style={trp.sheet}>
//       <View style={trp.handle} />

//       {/* Header */}
//       <View style={trp.header}>
//         <View style={trp.headerLeft}>
//           <LinearGradient
//             colors={["#6366f1", "#4f46e5"]}
//             style={trp.headerIcon}
//           >
//             <Ionicons name="time" size={18} color="#fff" />
//           </LinearGradient>
//           <View>
//             <Text style={trp.title}>Time Filter</Text>
//             <Text style={trp.subtitle}>
//               Attendance time range select பண்ணுங்க
//             </Text>
//           </View>
//         </View>
//         <TouchableOpacity onPress={onClose} style={trp.closeBtn}>
//           <Ionicons name="close" size={16} color="#ef4444" />
//         </TouchableOpacity>
//       </View>

//       <View style={trp.divider} />

//       {/* Presets */}
//       <Text style={trp.sectionLabel}>QUICK PRESETS</Text>
//       <View style={trp.presetRow}>
//         {presets.map((p) => {
//           const active = localFrom === p.from && localTo === p.to;
//           return (
//             <TouchableOpacity
//               key={p.label}
//               style={[trp.preset, active && trp.presetActive]}
//               onPress={() => {
//                 setLocalFrom(p.from);
//                 setLocalTo(p.to);
//                 setError("");
//               }}
//             >
//               <Ionicons
//                 name={p.icon}
//                 size={15}
//                 color={active ? "#fff" : "#6366f1"}
//               />
//               <Text style={[trp.presetLabel, active && trp.presetLabelActive]}>
//                 {p.label}
//               </Text>
//               <Text style={[trp.presetTime, active && { color: "#c7d2fe" }]}>
//                 {p.from}–{p.to}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Pickers */}
//       <Text style={[trp.sectionLabel, { marginTop: 18 }]}>
//         {Platform.OS === "web" ? "ENTER TIME" : "SCROLL TO SELECT"}
//       </Text>

//       <View style={trp.pickersRow}>
//         {Platform.OS === "web" ? (
//           <>
//             <WebTimePicker
//               label="FROM"
//               color="#6366f1"
//               time={localFrom}
//               onChangeTime={(v) => {
//                 setLocalFrom(v);
//                 setError("");
//               }}
//             />
//             <View style={trp.arrowWrap}>
//               <Ionicons name="arrow-forward" size={16} color="#6366f1" />
//             </View>
//             <WebTimePicker
//               label="TO"
//               color="#f59e0b"
//               time={localTo}
//               onChangeTime={(v) => {
//                 setLocalTo(v);
//                 setError("");
//               }}
//             />
//           </>
//         ) : (
//           <>
//             <NativeTimePicker
//               label="FROM"
//               color="#6366f1"
//               time={localFrom}
//               onChangeTime={(v) => {
//                 setLocalFrom(v);
//                 setError("");
//               }}
//             />
//             <View style={trp.arrowWrap}>
//               <Ionicons name="arrow-forward" size={16} color="#6366f1" />
//             </View>
//             <NativeTimePicker
//               label="TO"
//               color="#f59e0b"
//               time={localTo}
//               onChangeTime={(v) => {
//                 setLocalTo(v);
//                 setError("");
//               }}
//             />
//           </>
//         )}
//       </View>

//       {/* Preview */}
//       <View style={trp.preview}>
//         <Ionicons name="time-outline" size={14} color="#6366f1" />
//         <Text style={trp.previewText}>
//           {localFrom} → {localTo}
//         </Text>
//       </View>

//       {/* Error */}
//       {error ? (
//         <View style={trp.errorRow}>
//           <Ionicons name="alert-circle" size={13} color="#ef4444" />
//           <Text style={trp.errorText}>{error}</Text>
//         </View>
//       ) : null}

//       {/* Buttons */}
//       <View style={trp.btnRow}>
//         <TouchableOpacity style={trp.clearBtn} onPress={handleClear}>
//           <Ionicons name="refresh" size={14} color="#64748b" />
//           <Text style={trp.clearBtnText}>Clear</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={trp.applyBtnWrap} onPress={handleApply}>
//           <LinearGradient colors={["#6366f1", "#4f46e5"]} style={trp.applyBtn}>
//             <Ionicons name="checkmark-circle" size={16} color="#fff" />
//             <Text style={trp.applyBtnText}>Apply Filter</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   // WEB
//   if (Platform.OS === "web") {
//     if (!visible) return null;
//     return (
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           zIndex: 9999,
//           backgroundColor: "rgba(2,6,23,0.72)",
//           display: "flex",
//           alignItems: "flex-end",
//           justifyContent: "center",
//         }}
//         onMouseDown={onClose}
//       >
//         <div
//           style={{
//             width: "100%",
//             maxWidth: 520,
//             zIndex: 10000,
//             borderRadius: "34px 34px 0 0",
//             overflow: "hidden",
//           }}
//           onMouseDown={(e) => e.stopPropagation()}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <SheetContent />
//         </div>
//       </div>
//     );
//   }

//   // NATIVE
//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="none"
//       onRequestClose={onClose}
//       statusBarTranslucent
//     >
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <View style={trp.overlay}>
//           <TouchableOpacity
//             style={StyleSheet.absoluteFill}
//             activeOpacity={1}
//             onPress={onClose}
//           />
//           <Animated.View
//             style={{ transform: [{ translateY: slideAnim }], width: "100%" }}
//             pointerEvents="box-none"
//           >
//             <SheetContent />
//           </Animated.View>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// }

// const trp = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(2,6,23,0.72)",
//     justifyContent: "flex-end",
//   },
//   sheet: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 34,
//     borderTopRightRadius: 34,
//     padding: 24,
//     paddingBottom: Platform.OS === "ios" ? 40 : 28,
//   },
//   handle: {
//     width: 38,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#e2e8f0",
//     alignSelf: "center",
//     marginBottom: 20,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   headerIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
//   subtitle: { fontSize: 10, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
//   closeBtn: {
//     width: 34,
//     height: 34,
//     borderRadius: 11,
//     backgroundColor: "#fef2f2",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 18 },
//   sectionLabel: {
//     fontSize: 9,
//     fontWeight: "800",
//     color: "#cbd5e1",
//     letterSpacing: 1.5,
//     marginBottom: 10,
//   },
//   presetRow: { flexDirection: "row", gap: 8 },
//   preset: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 4,
//     borderRadius: 16,
//     backgroundColor: "#f8fafc",
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     alignItems: "center",
//     gap: 3,
//   },
//   presetActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
//   presetLabel: { fontSize: 11, fontWeight: "800", color: "#1e293b" },
//   presetLabelActive: { color: "#fff" },
//   presetTime: { fontSize: 9, color: "#94a3b8", fontWeight: "600" },
//   pickersRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   arrowWrap: {
//     width: 28,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   preview: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: "#ede9fe",
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     marginTop: 14,
//     borderWidth: 1,
//     borderColor: "#c7d2fe",
//   },
//   previewText: {
//     fontSize: 14,
//     fontWeight: "900",
//     color: "#4f46e5",
//     letterSpacing: 1,
//   },
//   errorRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginTop: 10,
//   },
//   errorText: { fontSize: 11, color: "#ef4444", fontWeight: "600" },
//   btnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
//   clearBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 14,
//     borderRadius: 18,
//     backgroundColor: "#f8fafc",
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   clearBtnText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
//   applyBtnWrap: { flex: 2, borderRadius: 18, overflow: "hidden" },
//   applyBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 14,
//   },
//   applyBtnText: { fontSize: 14, fontWeight: "900", color: "#fff" },
// });

// // ============================================================
// // ✅ CUSTOM CALENDAR MODAL (Native)
// // ============================================================
// function CustomCalendar({ visible, currentDate, onClose, onSelectDate }) {
//   const today = new Date();
//   today.setHours(12, 0, 0, 0);
//   const [viewYear, setViewYear] = useState(currentDate.getFullYear());
//   const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

//   useEffect(() => {
//     if (visible) {
//       setViewYear(currentDate.getFullYear());
//       setViewMonth(currentDate.getMonth());
//     }
//   }, [visible]);

//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];
//   const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
//   const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
//   const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

//   const prevMonth = () => {
//     if (viewMonth === 0) {
//       setViewMonth(11);
//       setViewYear((y) => y - 1);
//     } else setViewMonth((m) => m - 1);
//   };
//   const nextMonth = () => {
//     const n = new Date(viewYear, viewMonth + 1, 1);
//     if (n > today) return;
//     if (viewMonth === 11) {
//       setViewMonth(0);
//       setViewYear((y) => y + 1);
//     } else setViewMonth((m) => m + 1);
//   };
//   const isNextDisabled = () => new Date(viewYear, viewMonth + 1, 1) > today;

//   const days = [];
//   for (let i = 0; i < getFirstDayOfMonth(viewYear, viewMonth); i++)
//     days.push(null);
//   for (let d = 1; d <= getDaysInMonth(viewYear, viewMonth); d++) days.push(d);

//   const isFuture = (d) => {
//     const x = new Date(viewYear, viewMonth, d);
//     x.setHours(12, 0, 0, 0);
//     return x > today;
//   };
//   const isSelected = (d) =>
//     d &&
//     currentDate.getFullYear() === viewYear &&
//     currentDate.getMonth() === viewMonth &&
//     currentDate.getDate() === d;
//   const isToday = (d) =>
//     d &&
//     today.getFullYear() === viewYear &&
//     today.getMonth() === viewMonth &&
//     today.getDate() === d;

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <TouchableOpacity style={cal.overlay} activeOpacity={1} onPress={onClose}>
//         <TouchableOpacity activeOpacity={1} style={cal.box} onPress={() => {}}>
//           <View style={cal.header}>
//             <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
//               <Ionicons name="chevron-back" size={18} color="#6366f1" />
//             </TouchableOpacity>
//             <Text style={cal.monthTitle}>
//               {monthNames[viewMonth]} {viewYear}
//             </Text>
//             <TouchableOpacity
//               onPress={nextMonth}
//               style={[cal.navBtn, isNextDisabled() && { opacity: 0.3 }]}
//               disabled={isNextDisabled()}
//             >
//               <Ionicons name="chevron-forward" size={18} color="#6366f1" />
//             </TouchableOpacity>
//           </View>
//           <View style={cal.dayRow}>
//             {dayNames.map((d) => (
//               <Text key={d} style={cal.dayName}>
//                 {d}
//               </Text>
//             ))}
//           </View>
//           <View style={cal.grid}>
//             {days.map((day, idx) => {
//               const future = day ? isFuture(day) : false;
//               const sel = isSelected(day);
//               const tod = isToday(day);
//               return (
//                 <TouchableOpacity
//                   key={idx}
//                   style={[
//                     cal.cell,
//                     sel && cal.cellSelected,
//                     tod && !sel && cal.cellToday,
//                     future && cal.cellDisabled,
//                   ]}
//                   onPress={() => {
//                     if (!day || future) return;
//                     const c = new Date(viewYear, viewMonth, day);
//                     c.setHours(12, 0, 0, 0);
//                     onSelectDate(c);
//                     onClose();
//                   }}
//                   disabled={!day || future}
//                   activeOpacity={0.7}
//                 >
//                   {day ? (
//                     <Text
//                       style={[
//                         cal.cellText,
//                         sel && cal.cellTextSelected,
//                         tod && !sel && cal.cellTextToday,
//                         future && cal.cellTextDisabled,
//                       ]}
//                     >
//                       {day}
//                     </Text>
//                   ) : null}
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//           <TouchableOpacity onPress={onClose} style={cal.cancelBtn}>
//             <Text style={cal.cancelText}>Cancel</Text>
//           </TouchableOpacity>
//         </TouchableOpacity>
//       </TouchableOpacity>
//     </Modal>
//   );
// }

// // ============================================================
// // ✅ WEB INLINE CALENDAR
// // ============================================================
// function WebInlineCalendar({ currentDate, onClose, onSelectDate }) {
//   const today = new Date();
//   today.setHours(12, 0, 0, 0);
//   const [viewYear, setViewYear] = useState(currentDate.getFullYear());
//   const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];
//   const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
//   const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
//   const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

//   const prevMonth = () => {
//     if (viewMonth === 0) {
//       setViewMonth(11);
//       setViewYear((y) => y - 1);
//     } else setViewMonth((m) => m - 1);
//   };
//   const nextMonth = () => {
//     const n = new Date(viewYear, viewMonth + 1, 1);
//     if (n > today) return;
//     if (viewMonth === 11) {
//       setViewMonth(0);
//       setViewYear((y) => y + 1);
//     } else setViewMonth((m) => m + 1);
//   };
//   const isNextDisabled = () => new Date(viewYear, viewMonth + 1, 1) > today;

//   const days = [];
//   for (let i = 0; i < getFirstDayOfMonth(viewYear, viewMonth); i++)
//     days.push(null);
//   for (let d = 1; d <= getDaysInMonth(viewYear, viewMonth); d++) days.push(d);

//   const isFuture = (d) => {
//     const x = new Date(viewYear, viewMonth, d);
//     x.setHours(12, 0, 0, 0);
//     return x > today;
//   };
//   const isSelected = (d) =>
//     d &&
//     currentDate.getFullYear() === viewYear &&
//     currentDate.getMonth() === viewMonth &&
//     currentDate.getDate() === d;
//   const isToday = (d) =>
//     d &&
//     today.getFullYear() === viewYear &&
//     today.getMonth() === viewMonth &&
//     today.getDate() === d;

//   return (
//     <View style={wcal.box}>
//       <View style={wcal.header}>
//         <TouchableOpacity onPress={prevMonth} style={wcal.navBtn}>
//           <Ionicons name="chevron-back" size={16} color="#6366f1" />
//         </TouchableOpacity>
//         <Text style={wcal.monthTitle}>
//           {monthNames[viewMonth]} {viewYear}
//         </Text>
//         <TouchableOpacity
//           onPress={nextMonth}
//           style={[wcal.navBtn, isNextDisabled() && { opacity: 0.3 }]}
//           disabled={isNextDisabled()}
//         >
//           <Ionicons name="chevron-forward" size={16} color="#6366f1" />
//         </TouchableOpacity>
//       </View>
//       <View style={wcal.dayRow}>
//         {dayNames.map((d) => (
//           <Text key={d} style={wcal.dayName}>
//             {d}
//           </Text>
//         ))}
//       </View>
//       <View style={wcal.grid}>
//         {days.map((day, idx) => {
//           const future = day ? isFuture(day) : false;
//           const sel = isSelected(day);
//           const tod = isToday(day);
//           return (
//             <TouchableOpacity
//               key={idx}
//               style={[
//                 wcal.cell,
//                 sel && wcal.cellSelected,
//                 tod && !sel && wcal.cellToday,
//                 future && wcal.cellDisabled,
//               ]}
//               onPress={() => {
//                 if (!day || future) return;
//                 const c = new Date(viewYear, viewMonth, day);
//                 c.setHours(12, 0, 0, 0);
//                 onSelectDate(c);
//               }}
//               disabled={!day || future}
//               activeOpacity={0.7}
//             >
//               {day ? (
//                 <Text
//                   style={[
//                     wcal.cellText,
//                     sel && wcal.cellTextSelected,
//                     tod && !sel && wcal.cellTextToday,
//                     future && wcal.cellTextDisabled,
//                   ]}
//                 >
//                   {day}
//                 </Text>
//               ) : null}
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//       <TouchableOpacity onPress={onClose} style={wcal.cancelBtn}>
//         <Text style={wcal.cancelText}>Cancel</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const wcal = StyleSheet.create({
//   box: {
//     backgroundColor: "#f8faff",
//     borderRadius: 16,
//     padding: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#e0e7ff",
//     width: "100%",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   navBtn: {
//     width: 26,
//     height: 26,
//     borderRadius: 8,
//     backgroundColor: "#ede9fe",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   monthTitle: { fontSize: 12, fontWeight: "900", color: "#0f172a" },
//   dayRow: { flexDirection: "row", marginBottom: 2 },
//   dayName: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: 9,
//     fontWeight: "800",
//     color: "#94a3b8",
//   },
//   grid: { flexDirection: "row", flexWrap: "wrap" },
//   cell: {
//     width: `${100 / 7}%`,
//     height: 26,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 6,
//   },
//   cellSelected: { backgroundColor: "#6366f1" },
//   cellToday: {
//     backgroundColor: "#ede9fe",
//     borderWidth: 1,
//     borderColor: "#6366f1",
//   },
//   cellDisabled: { opacity: 0.25 },
//   cellText: { fontSize: 10, fontWeight: "700", color: "#1e293b" },
//   cellTextSelected: { color: "#fff" },
//   cellTextToday: { color: "#6366f1" },
//   cellTextDisabled: { color: "#94a3b8" },
//   cancelBtn: {
//     marginTop: 8,
//     paddingVertical: 6,
//     borderRadius: 10,
//     backgroundColor: "#fef2f2",
//     alignItems: "center",
//   },
//   cancelText: { fontSize: 12, fontWeight: "800", color: "#ef4444" },
// });

// const cal = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(2,6,23,0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   box: {
//     backgroundColor: "#fff",
//     borderRadius: 28,
//     padding: 22,
//     width: width - 48,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.25,
//     shadowRadius: 24,
//     elevation: 20,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   navBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 13,
//     backgroundColor: "#ede9fe",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   monthTitle: { fontSize: 17, fontWeight: "900", color: "#0f172a" },
//   dayRow: { flexDirection: "row", marginBottom: 8 },
//   dayName: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#94a3b8",
//   },
//   grid: { flexDirection: "row", flexWrap: "wrap" },
//   cell: {
//     width: `${100 / 7}%`,
//     aspectRatio: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 11,
//     marginVertical: 2,
//   },
//   cellSelected: { backgroundColor: "#6366f1" },
//   cellToday: {
//     backgroundColor: "#ede9fe",
//     borderWidth: 1.5,
//     borderColor: "#6366f1",
//   },
//   cellDisabled: { opacity: 0.25 },
//   cellText: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
//   cellTextSelected: { color: "#fff" },
//   cellTextToday: { color: "#6366f1" },
//   cellTextDisabled: { color: "#94a3b8" },
//   cancelBtn: {
//     marginTop: 18,
//     paddingVertical: 13,
//     borderRadius: 16,
//     backgroundColor: "#fef2f2",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#fecaca",
//   },
//   cancelText: { fontSize: 14, fontWeight: "800", color: "#ef4444" },
// });

// // ============================================================
// // ✅ ATTENDANCE LIST MODAL
// // ============================================================
// function AttendanceListModal({
//   visible,
//   onClose,
//   filterType,
//   setFilterType,
//   currentDate,
//   formatDate,
//   changeDate,
//   showCalendar,
//   setShowCalendar,
//   isTimeFiltered,
//   fromTime,
//   toTime,
//   setFromTime,
//   setToTime,
//   setShowTimeFilter,
//   filteredList,
//   downloadPDF,
// }) {
//   const Sheet = () => (
//     <View style={alm.sheet}>
//       <View style={alm.handle} />
//       <View style={alm.header}>
//         <View>
//           <Text style={alm.title}>
//             {filterType === "All"
//               ? "Attendance Sheet"
//               : `${filterType} Students`}
//           </Text>
//           <Text style={alm.subtitle}>{formatDate(currentDate)}</Text>
//         </View>
//         <View style={alm.actions}>
//           <TouchableOpacity
//             onPress={() => setShowTimeFilter(true)}
//             style={[
//               alm.actionBtn,
//               isTimeFiltered && { backgroundColor: "#4f46e5" },
//             ]}
//           >
//             <Ionicons
//               name="time-outline"
//               size={20}
//               color={isTimeFiltered ? "#fff" : "#6366f1"}
//             />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={downloadPDF} style={alm.actionBtn}>
//             <Ionicons name="cloud-download-outline" size={20} color="#6366f1" />
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={onClose}
//             style={[alm.actionBtn, { backgroundColor: "#fef2f2" }]}
//           >
//             <Ionicons name="close" size={20} color="#ef4444" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {isTimeFiltered && (
//         <View style={alm.timeStrip}>
//           <Ionicons name="time" size={13} color="#4f46e5" />
//           <Text style={alm.timeStripText}>
//             Time: {fromTime} → {toTime}
//           </Text>
//           <TouchableOpacity
//             onPress={() => {
//               setFromTime("");
//               setToTime("");
//             }}
//             style={{ padding: 2 }}
//           >
//             <Ionicons name="close-circle" size={16} color="#ef4444" />
//           </TouchableOpacity>
//         </View>
//       )}

//       <View style={alm.filterWrapper}>
//         {["All", "Present", "Absent"].map((tab) => (
//           <TouchableOpacity
//             key={tab}
//             style={[
//               alm.filterTab,
//               filterType === tab &&
//                 tab === "Present" && { backgroundColor: "#22c55e" },
//               filterType === tab &&
//                 tab === "Absent" && { backgroundColor: "#ef4444" },
//               filterType === tab &&
//                 tab === "All" && { backgroundColor: "#6366f1" },
//             ]}
//             onPress={() => setFilterType(tab)}
//           >
//             <Text
//               style={[
//                 alm.filterTabText,
//                 filterType === tab && { color: "#fff" },
//               ]}
//             >
//               {tab}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <View style={alm.dateSelector}>
//         <TouchableOpacity
//           onPress={() => changeDate(-1)}
//           style={alm.dateArrowBtn}
//         >
//           <Ionicons name="chevron-back" size={18} color="#6366f1" />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={alm.dateLabelWrap}
//           onPress={() => setShowCalendar(true)}
//           activeOpacity={0.7}
//         >
//           <Ionicons name="calendar" size={16} color="#6366f1" />
//           <Text style={alm.dateLabel}>{formatDate(currentDate)}</Text>
//           <View style={alm.datePickerHint}>
//             <Ionicons name="chevron-down" size={12} color="#6366f1" />
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => changeDate(1)}
//           style={alm.dateArrowBtn}
//         >
//           <Ionicons name="chevron-forward" size={18} color="#6366f1" />
//         </TouchableOpacity>
//       </View>

//       {Platform.OS === "web" && showCalendar && (
//         <WebInlineCalendar
//           currentDate={currentDate}
//           onClose={() => setShowCalendar(false)}
//           onSelectDate={(date) => {
//             setShowCalendar(false);
//           }}
//         />
//       )}

//       <View style={alm.listHeader}>
//         <Text style={alm.headerNo}>#</Text>
//         <Text style={[alm.headerTxt, { flex: 2, textAlign: "left" }]}>
//           Student Name
//         </Text>
//         <Text style={[alm.headerTxt, { flex: 1 }]}>Class</Text>
//         <Text style={[alm.headerTxt, { flex: 1 }]}>N | S</Text>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
//         {filteredList.map((item, index) => (
//           <View
//             key={index}
//             style={[
//               alm.listRow,
//               index % 2 === 0 && { backgroundColor: "#fafafa" },
//             ]}
//           >
//             <View style={alm.serialBox}>
//               <Text style={alm.serialText}>{index + 1}</Text>
//             </View>
//             <View style={alm.avatarBox}>
//               {item.photo ? (
//                 <Image source={{ uri: item.photo }} style={alm.thumb} />
//               ) : (
//                 <View style={alm.avatarPlaceholder}>
//                   <Ionicons name="person" size={13} color="#94a3b8" />
//                 </View>
//               )}
//             </View>
//             <Text style={[alm.studentName, { flex: 2 }]}>{item.name}</Text>
//             <Text style={[alm.classTag, { flex: 1 }]}>
//               {item.is_special ? "N & S" : "Only N"}
//             </Text>
//             <View style={alm.statusGroup}>
//               <Text
//                 style={[
//                   alm.statusChar,
//                   { color: item.n_status === "P" ? "#22c55e" : "#ef4444" },
//                 ]}
//               >
//                 {filterType === "Present"
//                   ? item.n_status === "P"
//                     ? "P"
//                     : ""
//                   : filterType === "Absent"
//                     ? item.n_status === "A"
//                       ? "A"
//                       : ""
//                     : item.n_status}
//               </Text>
//               <Text style={alm.statusDivider}>|</Text>
//               <Text
//                 style={[
//                   alm.statusChar,
//                   { color: item.s_status === "P" ? "#22c55e" : "#ef4444" },
//                 ]}
//               >
//                 {filterType === "Present"
//                   ? item.s_status === "P"
//                     ? "P"
//                     : ""
//                   : filterType === "Absent"
//                     ? item.s_status === "A"
//                       ? "A"
//                       : ""
//                     : item.s_status}
//               </Text>
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );

//   if (Platform.OS === "web") {
//     if (!visible) return null;
//     return (
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           zIndex: 1000,
//           backgroundColor: "rgba(2,6,23,0.72)",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "flex-end",
//         }}
//         onClick={(e) => {
//           if (e.target === e.currentTarget) onClose();
//         }}
//       >
//         <div
//           style={{
//             zIndex: 1001,
//             borderRadius: "34px 34px 0 0",
//             overflow: "hidden",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <Sheet />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Modal
//       animationType="slide"
//       transparent
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={alm.overlay}>
//         <Sheet />
//       </View>
//     </Modal>
//   );
// }

// const alm = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(2,6,23,0.72)",
//     justifyContent: "flex-end",
//   },
//   sheet: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 34,
//     borderTopRightRadius: 34,
//     padding: 24,
//     flexDirection: "column",
//     ...(Platform.OS === "web" ? { height: "88vh" } : { height: "88%" }),
//   },
//   handle: {
//     width: 38,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#e2e8f0",
//     alignSelf: "center",
//     marginBottom: 16,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 14,
//   },
//   title: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
//   subtitle: { color: "#94a3b8", fontSize: 12, fontWeight: "600", marginTop: 2 },
//   actions: { flexDirection: "row", gap: 8 },
//   actionBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 13,
//     backgroundColor: "#ede9fe",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   timeStrip: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: "#ede9fe",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#c7d2fe",
//   },
//   timeStripText: { flex: 1, fontSize: 12, fontWeight: "800", color: "#4f46e5" },
//   filterWrapper: {
//     flexDirection: "row",
//     backgroundColor: "#f8fafc",
//     borderRadius: 16,
//     padding: 4,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     gap: 4,
//   },
//   filterTab: {
//     flex: 1,
//     paddingVertical: 10,
//     alignItems: "center",
//     borderRadius: 12,
//   },
//   filterTabText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
//   dateSelector: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f8fafc",
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     padding: 10,
//     marginBottom: 14,
//   },
//   dateArrowBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     backgroundColor: "#ede9fe",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dateLabelWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#ede9fe",
//     borderRadius: 11,
//     paddingVertical: 7,
//     paddingHorizontal: 10,
//     marginHorizontal: 6,
//   },
//   dateLabel: { fontWeight: "800", color: "#1e293b", fontSize: 14 },
//   datePickerHint: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: "#c7d2fe",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   listHeader: {
//     flexDirection: "row",
//     paddingBottom: 8,
//     borderBottomWidth: 2,
//     borderBottomColor: "#f1f5f9",
//     marginBottom: 4,
//     alignItems: "center",
//   },
//   headerNo: {
//     width: 28,
//     fontSize: 10,
//     fontWeight: "800",
//     color: "#94a3b8",
//     textAlign: "center",
//   },
//   headerTxt: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#94a3b8",
//     textAlign: "center",
//     letterSpacing: 0.5,
//   },
//   listRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f8fafc",
//     borderRadius: 10,
//     paddingHorizontal: 2,
//   },
//   serialBox: { width: 28, alignItems: "center", justifyContent: "center" },
//   serialText: { fontSize: 11, fontWeight: "800", color: "#94a3b8" },
//   avatarBox: { width: 40, marginRight: 6, alignItems: "center" },
//   thumb: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     borderWidth: 2,
//     borderColor: "#e2e8f0",
//   },
//   avatarPlaceholder: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "#f1f5f9",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderStyle: "dashed",
//     borderColor: "#cbd5e1",
//   },
//   studentName: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
//   classTag: {
//     fontSize: 10,
//     color: "#64748b",
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   statusGroup: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   statusChar: { fontSize: 16, fontWeight: "900" },
//   statusDivider: { marginHorizontal: 5, color: "#e2e8f0", fontSize: 15 },
// });

// // ============================================================
// // ✅ MAIN DASHBOARD
// // ============================================================
// export default function Dashboard() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [isListModalVisible, setIsListModalVisible] = useState(false);
//   const [isReportsModalVisible, setIsReportsModalVisible] = useState(false);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [showTimeFilter, setShowTimeFilter] = useState(false);
//   const [fromTime, setFromTime] = useState("");
//   const [toTime, setToTime] = useState("");
//   const isTimeFiltered = !!(fromTime && toTime);

//   const reportBounce = useRef([
//     new Animated.Value(0),
//     new Animated.Value(0),
//     new Animated.Value(0),
//   ]).current;
//   const attendanceBounce = useRef([
//     new Animated.Value(0),
//     new Animated.Value(0),
//   ]).current;
//   const [user, setUser] = useState({ name: "", image: null, role: null });
//   const [image, setImage] = useState(null);
//   const [filterType, setFilterType] = useState("All");
//   const [timeLeft, setTimeLeft] = useState(3600);
//   const [stats, setStats] = useState({
//     n_data: { present: 0, total: 0, percent: 0 },
//     s_data: { present: 0, total: 0, percent: 0 },
//     student_list: [],
//     selected_date: "",
//   });
//   const [isAttendanceModalVisible, setIsAttendanceModalVisible] =
//     useState(false);

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideUp = useRef(new Animated.Value(60)).current;
//   const headerScale = useRef(new Animated.Value(0.95)).current;

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           handleAutoLogout();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const handleAutoLogout = async () => {
//     await AsyncStorage.multiRemove(["token", "user_data"]);
//     showAlert(
//       "Session Expired",
//       "Your session has ended. Please login again.",
//       [{ text: "OK", onPress: () => router.replace("/login") }],
//     );
//   };

//   const formatTimer = (s) =>
//     `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`;

//   const formatDate = (date) => {
//     const y = date.getFullYear(),
//       m = String(date.getMonth() + 1).padStart(2, "0"),
//       d = String(date.getDate()).padStart(2, "0");
//     return `${y}-${m}-${d}`;
//   };

//   useEffect(() => {
//     fetchDashboardData(formatDate(currentDate), fromTime, toTime);
//   }, [currentDate, fromTime, toTime]);

//   const fetchDashboardData = async (dateStr, ft = "", tt = "") => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       let url = `/dashboard-stats/?date=${dateStr}`;
//       if (ft && tt) url += `&from_time=${ft}&to_time=${tt}`;
//       const res = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.data.status.code === 200) setStats(res.data.data);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         await AsyncStorage.multiRemove(["token", "user_data"]);
//         showAlert("Session Expired", "Please login again.", [
//           { text: "OK", onPress: () => router.replace("/login") },
//         ]);
//       }
//     } finally {
//       setLoading(false);
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.spring(slideUp, {
//           toValue: 0,
//           friction: 8,
//           useNativeDriver: true,
//         }),
//         Animated.spring(headerScale, {
//           toValue: 1,
//           friction: 8,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   };

//   const changeDate = (days) => {
//     const d = new Date(currentDate);
//     d.setDate(d.getDate() + days);
//     d.setHours(12, 0, 0, 0);
//     setCurrentDate(d);
//   };

//   const filteredList = (stats.student_list || []).filter((item) => {
//     if (filterType === "Present")
//       return item.n_status === "P" || item.s_status === "P";
//     if (filterType === "Absent")
//       return item.n_status === "A" || item.s_status === "A";
//     return true;
//   });

//   const handleLogout = () => {
//     showAlert("Logout", "Do you want to exit the session?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Logout",
//         style: "destructive",
//         onPress: async () => {
//           await AsyncStorage.multiRemove(["token", "user_data"]);
//           router.replace("/login");
//         },
//       },
//     ]);
//   };

//   const openAttendanceModal = () => {
//     attendanceBounce.forEach((a) => a.setValue(0));
//     setIsAttendanceModalVisible(true);
//     attendanceBounce.forEach((a, i) =>
//       Animated.sequence([
//         Animated.delay(i * 100),
//         Animated.spring(a, {
//           toValue: 1,
//           tension: 180,
//           friction: 5,
//           useNativeDriver: true,
//         }),
//       ]).start(),
//     );
//   };

//   const openReportsModal = () => {
//     reportBounce.forEach((a) => a.setValue(0));
//     setIsReportsModalVisible(true);
//     reportBounce.forEach((a, i) =>
//       Animated.sequence([
//         Animated.delay(i * 100),
//         Animated.spring(a, {
//           toValue: 1,
//           tension: 180,
//           friction: 5,
//           useNativeDriver: true,
//         }),
//       ]).start(),
//     );
//   };

//   useFocusEffect(
//     useCallback(() => {
//       AsyncStorage.getItem("user_data").then((stored) => {
//         if (stored) {
//           const data = JSON.parse(stored);
//           const baseUrl = axios.defaults.baseURL.endsWith("/")
//             ? axios.defaults.baseURL.split("/api")[0]
//             : axios.defaults.baseURL.replace("/api", "");
//           let img = null;
//           if (data.profile) {
//             img = data.profile.startsWith("http")
//               ? data.profile
//               : `${baseUrl}${data.profile}`;
//           }
//           setUser({ name: data.name, image: img, role: data.role });
//           setImage(img);
//         }
//       });
//     }, []),
//   );

//   const downloadPDF = async () => {
//     try {
//       const fullList = stats.student_list || [];
//       const normalStats = {
//         total: fullList.filter((s) => s.n_status === "P" || s.n_status === "A")
//           .length,
//         present: fullList.filter((s) => s.n_status === "P").length,
//         absent: fullList.filter((s) => s.n_status === "A").length,
//       };
//       const specialStats = {
//         total: fullList.filter((s) => s.is_special).length,
//         s_p: fullList.filter((s) => s.is_special && s.s_status === "P").length,
//         s_a: fullList.filter((s) => s.is_special && s.s_status === "A").length,
//       };
//       const totalUniquePresent = fullList.filter(
//         (s) => s.n_status === "P" || s.s_status === "P",
//       ).length;

//       const toBase64iOS = async (url) => {
//         try {
//           if (!url) return null;
//           const token = await AsyncStorage.getItem("token");
//           const localUri =
//             FileSystem.cacheDirectory + "tmp_photo_" + Date.now() + ".jpg";
//           const result = await FileSystem.downloadAsync(url, localUri, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (result.status !== 200) return null;
//           const b64 = await FileSystem.readAsStringAsync(result.uri, {
//             encoding: FileSystem.EncodingType.Base64,
//           });
//           return `data:image/jpeg;base64,${b64}`;
//         } catch {
//           return null;
//         }
//       };

//       let swp;
//       if (Platform.OS === "ios") {
//         swp = await Promise.all(
//           fullList.map(async (s) => ({
//             ...s,
//             b64: await toBase64iOS(s.photo),
//           })),
//         );
//       } else if (Platform.OS === "web") {
//         swp = fullList.map((s) => ({ ...s, b64: s.photo || null }));
//       } else {
//         const toBase64 = async (url) => {
//           try {
//             if (!url) return null;
//             const r = await fetch(url, { cache: "no-cache", mode: "cors" });
//             if (!r.ok) return null;
//             const blob = await r.blob();
//             return await new Promise((res, rej) => {
//               const rd = new FileReader();
//               rd.onloadend = () => res(rd.result);
//               rd.onerror = rej;
//               rd.readAsDataURL(blob);
//             });
//           } catch {
//             return null;
//           }
//         };
//         swp = await Promise.all(
//           fullList.map(async (s) => ({ ...s, b64: await toBase64(s.photo) })),
//         );
//       }

//       const nList = swp
//         .filter((i) => i.n_status === "P")
//         .sort((a, b) => a.name.localeCompare(b.name));
//       const sList = swp
//         .filter((i) => i.is_special && i.s_status === "P")
//         .sort((a, b) => a.name.localeCompare(b.name));
//       const ph = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><circle cx='15' cy='15' r='15' fill='%23e2e8f0'/><circle cx='15' cy='12' r='5' fill='%2394a3b8'/><ellipse cx='15' cy='24' rx='8' ry='5' fill='%2394a3b8'/></svg>`;
//       const isIOS = Platform.OS === "ios";

//       const buildRows = (list, isSpl) =>
//         list
//           .map((item, i) => {
//             const src = item.b64 || ph;
//             const photoCell = isIOS
//               ? `<div style="width:30px;height:30px;border-radius:15px;background-image:url('${src}');background-size:cover;background-position:center;background-color:#e2e8f0;display:inline-block;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>`
//               : `<img src="${src}" style="width:30px;height:30px;border-radius:15px;object-fit:cover;" onerror="this.src='${ph}'"/>`;
//             const sc = isSpl
//               ? item.s_status === "P"
//                 ? "status-p"
//                 : "status-a"
//               : item.n_status === "P"
//                 ? "status-p"
//                 : "status-a";
//             const st = isSpl ? item.s_status || "-" : item.n_status || "-";
//             return `<tr><td>${i + 1}</td><td>${photoCell}</td><td class="name-col">${item.name}</td><td class="${sc}">${st}</td></tr>`;
//           })
//           .join("");

//       const tfNote = isTimeFiltered
//         ? `<p style="text-align:center;margin:2px 0;font-size:12px;color:#6366f1;font-weight:700;">⏱ Time Filter: ${fromTime} – ${toTime}</p>`
//         : "";

//       const html = `<html><head><meta charset="UTF-8"/><style>
//         body{font-family:Helvetica,sans-serif;padding:20px;color:#1e293b;}
//         .title{font-size:24px;font-weight:bold;color:#1e3a8a;text-align:center;}
//         .summary-banner{background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 16px;margin:10px 0 6px;text-align:center;}
//         .summary-banner-label{font-size:11px;color:#15803d;font-weight:600;}
//         .summary-banner-count{font-size:28px;font-weight:900;color:#15803d;}
//         .stats-container{display:flex;gap:10px;margin:10px 0 20px;}
//         .card{flex:1;padding:12px;border-radius:8px;border:1px solid #e2e8f0;}
//         .normal-card{background:#eff6ff;border-left:5px solid #3b82f6;}
//         .special-card{background:#fffbeb;border-left:5px solid #f59e0b;}
//         table{width:100%;border-collapse:collapse;margin-top:10px;table-layout:fixed;}
//         th,td{border:1px solid #cbd5e1;padding:8px;text-align:center;font-size:10px;}
//         th{background-color:#1e3a8a;color:white;}
//         .name-col{text-align:left;font-weight:bold;}
//         .status-p{color:#16a34a;font-weight:bold;}
//         .status-a{color:#dc2626;font-weight:bold;}
//         *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
//       </style></head><body>
//       <div class="title">BSC Cricket Academy</div>
//       <p style="text-align:center;margin:4px 0;">Daily Attendance Report — ${formatDate(currentDate)}</p>
//       ${tfNote}
//       <div class="summary-banner"><div class="summary-banner-label">TOTAL PRESENT STUDENTS</div><div class="summary-banner-count">${totalUniquePresent}</div></div>
//       <div class="stats-container">
//         <div class="card normal-card"><b>NORMAL CLASS</b><br/>Total: ${normalStats.total}&nbsp;&nbsp;P: <span class="status-p">${normalStats.present}</span>&nbsp;&nbsp;A: <span class="status-a">${normalStats.absent}</span></div>
//         <div class="card special-card"><b>SPECIAL CLASS</b><br/>Total: ${specialStats.total}&nbsp;&nbsp;P: <span class="status-p">${specialStats.s_p}</span>&nbsp;&nbsp;A: <span class="status-a">${specialStats.s_a}</span></div>
//       </div>
//       ${nList.length > 0 ? `<h3 style="color:#1e3a8a;border-bottom:1px solid #1e3a8a;">Normal Class (${nList.length})</h3><table><thead><tr><th>#</th><th>Photo</th><th>Name</th><th>Status</th></tr></thead><tbody>${buildRows(nList, false)}</tbody></table>` : ""}
//       ${sList.length > 0 ? `<h3 style="color:#f59e0b;border-bottom:1px solid #f59e0b;">Special Class (${sList.length})</h3><table><thead><tr><th>#</th><th>Photo</th><th>Name</th><th>Status</th></tr></thead><tbody>${buildRows(sList, true)}</tbody></table>` : ""}
//       </body></html>`;

//       if (Platform.OS === "web") {
//         const pw = window.open("", "_blank");
//         if (pw) {
//           pw.document.write(html);
//           pw.document.close();
//           pw.onload = () =>
//             setTimeout(() => {
//               pw.focus();
//               pw.print();
//               pw.onafterprint = () => pw.close();
//             }, 800);
//         }
//       } else if (Platform.OS === "ios") {
//         await Print.printAsync({ html });
//       } else {
//         const { uri } = await Print.printToFileAsync({ html, base64: false });
//         await Sharing.shareAsync(uri, {
//           UTI: ".pdf",
//           mimeType: "application/pdf",
//         });
//       }
//     } catch (err) {
//       showAlert("PDF Error", `Error: ${err.message}`, [{ text: "OK" }]);
//     }
//   };

//   const attendanceItems = [
//     {
//       route: "/Normalstudent",
//       icon: "cricket",
//       iconLib: "MaterialCommunityIcons",
//       color: "#0369a1",
//       bg: "#e0f2fe",
//       label: "Normal Training",
//     },
//     {
//       route: "/Specialstudent",
//       icon: "star-circle",
//       iconLib: "MaterialCommunityIcons",
//       color: "#b45309",
//       bg: "#fef3c7",
//       label: "Special Training",
//     },
//   ];
//   const reportItems = [
//     {
//       route: "/Monthlyattendance",
//       icon: "calendar",
//       iconLib: "Ionicons",
//       color: "#b45309",
//       bg: "#fef3c7",
//       label: "Monthly Report",
//     },
//     {
//       route: "/Splattendancelog",
//       icon: "star-circle",
//       iconLib: "MaterialCommunityIcons",
//       color: "#b91c1c",
//       bg: "#fee2e2",
//       label: "SPL Report",
//     },
//     {
//       route: "/Normalattendancelog",
//       icon: "calendar-outline",
//       iconLib: "Ionicons",
//       color: "#0369a1",
//       bg: "#e0f2fe",
//       label: "Normal Report",
//     },
//   ];

//   const timerColor =
//     timeLeft < 300 ? "#ef4444" : timeLeft < 600 ? "#f59e0b" : "#10b981";

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <Stack.Screen options={{ headerShown: false }} />

//       {/* ✅ NEW RESPONSIVE TIME FILTER MODAL */}
//       <TimeRangePickerModal
//         visible={showTimeFilter}
//         fromTime={fromTime}
//         toTime={toTime}
//         onApply={(ft, tt) => {
//           setFromTime(ft);
//           setToTime(tt);
//         }}
//         onClear={() => {
//           setFromTime("");
//           setToTime("");
//         }}
//         onClose={() => setShowTimeFilter(false)}
//       />

//       <AttendanceListModal
//         visible={isListModalVisible}
//         onClose={() => setIsListModalVisible(false)}
//         filterType={filterType}
//         setFilterType={setFilterType}
//         currentDate={currentDate}
//         formatDate={formatDate}
//         changeDate={changeDate}
//         showCalendar={showCalendar}
//         setShowCalendar={setShowCalendar}
//         isTimeFiltered={isTimeFiltered}
//         fromTime={fromTime}
//         toTime={toTime}
//         setFromTime={setFromTime}
//         setToTime={setToTime}
//         setShowTimeFilter={setShowTimeFilter}
//         filteredList={filteredList}
//         downloadPDF={downloadPDF}
//       />

//       {Platform.OS !== "web" && (
//         <CustomCalendar
//           visible={showCalendar}
//           currentDate={currentDate}
//           onClose={() => setShowCalendar(false)}
//           onSelectDate={(d) => setCurrentDate(d)}
//         />
//       )}

//       {/* HEADER */}
//       <LinearGradient
//         colors={["#020617", "#0c1a3a", "#1e3a8a"]}
//         style={styles.headerGradient}
//       >
//         <View style={styles.headerBlob1} />
//         <View style={styles.headerBlob2} />
//         <Animated.View
//           style={[styles.headerInner, { transform: [{ scale: headerScale }] }]}
//         >
//           <View style={styles.topNav}>
//             <View style={styles.greetingBlock}>
//               <View style={styles.onlineDot} />
//               <View>
//                 <Text style={styles.welcomeLabel}>Good day,</Text>
//                 <Text style={styles.welcomeText}>
//                   {user.name || "Coach"} 👋
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.navActions}>
//               <TouchableOpacity
//                 onPress={() => router.push("/Profile")}
//                 style={styles.avatarBtn}
//               >
//                 {image ? (
//                   <Image source={{ uri: image }} style={styles.headerAvatar} />
//                 ) : (
//                   <LinearGradient
//                     colors={["#6366f1", "#38bdf8"]}
//                     style={styles.avatarFallback}
//                   >
//                     <Ionicons name="person" size={18} color="#fff" />
//                   </LinearGradient>
//                 )}
//                 <View style={styles.avatarRing} />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//                 <Ionicons name="log-out-outline" size={18} color="#ef4444" />
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View style={styles.timerPill}>
//             <View style={[styles.timerDot, { backgroundColor: timerColor }]} />
//             <Ionicons name="time-outline" size={13} color={timerColor} />
//             <Text style={styles.timerLabel}>Session: </Text>
//             <Text style={[styles.timerValue, { color: timerColor }]}>
//               {formatTimer(timeLeft)}
//             </Text>
//           </View>
//         </Animated.View>
//         <View style={styles.headerCurve} />
//       </LinearGradient>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContainer}
//         refreshControl={
//           <RefreshControl
//             refreshing={loading}
//             onRefresh={() =>
//               fetchDashboardData(formatDate(currentDate), fromTime, toTime)
//             }
//           />
//         }
//       >
//         <Animated.View
//           style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }] }}
//         >
//           {/* HERO CARD */}
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => setIsListModalVisible(true)}
//           >
//             <LinearGradient
//               colors={["#0f172a", "#141e33", "#1a1f3a"]}
//               style={styles.heroCard}
//             >
//               <LinearGradient
//                 colors={["#38bdf8", "#6366f1"]}
//                 style={styles.heroTopStripe}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//               />
//               <View style={styles.heroBadgeRow}>
//                 <View style={styles.livePulse}>
//                   <View style={styles.liveDotInner} />
//                 </View>
//                 <Text style={styles.heroLabel}>LIVE ATTENDANCE</Text>
//                 {isTimeFiltered && (
//                   <TouchableOpacity
//                     style={styles.timeFilterBadge}
//                     onPress={() => setShowTimeFilter(true)}
//                     activeOpacity={0.8}
//                   >
//                     <Ionicons name="time" size={10} color="#a5b4fc" />
//                     <Text style={styles.timeFilterBadgeText}>
//                       {fromTime}–{toTime}
//                     </Text>
//                     <TouchableOpacity
//                       onPress={(e) => {
//                         e.stopPropagation?.();
//                         setFromTime("");
//                         setToTime("");
//                       }}
//                       hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
//                     >
//                       <Ionicons name="close-circle" size={12} color="#a5b4fc" />
//                     </TouchableOpacity>
//                   </TouchableOpacity>
//                 )}
//                 <View style={styles.heroDateChip}>
//                   <Text style={styles.heroDateText}>
//                     {formatDate(currentDate)}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.heroStatsRow}>
//                 <View style={styles.heroStatBlock}>
//                   <View style={styles.heroCircleWrap}>
//                     <LinearGradient
//                       colors={["rgba(99,102,241,0.3)", "rgba(99,102,241,0.05)"]}
//                       style={styles.heroCircleBg}
//                     />
//                     <View
//                       style={[styles.heroCircle, { borderColor: "#6366f1" }]}
//                     >
//                       <Text style={styles.heroPercent}>
//                         {stats.n_data?.percent}%
//                       </Text>
//                       <Text style={styles.heroCircleLabel}>Normal</Text>
//                     </View>
//                   </View>
//                   <View style={styles.heroCountRow}>
//                     <Text style={styles.heroCountPresent}>
//                       {stats.n_data?.present}
//                     </Text>
//                     <Text style={styles.heroCountSep}>/</Text>
//                     <Text style={styles.heroCountTotal}>
//                       {stats.n_data?.total}
//                     </Text>
//                   </View>
//                   <Text style={styles.heroCountCaption}>Students Present</Text>
//                 </View>
//                 <View style={styles.heroVertDivider} />
//                 <View style={styles.heroStatBlock}>
//                   <View style={styles.heroCircleWrap}>
//                     <LinearGradient
//                       colors={["rgba(245,158,11,0.3)", "rgba(245,158,11,0.05)"]}
//                       style={styles.heroCircleBg}
//                     />
//                     <View
//                       style={[styles.heroCircle, { borderColor: "#f59e0b" }]}
//                     >
//                       <Text style={[styles.heroPercent, { color: "#f59e0b" }]}>
//                         {stats.s_data?.percent}%
//                       </Text>
//                       <Text style={styles.heroCircleLabel}>Special</Text>
//                     </View>
//                   </View>
//                   <View style={styles.heroCountRow}>
//                     <Text
//                       style={[styles.heroCountPresent, { color: "#f59e0b" }]}
//                     >
//                       {stats.s_data?.present}
//                     </Text>
//                     <Text style={styles.heroCountSep}>/</Text>
//                     <Text style={styles.heroCountTotal}>
//                       {stats.s_data?.total}
//                     </Text>
//                   </View>
//                   <Text style={styles.heroCountCaption}>Students Present</Text>
//                 </View>
//               </View>
//               <View style={styles.heroCTA}>
//                 <Text style={styles.ctaText}>View Full Attendance List</Text>
//                 <View style={styles.ctaArrow}>
//                   <Ionicons name="arrow-forward" size={12} color="#fff" />
//                 </View>
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* MANAGEMENT HUB */}
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Management Hub</Text>
//             <View style={styles.sectionAccent} />
//           </View>

//           <View style={styles.actionGrid}>
//             {user.role !== 3 && (
//               <TouchableOpacity
//                 style={styles.actionCard}
//                 onPress={() => router.push("/Employee")}
//                 activeOpacity={0.8}
//               >
//                 <LinearGradient
//                   colors={["#e0f2fe", "#bfdbfe"]}
//                   style={styles.actionIconGrad}
//                 >
//                   <MaterialCommunityIcons
//                     name="badge-account-horizontal"
//                     size={26}
//                     color="#0369a1"
//                   />
//                 </LinearGradient>
//                 <Text style={styles.actionText}>All{"\n"}Employees</Text>
//                 <View style={styles.actionArrow}>
//                   <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
//                 </View>
//               </TouchableOpacity>
//             )}

//             <TouchableOpacity
//               style={styles.reportsCard}
//               onPress={openAttendanceModal}
//               activeOpacity={0.85}
//             >
//               <LinearGradient
//                 colors={["#064e3b", "#065f46", "#047857"]}
//                 style={styles.reportsCardGrad}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//               >
//                 <View style={styles.reportsBlob} />
//                 <View style={styles.reportsCardTop}>
//                   <View
//                     style={[
//                       styles.reportsFolderIcon,
//                       {
//                         backgroundColor: "rgba(167,243,208,0.15)",
//                         borderColor: "rgba(167,243,208,0.25)",
//                       },
//                     ]}
//                   >
//                     <Ionicons name="calendar" size={28} color="#6ee7b7" />
//                   </View>
//                   <View style={styles.reportsOpenArrow}>
//                     <Ionicons
//                       name="chevron-forward"
//                       size={14}
//                       color="rgba(167,243,208,0.6)"
//                     />
//                   </View>
//                 </View>
//                 <Text style={styles.reportsCardTitle}>Attendance</Text>
//                 <Text
//                   style={[
//                     styles.reportsCardSub,
//                     { color: "rgba(167,243,208,0.6)" },
//                   ]}
//                 >
//                   Normal · Special
//                 </Text>
//                 <View style={styles.reportsPreviewRow}>
//                   {attendanceItems.map((item, idx) => (
//                     <View
//                       key={idx}
//                       style={[
//                         styles.reportsChip,
//                         { backgroundColor: "rgba(167,243,208,0.15)" },
//                       ]}
//                     >
//                       <MaterialCommunityIcons
//                         name={item.icon}
//                         size={12}
//                         color="#6ee7b7"
//                       />
//                     </View>
//                   ))}
//                   <Text
//                     style={[
//                       styles.reportsChipLabel,
//                       { color: "rgba(167,243,208,0.5)" },
//                     ]}
//                   >
//                     2 Classes
//                   </Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionCard}
//               onPress={() => router.push("/Viewstudent")}
//               activeOpacity={0.8}
//             >
//               <LinearGradient
//                 colors={["#fae8ff", "#f3e8ff"]}
//                 style={styles.actionIconGrad}
//               >
//                 <Ionicons name="people" size={26} color="#a21caf" />
//               </LinearGradient>
//               <Text style={styles.actionText}>All{"\n"}Students</Text>
//               <View style={styles.actionArrow}>
//                 <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionCard}
//               onPress={() => router.push("/BookingReport")}
//               activeOpacity={0.8}
//             >
//               <LinearGradient
//                 colors={["#fef3c7", "#fde68a"]}
//                 style={styles.actionIconGrad}
//               >
//                 <Ionicons name="document-text" size={26} color="#b45309" />
//               </LinearGradient>
//               <Text style={styles.actionText}>Booking{"\n"}Reports</Text>
//               <View style={styles.actionArrow}>
//                 <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.reportsCard}
//               onPress={openReportsModal}
//               activeOpacity={0.85}
//             >
//               <LinearGradient
//                 colors={["#1e1b4b", "#312e81", "#3730a3"]}
//                 style={styles.reportsCardGrad}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//               >
//                 <View style={styles.reportsBlob} />
//                 <View style={styles.reportsCardTop}>
//                   <View style={styles.reportsFolderIcon}>
//                     <Ionicons name="folder-open" size={28} color="#a5b4fc" />
//                   </View>
//                   <View style={styles.reportsOpenArrow}>
//                     <Ionicons
//                       name="chevron-forward"
//                       size={14}
//                       color="rgba(165,180,252,0.6)"
//                     />
//                   </View>
//                 </View>
//                 <Text style={styles.reportsCardTitle}>Reports</Text>
//                 <Text style={styles.reportsCardSub}>
//                   Monthly · SPL · Normal
//                 </Text>
//                 <View style={styles.reportsPreviewRow}>
//                   {reportItems.map((item, idx) => (
//                     <View
//                       key={idx}
//                       style={[
//                         styles.reportsChip,
//                         { backgroundColor: item.bg + "33" },
//                       ]}
//                     >
//                       {item.iconLib === "Ionicons" ? (
//                         <Ionicons
//                           name={item.icon}
//                           size={12}
//                           color={item.color}
//                         />
//                       ) : (
//                         <MaterialCommunityIcons
//                           name={item.icon}
//                           size={12}
//                           color={item.color}
//                         />
//                       )}
//                     </View>
//                   ))}
//                   <Text style={styles.reportsChipLabel}>3 Reports</Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.actionCard}
//               onPress={() => router.push("/ViewBooking")}
//               activeOpacity={0.8}
//             >
//               <LinearGradient
//                 colors={["#ede9fe", "#ddd6fe"]}
//                 style={styles.actionIconGrad}
//               >
//                 <Ionicons name="calendar-outline" size={26} color="#7c3aed" />
//               </LinearGradient>
//               <Text style={styles.actionText}>All{"\n"}Bookings</Text>
//               <View style={styles.actionArrow}>
//                 <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
//               </View>
//             </TouchableOpacity>

//             {user.role !== 3 && (
//               <TouchableOpacity
//                 style={styles.actionCard}
//                 onPress={() => router.push("/Feesmanagement")}
//                 activeOpacity={0.8}
//               >
//                 <LinearGradient
//                   colors={["#dcfce7", "#bbf7d0"]}
//                   style={styles.actionIconGrad}
//                 >
//                   <MaterialCommunityIcons
//                     name="cash-register"
//                     size={26}
//                     color="#15803d"
//                   />
//                 </LinearGradient>
//                 <Text style={styles.actionText}>Fees{"\n"}Management</Text>
//                 <View style={styles.actionArrow}>
//                   <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
//                 </View>
//               </TouchableOpacity>
//             )}
//           </View>
//         </Animated.View>
//       </ScrollView>

//       {/* ATTENDANCE TYPE MODAL */}
//       <Modal
//         animationType="fade"
//         transparent
//         visible={isAttendanceModalVisible}
//         onRequestClose={() => setIsAttendanceModalVisible(false)}
//       >
//         <TouchableOpacity
//           style={styles.reportsModalOverlay}
//           activeOpacity={1}
//           onPress={() => setIsAttendanceModalVisible(false)}
//         >
//           <TouchableOpacity
//             activeOpacity={1}
//             style={styles.reportsModalBox}
//             onPress={() => {}}
//           >
//             <View style={styles.modalHandle} />
//             <View style={styles.reportsModalHeader}>
//               <View style={styles.reportsModalTitleRow}>
//                 <View
//                   style={[
//                     styles.reportsModalFolderBadge,
//                     { backgroundColor: "#d1fae5" },
//                   ]}
//                 >
//                   <Ionicons name="calendar" size={18} color="#047857" />
//                 </View>
//                 <View>
//                   <Text style={styles.reportsModalTitle}>Attendance</Text>
//                   <Text style={styles.reportsModalSub}>
//                     Select a class to manage
//                   </Text>
//                 </View>
//               </View>
//               <TouchableOpacity
//                 onPress={() => setIsAttendanceModalVisible(false)}
//                 style={styles.reportsModalClose}
//               >
//                 <Ionicons name="close" size={18} color="#ef4444" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.reportsModalDivider} />
//             <View
//               style={[
//                 styles.reportsModalGrid,
//                 { justifyContent: "center", gap: 16 },
//               ]}
//             >
//               {attendanceItems.map((item, idx) => {
//                 const scale = attendanceBounce[idx].interpolate({
//                   inputRange: [0, 0.6, 0.8, 1],
//                   outputRange: [0, 1.18, 0.92, 1],
//                 });
//                 const opacity = attendanceBounce[idx].interpolate({
//                   inputRange: [0, 0.3, 1],
//                   outputRange: [0, 1, 1],
//                 });
//                 return (
//                   <Animated.View
//                     key={idx}
//                     style={{ transform: [{ scale }], opacity }}
//                   >
//                     <TouchableOpacity
//                       style={[
//                         styles.reportModalCard,
//                         { width: (width - 48 - 16) / 2 },
//                       ]}
//                       activeOpacity={0.8}
//                       onPress={() => {
//                         setIsAttendanceModalVisible(false);
//                         router.push(item.route);
//                       }}
//                     >
//                       <LinearGradient
//                         colors={[item.bg, item.bg + "99"]}
//                         style={styles.reportModalIconWrap}
//                       >
//                         <MaterialCommunityIcons
//                           name={item.icon}
//                           size={36}
//                           color={item.color}
//                         />
//                       </LinearGradient>
//                       <Text style={styles.reportModalCardLabel}>
//                         {item.label}
//                       </Text>
//                       <View
//                         style={[
//                           styles.reportModalArrow,
//                           { backgroundColor: item.bg },
//                         ]}
//                       >
//                         <Ionicons
//                           name="arrow-forward"
//                           size={12}
//                           color={item.color}
//                         />
//                       </View>
//                     </TouchableOpacity>
//                   </Animated.View>
//                 );
//               })}
//             </View>
//             <Text style={styles.reportsModalHint}>Tap outside to close</Text>
//           </TouchableOpacity>
//         </TouchableOpacity>
//       </Modal>

//       {/* REPORTS MODAL */}
//       <Modal
//         animationType="fade"
//         transparent
//         visible={isReportsModalVisible}
//         onRequestClose={() => setIsReportsModalVisible(false)}
//       >
//         <TouchableOpacity
//           style={styles.reportsModalOverlay}
//           activeOpacity={1}
//           onPress={() => setIsReportsModalVisible(false)}
//         >
//           <TouchableOpacity
//             activeOpacity={1}
//             style={styles.reportsModalBox}
//             onPress={() => {}}
//           >
//             <View style={styles.modalHandle} />
//             <View style={styles.reportsModalHeader}>
//               <View style={styles.reportsModalTitleRow}>
//                 <View style={styles.reportsModalFolderBadge}>
//                   <Ionicons name="folder-open" size={18} color="#6366f1" />
//                 </View>
//                 <View>
//                   <Text style={styles.reportsModalTitle}>Reports</Text>
//                   <Text style={styles.reportsModalSub}>
//                     Select a report to view
//                   </Text>
//                 </View>
//               </View>
//               <TouchableOpacity
//                 onPress={() => setIsReportsModalVisible(false)}
//                 style={styles.reportsModalClose}
//               >
//                 <Ionicons name="close" size={18} color="#ef4444" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.reportsModalDivider} />
//             <View style={styles.reportsModalGrid}>
//               {reportItems.map((item, idx) => {
//                 const scale = reportBounce[idx].interpolate({
//                   inputRange: [0, 0.6, 0.8, 1],
//                   outputRange: [0, 1.18, 0.92, 1],
//                 });
//                 const opacity = reportBounce[idx].interpolate({
//                   inputRange: [0, 0.3, 1],
//                   outputRange: [0, 1, 1],
//                 });
//                 return (
//                   <Animated.View
//                     key={idx}
//                     style={{ transform: [{ scale }], opacity }}
//                   >
//                     <TouchableOpacity
//                       style={styles.reportModalCard}
//                       activeOpacity={0.8}
//                       onPress={() => {
//                         setIsReportsModalVisible(false);
//                         router.push(item.route);
//                       }}
//                     >
//                       <LinearGradient
//                         colors={[item.bg, item.bg + "99"]}
//                         style={styles.reportModalIconWrap}
//                       >
//                         {item.iconLib === "Ionicons" ? (
//                           <Ionicons
//                             name={item.icon}
//                             size={32}
//                             color={item.color}
//                           />
//                         ) : (
//                           <MaterialCommunityIcons
//                             name={item.icon}
//                             size={32}
//                             color={item.color}
//                           />
//                         )}
//                       </LinearGradient>
//                       <Text style={styles.reportModalCardLabel}>
//                         {item.label}
//                       </Text>
//                       <View
//                         style={[
//                           styles.reportModalArrow,
//                           { backgroundColor: item.bg },
//                         ]}
//                       >
//                         <Ionicons
//                           name="arrow-forward"
//                           size={12}
//                           color={item.color}
//                         />
//                       </View>
//                     </TouchableOpacity>
//                   </Animated.View>
//                 );
//               })}
//             </View>
//             <Text style={styles.reportsModalHint}>Tap outside to close</Text>
//           </TouchableOpacity>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f1f5f9" },
//   headerGradient: {
//     paddingTop: 52,
//     paddingBottom: 0,
//     paddingHorizontal: 22,
//     position: "relative",
//     overflow: "hidden",
//   },
//   headerBlob1: {
//     position: "absolute",
//     top: -60,
//     right: -40,
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: "rgba(99,102,241,0.14)",
//   },
//   headerBlob2: {
//     position: "absolute",
//     bottom: 20,
//     left: -50,
//     width: 160,
//     height: 160,
//     borderRadius: 80,
//     backgroundColor: "rgba(56,189,248,0.09)",
//   },
//   headerInner: { paddingBottom: 20 },
//   topNav: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   greetingBlock: { flexDirection: "row", alignItems: "center", gap: 10 },
//   onlineDot: {
//     width: 9,
//     height: 9,
//     borderRadius: 5,
//     backgroundColor: "#10b981",
//     marginRight: 4,
//     shadowColor: "#10b981",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.8,
//     shadowRadius: 4,
//   },
//   welcomeLabel: {
//     color: "rgba(148,163,184,0.85)",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   welcomeText: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "900",
//     letterSpacing: 0.3,
//   },
//   navActions: { flexDirection: "row", alignItems: "center", gap: 10 },
//   avatarBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     overflow: "hidden",
//     position: "relative",
//   },
//   avatarRing: {
//     position: "absolute",
//     inset: 0,
//     borderRadius: 22,
//     borderWidth: 2,
//     borderColor: "rgba(99,102,241,0.55)",
//   },
//   headerAvatar: { width: "100%", height: "100%", resizeMode: "cover" },
//   avatarFallback: {
//     width: "100%",
//     height: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   logoutBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(239,68,68,0.14)",
//     borderWidth: 1,
//     borderColor: "rgba(239,68,68,0.28)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   timerPill: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "center",
//     backgroundColor: "rgba(255,255,255,0.08)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     borderRadius: 100,
//     gap: 6,
//   },
//   timerDot: { width: 7, height: 7, borderRadius: 4 },
//   timerLabel: {
//     color: "rgba(148,163,184,0.75)",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   timerValue: { fontSize: 13, fontWeight: "900" },
//   headerCurve: {
//     height: 30,
//     backgroundColor: "#f1f5f9",
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     marginTop: 10,
//   },
//   scrollContainer: { paddingHorizontal: 18, paddingBottom: 50 },
//   heroCard: {
//     borderRadius: 28,
//     marginBottom: 6,
//     overflow: "hidden",
//     elevation: 18,
//     shadowColor: "#0f172a",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.35,
//     shadowRadius: 24,
//   },
//   heroTopStripe: { height: 4 },
//   heroBadgeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 4,
//     gap: 8,
//   },
//   livePulse: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: "rgba(74,222,128,0.18)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   liveDotInner: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#4ade80",
//   },
//   heroLabel: {
//     color: "#94a3b8",
//     fontSize: 10,
//     fontWeight: "800",
//     letterSpacing: 2,
//     flex: 1,
//   },
//   heroDateChip: {
//     backgroundColor: "rgba(255,255,255,0.07)",
//     paddingHorizontal: 11,
//     paddingVertical: 5,
//     borderRadius: 9,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.09)",
//   },
//   heroDateText: { color: "#64748b", fontSize: 10, fontWeight: "700" },
//   timeFilterBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor: "rgba(99,102,241,0.25)",
//     paddingHorizontal: 9,
//     paddingVertical: 5,
//     borderRadius: 9,
//     borderWidth: 1,
//     borderColor: "rgba(165,180,252,0.3)",
//   },
//   timeFilterBadgeText: { color: "#a5b4fc", fontSize: 9, fontWeight: "800" },
//   heroStatsRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 22,
//     paddingHorizontal: 20,
//   },
//   heroStatBlock: { alignItems: "center", flex: 1 },
//   heroCircleWrap: { position: "relative", marginBottom: 12 },
//   heroCircleBg: {
//     position: "absolute",
//     width: 96,
//     height: 96,
//     borderRadius: 48,
//   },
//   heroCircle: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     borderWidth: 2.5,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.03)",
//   },
//   heroPercent: { color: "#fff", fontSize: 22, fontWeight: "900" },
//   heroCircleLabel: {
//     color: "#475569",
//     fontSize: 9,
//     fontWeight: "700",
//     marginTop: 1,
//   },
//   heroCountRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
//   heroCountPresent: { color: "#fff", fontSize: 18, fontWeight: "900" },
//   heroCountSep: { color: "#475569", fontSize: 14 },
//   heroCountTotal: { color: "#64748b", fontSize: 14, fontWeight: "700" },
//   heroCountCaption: {
//     color: "#334155",
//     fontSize: 9,
//     fontWeight: "600",
//     marginTop: 2,
//   },
//   heroVertDivider: {
//     width: 1,
//     height: 72,
//     backgroundColor: "rgba(255,255,255,0.06)",
//   },
//   heroCTA: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     borderTopWidth: 1,
//     borderTopColor: "rgba(255,255,255,0.05)",
//     paddingVertical: 15,
//   },
//   ctaText: { color: "#475569", fontSize: 11, fontWeight: "600" },
//   ctaArrow: {
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     backgroundColor: "rgba(99,102,241,0.35)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginTop: 28,
//     marginBottom: 14,
//   },
//   sectionTitle: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
//   sectionAccent: { flex: 1, height: 1, backgroundColor: "rgba(15,23,42,0.08)" },
//   actionGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   actionCard: {
//     width: "47.5%",
//     backgroundColor: "#fff",
//     borderRadius: 22,
//     padding: 18,
//     alignItems: "flex-start",
//     elevation: 4,
//     shadowColor: "#94a3b8",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.12,
//     shadowRadius: 12,
//     position: "relative",
//     minHeight: 118,
//   },
//   actionIconGrad: {
//     width: 54,
//     height: 54,
//     borderRadius: 17,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   actionText: {
//     fontSize: 13,
//     fontWeight: "800",
//     color: "#1e293b",
//     lineHeight: 18,
//   },
//   actionArrow: {
//     position: "absolute",
//     bottom: 14,
//     right: 14,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "#f1f5f9",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   reportsCard: {
//     width: "47.5%",
//     borderRadius: 22,
//     overflow: "hidden",
//     elevation: 8,
//     shadowColor: "#312e81",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 14,
//     minHeight: 118,
//   },
//   reportsCardGrad: {
//     padding: 16,
//     flex: 1,
//     minHeight: 118,
//     position: "relative",
//     overflow: "hidden",
//   },
//   reportsBlob: {
//     position: "absolute",
//     top: -30,
//     right: -30,
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     backgroundColor: "rgba(165,180,252,0.12)",
//   },
//   reportsCardTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   reportsFolderIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 15,
//     backgroundColor: "rgba(165,180,252,0.15)",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(165,180,252,0.25)",
//   },
//   reportsOpenArrow: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "rgba(165,180,252,0.15)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   reportsCardTitle: {
//     color: "#e0e7ff",
//     fontSize: 14,
//     fontWeight: "900",
//     letterSpacing: 0.3,
//   },
//   reportsCardSub: {
//     color: "rgba(165,180,252,0.6)",
//     fontSize: 9,
//     fontWeight: "600",
//     marginTop: 2,
//     marginBottom: 10,
//   },
//   reportsPreviewRow: { flexDirection: "row", alignItems: "center", gap: 5 },
//   reportsChip: {
//     width: 26,
//     height: 26,
//     borderRadius: 9,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   reportsChipLabel: {
//     color: "rgba(165,180,252,0.5)",
//     fontSize: 9,
//     fontWeight: "700",
//     marginLeft: 2,
//   },
//   reportsModalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(2,6,23,0.68)",
//     justifyContent: "flex-end",
//   },
//   reportsModalBox: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 36,
//     borderTopRightRadius: 36,
//     paddingHorizontal: 24,
//     paddingBottom: 40,
//     paddingTop: 12,
//   },
//   reportsModalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   reportsModalTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
//   reportsModalFolderBadge: {
//     width: 44,
//     height: 44,
//     borderRadius: 15,
//     backgroundColor: "#ede9fe",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   reportsModalTitle: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
//   reportsModalSub: {
//     fontSize: 11,
//     color: "#94a3b8",
//     fontWeight: "600",
//     marginTop: 1,
//   },
//   reportsModalClose: {
//     width: 38,
//     height: 38,
//     borderRadius: 13,
//     backgroundColor: "#fef2f2",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   reportsModalDivider: {
//     height: 1,
//     backgroundColor: "#f1f5f9",
//     marginBottom: 24,
//   },
//   reportsModalGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//     marginBottom: 20,
//   },
//   reportModalCard: {
//     width: (width - 48 - 24) / 3,
//     backgroundColor: "#fafafa",
//     borderRadius: 20,
//     padding: 14,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#f1f5f9",
//     elevation: 3,
//     shadowColor: "#94a3b8",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     position: "relative",
//   },
//   reportModalIconWrap: {
//     width: 62,
//     height: 62,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   reportModalCardLabel: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#1e293b",
//     textAlign: "center",
//     lineHeight: 15,
//   },
//   reportModalArrow: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   reportsModalHint: {
//     textAlign: "center",
//     color: "#cbd5e1",
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   modalHandle: {
//     width: 38,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#e2e8f0",
//     alignSelf: "center",
//     marginBottom: 18,
//   },
// });
//
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { Stack, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "../axios";

const { width, height } = Dimensions.get("window");

const showAlert = (title, message, buttons) => {
  if (Platform.OS === "web") {
    const hasConfirm = buttons && buttons.length > 1;
    if (hasConfirm) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        const d = buttons.find(
          (b) => b.style === "destructive" || b.text === "Logout",
        );
        if (d?.onPress) d.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
      const ok = buttons?.find((b) => b.onPress);
      if (ok?.onPress) ok.onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

// ============================================================
// ✅ DRUM SCROLL PICKER (Native only)
// ============================================================
const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function DrumPicker({ values, selected, onChange, pickerWidth = 80 }) {
  const scrollRef = useRef(null);
  const selectedIndex = values.indexOf(selected);

  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 80);
    }
  }, []);

  const handleMomentumEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    onChange(values[clamped]);
  };

  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    if (values[clamped] !== selected) onChange(values[clamped]);
  };

  return (
    <View style={[drum.container, { width: pickerWidth }]}>
      <View style={drum.selectorHighlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
      >
        {values.map((val, i) => {
          const isSelected = val === selected;
          return (
            <TouchableOpacity
              key={i}
              style={[drum.item, { height: ITEM_HEIGHT }]}
              onPress={() => {
                scrollRef.current?.scrollTo({
                  y: i * ITEM_HEIGHT,
                  animated: true,
                });
                onChange(val);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[drum.itemText, isSelected && drum.itemTextSelected]}
              >
                {val}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const drum = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  selectorHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#6366f1",
    zIndex: 10,
    borderRadius: 0,
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#cbd5e1",
    letterSpacing: 1,
  },
  itemTextSelected: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 26,
  },
});

// ── Native Time Picker Block ──────────────────────────────────
function NativeTimePicker({ label, color, time, onChangeTime }) {
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const [h, m] = time ? time.split(":") : ["06", "00"];
  const pickerW = Math.floor((width - 96) / 2 - 28);

  return (
    <View style={ntp.wrapper}>
      <View style={[ntp.labelRow, { borderLeftColor: color }]}>
        <Text style={[ntp.label, { color }]}>{label}</Text>
        <Text style={ntp.timeDisplay}>
          {h}:{m}
        </Text>
      </View>
      <View style={ntp.pickerRow}>
        <DrumPicker
          values={hours}
          selected={h}
          onChange={(val) => onChangeTime(`${val}:${m}`)}
          pickerWidth={pickerW}
        />
        <Text style={ntp.colon}>:</Text>
        <DrumPicker
          values={minutes}
          selected={m}
          onChange={(val) => onChangeTime(`${h}:${val}`)}
          pickerWidth={pickerW}
        />
      </View>
    </View>
  );
}

const ntp = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 3,
  },
  label: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  timeDisplay: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1e293b",
    letterSpacing: 1,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  colon: {
    fontSize: 26,
    fontWeight: "900",
    color: "#e2e8f0",
    marginHorizontal: 4,
    marginBottom: 4,
  },
});

// ============================================================
// ✅ WEB CLOCK PICKER — Clock-style analog HH MM selector
// ============================================================
function WebTimePicker({ label, color, time, onChangeTime }) {
  const parts = (time || "06:00").split(":");
  const h = parts[0] || "06";
  const m = parts[1] || "00";
  const [mode, setMode] = useState("hour");

  const hNum = parseInt(h, 10) || 0;
  const mNum = parseInt(m, 10) || 0;

  const SIZE = 200;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_OUTER = 76;
  const R_INNER = 50;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const handAngle = mode === "hour" ? (hNum % 12) * 30 - 90 : mNum * 6 - 90;
  const handRadius =
    mode === "hour" ? (hNum >= 12 ? R_INNER : R_OUTER) : R_OUTER;
  const handX = CX + handRadius * Math.cos(toRad(handAngle));
  const handY = CY + handRadius * Math.sin(toRad(handAngle));

  const getPos = (angleDeg, r) => ({
    x: CX + r * Math.cos(toRad(angleDeg - 90)),
    y: CY + r * Math.sin(toRad(angleDeg - 90)),
  });

  const handleClockClick = (e) => {
    e.stopPropagation();
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left - CX;
    const py = e.clientY - rect.top - CY;
    const dist = Math.sqrt(px * px + py * py);
    if (dist > 92) return; // outside clock face — ignore
    const angle = Math.atan2(py, px) * (180 / Math.PI) + 90;
    const norm = ((angle % 360) + 360) % 360;

    if (mode === "hour") {
      const rawH = Math.round(norm / 30) % 12;
      const isInner = dist < (R_OUTER + R_INNER) / 2;
      const finalH = isInner ? rawH + 12 : rawH;
      onChangeTime(`${String(finalH).padStart(2, "0")}:${m}`);
      setMode("minute");
    } else {
      const rawM = Math.round(norm / 6) % 60;
      onChangeTime(`${h}:${String(rawM).padStart(2, "0")}`);
    }
  };

  const outerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const innerHours = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = toRad(i * 6 - 90);
    const isMajor = i % 5 === 0;
    const r1 = isMajor ? 82 : 85;
    return { i, a, isMajor, r1 };
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 20,
        padding: 12,
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Label + current time */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderLeft: `3px solid ${color}`,
          paddingLeft: 8,
        }}
      >
        <span
          style={{ fontSize: 10, fontWeight: 900, color, letterSpacing: 1.5 }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "#1e293b",
            letterSpacing: 1,
          }}
        >
          {h}:{m}
        </span>
      </div>

      {/* HH : MM toggle buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          padding: "4px 10px",
        }}
      >
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setMode("hour");
          }}
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: mode === "hour" ? color : "#94a3b8",
            background: mode === "hour" ? color + "22" : "transparent",
            border: "none",
            borderRadius: 8,
            padding: "2px 10px",
            cursor: "pointer",
            letterSpacing: 1,
            outline: "none",
          }}
        >
          {h}
        </button>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#e2e8f0" }}>
          :
        </span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setMode("minute");
          }}
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: mode === "minute" ? color : "#94a3b8",
            background: mode === "minute" ? color + "22" : "transparent",
            border: "none",
            borderRadius: 8,
            padding: "2px 10px",
            cursor: "pointer",
            letterSpacing: 1,
            outline: "none",
          }}
        >
          {m}
        </button>
      </div>

      {/* Clock Face SVG */}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ cursor: "crosshair", flexShrink: 0 }}
        onClick={handleClockClick}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Background circle */}
        <circle
          cx={CX}
          cy={CY}
          r={90}
          fill="#fff"
          stroke="#e2e8f0"
          strokeWidth={1.5}
        />

        {/* Tick marks */}
        {ticks.map(({ i, a, isMajor, r1 }) => (
          <line
            key={i}
            x1={CX + r1 * Math.cos(a)}
            y1={CY + r1 * Math.sin(a)}
            x2={CX + 88 * Math.cos(a)}
            y2={CY + 88 * Math.sin(a)}
            stroke={isMajor ? "#cbd5e1" : "#e2e8f0"}
            strokeWidth={isMajor ? 1.5 : 0.8}
          />
        ))}

        {/* Inner / outer ring separator — only in hour mode */}
        {mode === "hour" && (
          <circle
            cx={CX}
            cy={CY}
            r={(R_OUTER + R_INNER) / 2}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={18}
          />
        )}

        {/* HOUR MODE numbers */}
        {mode === "hour" && (
          <>
            {outerHours.map((num, i) => {
              const pos = getPos(i * 30, R_OUTER);
              const hVal = num === 12 ? 0 : num;
              const isActive = hNum === hVal;
              return (
                <g key={"o" + num}>
                  {isActive && (
                    <circle cx={pos.x} cy={pos.y} r={13} fill={color} />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isActive ? 12 : 11}
                    fontWeight={isActive ? "900" : "600"}
                    fill={isActive ? "#fff" : "#1e293b"}
                  >
                    {String(hVal).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
            {innerHours.map((num, i) => {
              const pos = getPos(i * 30, R_INNER);
              const isActive = hNum === num;
              return (
                <g key={"i" + num}>
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={11}
                      fill={color}
                      opacity={0.85}
                    />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isActive ? 10 : 9}
                    fontWeight={isActive ? "900" : "600"}
                    fill={isActive ? "#fff" : "#64748b"}
                  >
                    {String(num).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* MINUTE MODE numbers */}
        {mode === "minute" && (
          <>
            {minuteNumbers.map((num, i) => {
              const pos = getPos(i * 30, R_OUTER);
              const isActive = mNum === num;
              return (
                <g key={"mn" + num}>
                  {isActive && (
                    <circle cx={pos.x} cy={pos.y} r={13} fill={color} />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isActive ? 12 : 11}
                    fontWeight={isActive ? "900" : "600"}
                    fill={isActive ? "#fff" : "#1e293b"}
                  >
                    {String(num).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
            {/* Dot for non-5 minute */}
            {mNum % 5 !== 0 && (
              <circle
                cx={CX + R_OUTER * Math.cos(toRad(mNum * 6 - 90))}
                cy={CY + R_OUTER * Math.sin(toRad(mNum * 6 - 90))}
                r={5}
                fill={color}
              />
            )}
          </>
        )}

        {/* Clock hand */}
        <line
          x1={CX}
          y1={CY}
          x2={handX}
          y2={handY}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx={CX} cy={CY} r={4} fill={color} />
        {/* Hand tip glow */}
        <circle cx={handX} cy={handY} r={6} fill={color} opacity={0.25} />
      </svg>

      {/* Mode hint */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: "#94a3b8",
          letterSpacing: 1.5,
        }}
      >
        {mode === "hour" ? "TAP CLOCK TO SET HOUR" : "TAP CLOCK TO SET MINUTE"}
      </div>
    </div>
  );
}

// ============================================================
// ✅ TIME RANGE PICKER MODAL — FULLY RESPONSIVE
// ============================================================
function TimeRangePickerModal({
  visible,
  fromTime,
  toTime,
  onApply,
  onClear,
  onClose,
}) {
  const [localFrom, setLocalFrom] = useState(fromTime || "06:00");
  const [localTo, setLocalTo] = useState(toTime || "09:00");
  const [error, setError] = useState("");
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setLocalFrom(fromTime || "06:00");
      setLocalTo(toTime || "09:00");
      setError("");
      if (Platform.OS !== "web") {
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }).start();
      }
    } else {
      if (Platform.OS !== "web") {
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 220,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [visible]);

  const validate = (val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);

  const handleApply = () => {
    if (!validate(localFrom)) {
      setError("From time சரியாக இல்ல (HH:MM)");
      return;
    }
    if (!validate(localTo)) {
      setError("To time சரியாக இல்ல (HH:MM)");
      return;
    }
    if (localFrom >= localTo) {
      setError("From time, To time-ஐ விட குறைவாக இருக்கணும்");
      return;
    }
    setError("");
    onApply(localFrom, localTo);
    onClose();
  };

  const handleClear = () => {
    setLocalFrom("06:00");
    setLocalTo("09:00");
    setError("");
    onClear();
    onClose();
  };

  const presets = [
    { label: "Morning", from: "05:00", to: "09:00", icon: "sunny-outline" },
    {
      label: "Afternoon",
      from: "09:00",
      to: "13:00",
      icon: "partly-sunny-outline",
    },
    { label: "Evening", from: "15:00", to: "20:00", icon: "moon-outline" },
  ];

  const SheetContent = () => (
    <View style={trp.sheet}>
      <View style={trp.handle} />

      {/* Header */}
      <View style={trp.header}>
        <View style={trp.headerLeft}>
          <LinearGradient
            colors={["#6366f1", "#4f46e5"]}
            style={trp.headerIcon}
          >
            <Ionicons name="time" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={trp.title}>Time Filter</Text>
            <Text style={trp.subtitle}>
              Attendance time range select பண்ணுங்க
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={trp.closeBtn}>
          <Ionicons name="close" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={trp.divider} />

      {/* Presets */}
      <Text style={trp.sectionLabel}>QUICK PRESETS</Text>
      <View style={trp.presetRow}>
        {presets.map((p) => {
          const active = localFrom === p.from && localTo === p.to;
          return (
            <TouchableOpacity
              key={p.label}
              style={[trp.preset, active && trp.presetActive]}
              onPress={() => {
                setLocalFrom(p.from);
                setLocalTo(p.to);
                setError("");
              }}
            >
              <Ionicons
                name={p.icon}
                size={15}
                color={active ? "#fff" : "#6366f1"}
              />
              <Text style={[trp.presetLabel, active && trp.presetLabelActive]}>
                {p.label}
              </Text>
              <Text style={[trp.presetTime, active && { color: "#c7d2fe" }]}>
                {p.from}–{p.to}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pickers */}
      <Text style={[trp.sectionLabel, { marginTop: 18 }]}>
        {Platform.OS === "web"
          ? "TAP CLOCK TO SELECT TIME"
          : "SCROLL TO SELECT"}
      </Text>

      <View style={trp.pickersRow}>
        {Platform.OS === "web" ? (
          <>
            <WebTimePicker
              label="FROM"
              color="#6366f1"
              time={localFrom}
              onChangeTime={(v) => {
                setLocalFrom(v);
                setError("");
              }}
            />
            <View style={trp.arrowWrap}>
              <Ionicons name="arrow-forward" size={16} color="#6366f1" />
            </View>
            <WebTimePicker
              label="TO"
              color="#f59e0b"
              time={localTo}
              onChangeTime={(v) => {
                setLocalTo(v);
                setError("");
              }}
            />
          </>
        ) : (
          <>
            <NativeTimePicker
              label="FROM"
              color="#6366f1"
              time={localFrom}
              onChangeTime={(v) => {
                setLocalFrom(v);
                setError("");
              }}
            />
            <View style={trp.arrowWrap}>
              <Ionicons name="arrow-forward" size={16} color="#6366f1" />
            </View>
            <NativeTimePicker
              label="TO"
              color="#f59e0b"
              time={localTo}
              onChangeTime={(v) => {
                setLocalTo(v);
                setError("");
              }}
            />
          </>
        )}
      </View>

      {/* Preview */}
      <View style={trp.preview}>
        <Ionicons name="time-outline" size={14} color="#6366f1" />
        <Text style={trp.previewText}>
          {localFrom} → {localTo}
        </Text>
      </View>

      {/* Error */}
      {error ? (
        <View style={trp.errorRow}>
          <Ionicons name="alert-circle" size={13} color="#ef4444" />
          <Text style={trp.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Buttons */}
      <View style={trp.btnRow}>
        <TouchableOpacity style={trp.clearBtn} onPress={handleClear}>
          <Ionicons name="refresh" size={14} color="#64748b" />
          <Text style={trp.clearBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={trp.applyBtnWrap} onPress={handleApply}>
          <LinearGradient colors={["#6366f1", "#4f46e5"]} style={trp.applyBtn}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={trp.applyBtnText}>Apply Filter</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // WEB
  if (Platform.OS === "web") {
    if (!visible) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(2,6,23,0.72)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
        onMouseDown={onClose}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            zIndex: 10000,
            borderRadius: "34px 34px 0 0",
            overflow: "hidden",
            maxHeight: "95vh",
            overflowY: "auto",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <SheetContent />
        </div>
      </div>
    );
  }

  // NATIVE
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={trp.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }], width: "100%" }}
            pointerEvents="box-none"
          >
            <SheetContent />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const trp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  subtitle: { fontSize: 10, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 18 },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#cbd5e1",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  presetRow: { flexDirection: "row", gap: 8 },
  preset: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    gap: 3,
  },
  presetActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  presetLabel: { fontSize: 11, fontWeight: "800", color: "#1e293b" },
  presetLabelActive: { color: "#fff" },
  presetTime: { fontSize: 9, color: "#94a3b8", fontWeight: "600" },
  pickersRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  arrowWrap: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ede9fe",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  previewText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#4f46e5",
    letterSpacing: 1,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  errorText: { fontSize: 11, color: "#ef4444", fontWeight: "600" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  clearBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  clearBtnText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  applyBtnWrap: { flex: 2, borderRadius: 18, overflow: "hidden" },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  applyBtnText: { fontSize: 14, fontWeight: "900", color: "#fff" },
});

// ============================================================
// ✅ CUSTOM CALENDAR MODAL (Native)
// ============================================================
function CustomCalendar({ visible, currentDate, onClose, onSelectDate }) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  useEffect(() => {
    if (visible) {
      setViewYear(currentDate.getFullYear());
      setViewMonth(currentDate.getMonth());
    }
  }, [visible]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const n = new Date(viewYear, viewMonth + 1, 1);
    if (n > today) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  const isNextDisabled = () => new Date(viewYear, viewMonth + 1, 1) > today;

  const days = [];
  for (let i = 0; i < getFirstDayOfMonth(viewYear, viewMonth); i++)
    days.push(null);
  for (let d = 1; d <= getDaysInMonth(viewYear, viewMonth); d++) days.push(d);

  const isFuture = (d) => {
    const x = new Date(viewYear, viewMonth, d);
    x.setHours(12, 0, 0, 0);
    return x > today;
  };
  const isSelected = (d) =>
    d &&
    currentDate.getFullYear() === viewYear &&
    currentDate.getMonth() === viewMonth &&
    currentDate.getDate() === d;
  const isToday = (d) =>
    d &&
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={cal.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={cal.box} onPress={() => {}}>
          <View style={cal.header}>
            <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
              <Ionicons name="chevron-back" size={18} color="#6366f1" />
            </TouchableOpacity>
            <Text style={cal.monthTitle}>
              {monthNames[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={nextMonth}
              style={[cal.navBtn, isNextDisabled() && { opacity: 0.3 }]}
              disabled={isNextDisabled()}
            >
              <Ionicons name="chevron-forward" size={18} color="#6366f1" />
            </TouchableOpacity>
          </View>
          <View style={cal.dayRow}>
            {dayNames.map((d) => (
              <Text key={d} style={cal.dayName}>
                {d}
              </Text>
            ))}
          </View>
          <View style={cal.grid}>
            {days.map((day, idx) => {
              const future = day ? isFuture(day) : false;
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    cal.cell,
                    sel && cal.cellSelected,
                    tod && !sel && cal.cellToday,
                    future && cal.cellDisabled,
                  ]}
                  onPress={() => {
                    if (!day || future) return;
                    const c = new Date(viewYear, viewMonth, day);
                    c.setHours(12, 0, 0, 0);
                    onSelectDate(c);
                    onClose();
                  }}
                  disabled={!day || future}
                  activeOpacity={0.7}
                >
                  {day ? (
                    <Text
                      style={[
                        cal.cellText,
                        sel && cal.cellTextSelected,
                        tod && !sel && cal.cellTextToday,
                        future && cal.cellTextDisabled,
                      ]}
                    >
                      {day}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity onPress={onClose} style={cal.cancelBtn}>
            <Text style={cal.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ============================================================
// ✅ WEB INLINE CALENDAR
// ============================================================
function WebInlineCalendar({ currentDate, onClose, onSelectDate }) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const n = new Date(viewYear, viewMonth + 1, 1);
    if (n > today) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  const isNextDisabled = () => new Date(viewYear, viewMonth + 1, 1) > today;

  const days = [];
  for (let i = 0; i < getFirstDayOfMonth(viewYear, viewMonth); i++)
    days.push(null);
  for (let d = 1; d <= getDaysInMonth(viewYear, viewMonth); d++) days.push(d);

  const isFuture = (d) => {
    const x = new Date(viewYear, viewMonth, d);
    x.setHours(12, 0, 0, 0);
    return x > today;
  };
  const isSelected = (d) =>
    d &&
    currentDate.getFullYear() === viewYear &&
    currentDate.getMonth() === viewMonth &&
    currentDate.getDate() === d;
  const isToday = (d) =>
    d &&
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  return (
    <View style={wcal.box}>
      <View style={wcal.header}>
        <TouchableOpacity onPress={prevMonth} style={wcal.navBtn}>
          <Ionicons name="chevron-back" size={16} color="#6366f1" />
        </TouchableOpacity>
        <Text style={wcal.monthTitle}>
          {monthNames[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity
          onPress={nextMonth}
          style={[wcal.navBtn, isNextDisabled() && { opacity: 0.3 }]}
          disabled={isNextDisabled()}
        >
          <Ionicons name="chevron-forward" size={16} color="#6366f1" />
        </TouchableOpacity>
      </View>
      <View style={wcal.dayRow}>
        {dayNames.map((d) => (
          <Text key={d} style={wcal.dayName}>
            {d}
          </Text>
        ))}
      </View>
      <View style={wcal.grid}>
        {days.map((day, idx) => {
          const future = day ? isFuture(day) : false;
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <TouchableOpacity
              key={idx}
              style={[
                wcal.cell,
                sel && wcal.cellSelected,
                tod && !sel && wcal.cellToday,
                future && wcal.cellDisabled,
              ]}
              onPress={() => {
                if (!day || future) return;
                const c = new Date(viewYear, viewMonth, day);
                c.setHours(12, 0, 0, 0);
                onSelectDate(c);
              }}
              disabled={!day || future}
              activeOpacity={0.7}
            >
              {day ? (
                <Text
                  style={[
                    wcal.cellText,
                    sel && wcal.cellTextSelected,
                    tod && !sel && wcal.cellTextToday,
                    future && wcal.cellTextDisabled,
                  ]}
                >
                  {day}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={onClose} style={wcal.cancelBtn}>
        <Text style={wcal.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const wcal = StyleSheet.create({
  box: {
    backgroundColor: "#f8faff",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  navBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  monthTitle: { fontSize: 12, fontWeight: "900", color: "#0f172a" },
  dayRow: { flexDirection: "row", marginBottom: 2 },
  dayName: {
    flex: 1,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "800",
    color: "#94a3b8",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  cellSelected: { backgroundColor: "#6366f1" },
  cellToday: {
    backgroundColor: "#ede9fe",
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  cellDisabled: { opacity: 0.25 },
  cellText: { fontSize: 10, fontWeight: "700", color: "#1e293b" },
  cellTextSelected: { color: "#fff" },
  cellTextToday: { color: "#6366f1" },
  cellTextDisabled: { color: "#94a3b8" },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    alignItems: "center",
  },
  cancelText: { fontSize: 12, fontWeight: "800", color: "#ef4444" },
});

const cal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 22,
    width: width - 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  monthTitle: { fontSize: 17, fontWeight: "900", color: "#0f172a" },
  dayRow: { flexDirection: "row", marginBottom: 8 },
  dayName: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 11,
    marginVertical: 2,
  },
  cellSelected: { backgroundColor: "#6366f1" },
  cellToday: {
    backgroundColor: "#ede9fe",
    borderWidth: 1.5,
    borderColor: "#6366f1",
  },
  cellDisabled: { opacity: 0.25 },
  cellText: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  cellTextSelected: { color: "#fff" },
  cellTextToday: { color: "#6366f1" },
  cellTextDisabled: { color: "#94a3b8" },
  cancelBtn: {
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  cancelText: { fontSize: 14, fontWeight: "800", color: "#ef4444" },
});

// ============================================================
// ✅ ATTENDANCE LIST MODAL
// ============================================================
function AttendanceListModal({
  visible,
  onClose,
  filterType,
  setFilterType,
  currentDate,
  formatDate,
  changeDate,
  showCalendar,
  setShowCalendar,
  isTimeFiltered,
  fromTime,
  toTime,
  setFromTime,
  setToTime,
  setShowTimeFilter,
  filteredList,
  downloadPDF,
}) {
  const Sheet = () => (
    <View style={alm.sheet}>
      <View style={alm.handle} />
      <View style={alm.header}>
        <View>
          <Text style={alm.title}>
            {filterType === "All"
              ? "Attendance Sheet"
              : `${filterType} Students`}
          </Text>
          <Text style={alm.subtitle}>{formatDate(currentDate)}</Text>
        </View>
        <View style={alm.actions}>
          <TouchableOpacity
            onPress={() => setShowTimeFilter(true)}
            style={[
              alm.actionBtn,
              isTimeFiltered && { backgroundColor: "#4f46e5" },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={isTimeFiltered ? "#fff" : "#6366f1"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={downloadPDF} style={alm.actionBtn}>
            <Ionicons name="cloud-download-outline" size={20} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={[alm.actionBtn, { backgroundColor: "#fef2f2" }]}
          >
            <Ionicons name="close" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      {isTimeFiltered && (
        <View style={alm.timeStrip}>
          <Ionicons name="time" size={13} color="#4f46e5" />
          <Text style={alm.timeStripText}>
            Time: {fromTime} → {toTime}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setFromTime("");
              setToTime("");
            }}
            style={{ padding: 2 }}
          >
            <Ionicons name="close-circle" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
      <View style={alm.filterWrapper}>
        {["All", "Present", "Absent"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              alm.filterTab,
              filterType === tab &&
                tab === "Present" && { backgroundColor: "#22c55e" },
              filterType === tab &&
                tab === "Absent" && { backgroundColor: "#ef4444" },
              filterType === tab &&
                tab === "All" && { backgroundColor: "#6366f1" },
            ]}
            onPress={() => setFilterType(tab)}
          >
            <Text
              style={[
                alm.filterTabText,
                filterType === tab && { color: "#fff" },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={alm.dateSelector}>
        <TouchableOpacity
          onPress={() => changeDate(-1)}
          style={alm.dateArrowBtn}
        >
          <Ionicons name="chevron-back" size={18} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={alm.dateLabelWrap}
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar" size={16} color="#6366f1" />
          <Text style={alm.dateLabel}>{formatDate(currentDate)}</Text>
          <View style={alm.datePickerHint}>
            <Ionicons name="chevron-down" size={12} color="#6366f1" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => changeDate(1)}
          style={alm.dateArrowBtn}
        >
          <Ionicons name="chevron-forward" size={18} color="#6366f1" />
        </TouchableOpacity>
      </View>
      {/* {Platform.OS === "web" && showCalendar && (
        <WebInlineCalendar
          currentDate={currentDate}
          onClose={() => setShowCalendar(false)}
          onSelectDate={(date) => {
            setShowCalendar(false);
          }}
        />
      )} */}
      // ✅ CORRECT — first code மாதிரி
      {Platform.OS === "web" && showCalendar && (
        <WebInlineCalendar
          currentDate={currentDate}
          onClose={() => setShowCalendar(false)}
          onSelectDate={(date) => {
            setCurrentDate(date); // ← இந்த line missing ஆச்சு
            setShowCalendar(false);
          }}
        />
      )}
      <View style={alm.listHeader}>
        <Text style={alm.headerNo}>#</Text>
        <Text style={[alm.headerTxt, { flex: 2, textAlign: "left" }]}>
          Student Name
        </Text>
        <Text style={[alm.headerTxt, { flex: 1 }]}>Class</Text>
        <Text style={[alm.headerTxt, { flex: 1 }]}>N | S</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {filteredList.map((item, index) => (
          <View
            key={index}
            style={[
              alm.listRow,
              index % 2 === 0 && { backgroundColor: "#fafafa" },
            ]}
          >
            <View style={alm.serialBox}>
              <Text style={alm.serialText}>{index + 1}</Text>
            </View>
            <View style={alm.avatarBox}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={alm.thumb} />
              ) : (
                <View style={alm.avatarPlaceholder}>
                  <Ionicons name="person" size={13} color="#94a3b8" />
                </View>
              )}
            </View>
            <Text style={[alm.studentName, { flex: 2 }]}>{item.name}</Text>
            <Text style={[alm.classTag, { flex: 1 }]}>
              {item.is_special ? "N & S" : "Only N"}
            </Text>
            <View style={alm.statusGroup}>
              <Text
                style={[
                  alm.statusChar,
                  { color: item.n_status === "P" ? "#22c55e" : "#ef4444" },
                ]}
              >
                {filterType === "Present"
                  ? item.n_status === "P"
                    ? "P"
                    : ""
                  : filterType === "Absent"
                    ? item.n_status === "A"
                      ? "A"
                      : ""
                    : item.n_status}
              </Text>
              <Text style={alm.statusDivider}>|</Text>
              <Text
                style={[
                  alm.statusChar,
                  { color: item.s_status === "P" ? "#22c55e" : "#ef4444" },
                ]}
              >
                {filterType === "Present"
                  ? item.s_status === "P"
                    ? "P"
                    : ""
                  : filterType === "Absent"
                    ? item.s_status === "A"
                      ? "A"
                      : ""
                    : item.s_status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  if (Platform.OS === "web") {
    if (!visible) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          backgroundColor: "rgba(2,6,23,0.72)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            zIndex: 1001,
            borderRadius: "34px 34px 0 0",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Sheet />
        </div>
      </div>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={alm.overlay}>
        <Sheet />
      </View>
    </Modal>
  );
}

const alm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 24,
    flexDirection: "column",
    ...(Platform.OS === "web" ? { height: "88vh" } : { height: "88%" }),
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  subtitle: { color: "#94a3b8", fontSize: 12, fontWeight: "600", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  timeStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  timeStripText: { flex: 1, fontSize: 12, fontWeight: "800", color: "#4f46e5" },
  filterWrapper: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  filterTabText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    marginBottom: 14,
  },
  dateArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  dateLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ede9fe",
    borderRadius: 11,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginHorizontal: 6,
  },
  dateLabel: { fontWeight: "800", color: "#1e293b", fontSize: 14 },
  datePickerHint: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#c7d2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  listHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#f1f5f9",
    marginBottom: 4,
    alignItems: "center",
  },
  headerNo: {
    width: 28,
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    textAlign: "center",
  },
  headerTxt: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 2,
  },
  serialBox: { width: 28, alignItems: "center", justifyContent: "center" },
  serialText: { fontSize: 11, fontWeight: "800", color: "#94a3b8" },
  avatarBox: { width: 40, marginRight: 6, alignItems: "center" },
  thumb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
  },
  studentName: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  classTag: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "600",
  },
  statusGroup: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  statusChar: { fontSize: 16, fontWeight: "900" },
  statusDivider: { marginHorizontal: 5, color: "#e2e8f0", fontSize: 15 },
});

// ============================================================
// ✅ MAIN DASHBOARD
// ============================================================
export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [isReportsModalVisible, setIsReportsModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const isTimeFiltered = !!(fromTime && toTime);

  const reportBounce = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const attendanceBounce = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const [user, setUser] = useState({ name: "", image: null, role: null });
  const [image, setImage] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [timeLeft, setTimeLeft] = useState(3600);
  const [stats, setStats] = useState({
    n_data: { present: 0, total: 0, percent: 0 },
    s_data: { present: 0, total: 0, percent: 0 },
    student_list: [],
    selected_date: "",
  });
  const [isAttendanceModalVisible, setIsAttendanceModalVisible] =
    useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAutoLogout = async () => {
    await AsyncStorage.multiRemove(["token", "user_data"]);
    showAlert(
      "Session Expired",
      "Your session has ended. Please login again.",
      [{ text: "OK", onPress: () => router.replace("/login") }],
    );
  };

  const formatTimer = (s) =>
    `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`;

  const formatDate = (date) => {
    const y = date.getFullYear(),
      m = String(date.getMonth() + 1).padStart(2, "0"),
      d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    fetchDashboardData(formatDate(currentDate), fromTime, toTime);
  }, [currentDate, fromTime, toTime]);

  const fetchDashboardData = async (dateStr, ft = "", tt = "") => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      let url = `/dashboard-stats/?date=${dateStr}`;
      if (ft && tt) url += `&from_time=${ft}&to_time=${tt}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status.code === 200) setStats(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        await AsyncStorage.multiRemove(["token", "user_data"]);
        showAlert("Session Expired", "Please login again.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
      }
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideUp, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(headerScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const changeDate = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    d.setHours(12, 0, 0, 0);
    setCurrentDate(d);
  };

  const filteredList = (stats.student_list || []).filter((item) => {
    if (filterType === "Present")
      return item.n_status === "P" || item.s_status === "P";
    if (filterType === "Absent")
      return item.n_status === "A" || item.s_status === "A";
    return true;
  });

  const handleLogout = () => {
    showAlert("Logout", "Do you want to exit the session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["token", "user_data"]);
          router.replace("/login");
        },
      },
    ]);
  };

  const openAttendanceModal = () => {
    attendanceBounce.forEach((a) => a.setValue(0));
    setIsAttendanceModalVisible(true);
    attendanceBounce.forEach((a, i) =>
      Animated.sequence([
        Animated.delay(i * 100),
        Animated.spring(a, {
          toValue: 1,
          tension: 180,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start(),
    );
  };

  const openReportsModal = () => {
    reportBounce.forEach((a) => a.setValue(0));
    setIsReportsModalVisible(true);
    reportBounce.forEach((a, i) =>
      Animated.sequence([
        Animated.delay(i * 100),
        Animated.spring(a, {
          toValue: 1,
          tension: 180,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start(),
    );
  };

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("user_data").then((stored) => {
        if (stored) {
          const data = JSON.parse(stored);
          const baseUrl = axios.defaults.baseURL.endsWith("/")
            ? axios.defaults.baseURL.split("/api")[0]
            : axios.defaults.baseURL.replace("/api", "");
          let img = null;
          if (data.profile) {
            img = data.profile.startsWith("http")
              ? data.profile
              : `${baseUrl}${data.profile}`;
          }
          setUser({ name: data.name, image: img, role: data.role });
          setImage(img);
        }
      });
    }, []),
  );

  const downloadPDF = async () => {
    try {
      const fullList = stats.student_list || [];
      const normalStats = {
        total: fullList.filter((s) => s.n_status === "P" || s.n_status === "A")
          .length,
        present: fullList.filter((s) => s.n_status === "P").length,
        absent: fullList.filter((s) => s.n_status === "A").length,
      };
      const specialStats = {
        total: fullList.filter((s) => s.is_special).length,
        s_p: fullList.filter((s) => s.is_special && s.s_status === "P").length,
        s_a: fullList.filter((s) => s.is_special && s.s_status === "A").length,
      };
      const totalUniquePresent = fullList.filter(
        (s) => s.n_status === "P" || s.s_status === "P",
      ).length;

      const toBase64iOS = async (url) => {
        try {
          if (!url) return null;
          const token = await AsyncStorage.getItem("token");
          const localUri =
            FileSystem.cacheDirectory + "tmp_photo_" + Date.now() + ".jpg";
          const result = await FileSystem.downloadAsync(url, localUri, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (result.status !== 200) return null;
          const b64 = await FileSystem.readAsStringAsync(result.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return `data:image/jpeg;base64,${b64}`;
        } catch {
          return null;
        }
      };

      let swp;
      if (Platform.OS === "ios") {
        swp = await Promise.all(
          fullList.map(async (s) => ({
            ...s,
            b64: await toBase64iOS(s.photo),
          })),
        );
      } else if (Platform.OS === "web") {
        swp = fullList.map((s) => ({ ...s, b64: s.photo || null }));
      } else {
        const toBase64 = async (url) => {
          try {
            if (!url) return null;
            const r = await fetch(url, { cache: "no-cache", mode: "cors" });
            if (!r.ok) return null;
            const blob = await r.blob();
            return await new Promise((res, rej) => {
              const rd = new FileReader();
              rd.onloadend = () => res(rd.result);
              rd.onerror = rej;
              rd.readAsDataURL(blob);
            });
          } catch {
            return null;
          }
        };
        swp = await Promise.all(
          fullList.map(async (s) => ({ ...s, b64: await toBase64(s.photo) })),
        );
      }

      const nList = swp
        .filter((i) => i.n_status === "P")
        .sort((a, b) => a.name.localeCompare(b.name));
      const sList = swp
        .filter((i) => i.is_special && i.s_status === "P")
        .sort((a, b) => a.name.localeCompare(b.name));
      const ph = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><circle cx='15' cy='15' r='15' fill='%23e2e8f0'/><circle cx='15' cy='12' r='5' fill='%2394a3b8'/><ellipse cx='15' cy='24' rx='8' ry='5' fill='%2394a3b8'/></svg>`;
      const isIOS = Platform.OS === "ios";

      const buildRows = (list, isSpl) =>
        list
          .map((item, i) => {
            const src = item.b64 || ph;
            const photoCell = isIOS
              ? `<div style="width:30px;height:30px;border-radius:15px;background-image:url('${src}');background-size:cover;background-position:center;background-color:#e2e8f0;display:inline-block;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>`
              : `<img src="${src}" style="width:30px;height:30px;border-radius:15px;object-fit:cover;" onerror="this.src='${ph}'"/>`;
            const sc = isSpl
              ? item.s_status === "P"
                ? "status-p"
                : "status-a"
              : item.n_status === "P"
                ? "status-p"
                : "status-a";
            const st = isSpl ? item.s_status || "-" : item.n_status || "-";
            return `<tr><td>${i + 1}</td><td>${photoCell}</td><td class="name-col">${item.name}</td><td class="${sc}">${st}</td></tr>`;
          })
          .join("");

      const tfNote = isTimeFiltered
        ? `<p style="text-align:center;margin:2px 0;font-size:12px;color:#6366f1;font-weight:700;">⏱ Time Filter: ${fromTime} – ${toTime}</p>`
        : "";

      const html = `<html><head><meta charset="UTF-8"/><style>
        body{font-family:Helvetica,sans-serif;padding:20px;color:#1e293b;}
        .title{font-size:24px;font-weight:bold;color:#1e3a8a;text-align:center;}
        .summary-banner{background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 16px;margin:10px 0 6px;text-align:center;}
        .summary-banner-label{font-size:11px;color:#15803d;font-weight:600;}
        .summary-banner-count{font-size:28px;font-weight:900;color:#15803d;}
        .stats-container{display:flex;gap:10px;margin:10px 0 20px;}
        .card{flex:1;padding:12px;border-radius:8px;border:1px solid #e2e8f0;}
        .normal-card{background:#eff6ff;border-left:5px solid #3b82f6;}
        .special-card{background:#fffbeb;border-left:5px solid #f59e0b;}
        table{width:100%;border-collapse:collapse;margin-top:10px;table-layout:fixed;}
        th,td{border:1px solid #cbd5e1;padding:8px;text-align:center;font-size:10px;}
        th{background-color:#1e3a8a;color:white;}
        .name-col{text-align:left;font-weight:bold;}
        .status-p{color:#16a34a;font-weight:bold;}
        .status-a{color:#dc2626;font-weight:bold;}
        *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
      </style></head><body>
      <div class="title">BSC Cricket Academy</div>
      <p style="text-align:center;margin:4px 0;">Daily Attendance Report — ${formatDate(currentDate)}</p>
      ${tfNote}
      <div class="summary-banner"><div class="summary-banner-label">TOTAL PRESENT STUDENTS</div><div class="summary-banner-count">${totalUniquePresent}</div></div>
      <div class="stats-container">
        <div class="card normal-card"><b>NORMAL CLASS</b><br/>Total: ${normalStats.total}&nbsp;&nbsp;P: <span class="status-p">${normalStats.present}</span>&nbsp;&nbsp;A: <span class="status-a">${normalStats.absent}</span></div>
        <div class="card special-card"><b>SPECIAL CLASS</b><br/>Total: ${specialStats.total}&nbsp;&nbsp;P: <span class="status-p">${specialStats.s_p}</span>&nbsp;&nbsp;A: <span class="status-a">${specialStats.s_a}</span></div>
      </div>
      ${nList.length > 0 ? `<h3 style="color:#1e3a8a;border-bottom:1px solid #1e3a8a;">Normal Class (${nList.length})</h3><table><thead><tr><th>#</th><th>Photo</th><th>Name</th><th>Status</th></tr></thead><tbody>${buildRows(nList, false)}</tbody></table>` : ""}
      ${sList.length > 0 ? `<h3 style="color:#f59e0b;border-bottom:1px solid #f59e0b;">Special Class (${sList.length})</h3><table><thead><tr><th>#</th><th>Photo</th><th>Name</th><th>Status</th></tr></thead><tbody>${buildRows(sList, true)}</tbody></table>` : ""}
      </body></html>`;

      if (Platform.OS === "web") {
        const pw = window.open("", "_blank");
        if (pw) {
          pw.document.write(html);
          pw.document.close();
          pw.onload = () =>
            setTimeout(() => {
              pw.focus();
              pw.print();
              pw.onafterprint = () => pw.close();
            }, 800);
        }
      } else if (Platform.OS === "ios") {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      }
    } catch (err) {
      showAlert("PDF Error", `Error: ${err.message}`, [{ text: "OK" }]);
    }
  };

  const attendanceItems = [
    {
      route: "/Normalstudent",
      icon: "cricket",
      iconLib: "MaterialCommunityIcons",
      color: "#0369a1",
      bg: "#e0f2fe",
      label: "Normal Training",
    },
    {
      route: "/Specialstudent",
      icon: "star-circle",
      iconLib: "MaterialCommunityIcons",
      color: "#b45309",
      bg: "#fef3c7",
      label: "Special Training",
    },
  ];
  const reportItems = [
    {
      route: "/Monthlyattendance",
      icon: "calendar",
      iconLib: "Ionicons",
      color: "#b45309",
      bg: "#fef3c7",
      label: "Monthly Report",
    },
    {
      route: "/Splattendancelog",
      icon: "star-circle",
      iconLib: "MaterialCommunityIcons",
      color: "#b91c1c",
      bg: "#fee2e2",
      label: "SPL Report",
    },
    {
      route: "/Normalattendancelog",
      icon: "calendar-outline",
      iconLib: "Ionicons",
      color: "#0369a1",
      bg: "#e0f2fe",
      label: "Normal Report",
    },
  ];

  const timerColor =
    timeLeft < 300 ? "#ef4444" : timeLeft < 600 ? "#f59e0b" : "#10b981";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <TimeRangePickerModal
        visible={showTimeFilter}
        fromTime={fromTime}
        toTime={toTime}
        onApply={(ft, tt) => {
          setFromTime(ft);
          setToTime(tt);
        }}
        onClear={() => {
          setFromTime("");
          setToTime("");
        }}
        onClose={() => setShowTimeFilter(false)}
      />

      <AttendanceListModal
        visible={isListModalVisible}
        onClose={() => setIsListModalVisible(false)}
        filterType={filterType}
        setFilterType={setFilterType}
        currentDate={currentDate}
        formatDate={formatDate}
        changeDate={changeDate}
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
        isTimeFiltered={isTimeFiltered}
        fromTime={fromTime}
        toTime={toTime}
        setFromTime={setFromTime}
        setToTime={setToTime}
        setShowTimeFilter={setShowTimeFilter}
        filteredList={filteredList}
        downloadPDF={downloadPDF}
      />

      {Platform.OS !== "web" && (
        <CustomCalendar
          visible={showCalendar}
          currentDate={currentDate}
          onClose={() => setShowCalendar(false)}
          onSelectDate={(d) => setCurrentDate(d)}
        />
      )}

      {/* HEADER */}
      <LinearGradient
        colors={["#020617", "#0c1a3a", "#1e3a8a"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerBlob1} />
        <View style={styles.headerBlob2} />
        <Animated.View
          style={[styles.headerInner, { transform: [{ scale: headerScale }] }]}
        >
          <View style={styles.topNav}>
            <View style={styles.greetingBlock}>
              <View style={styles.onlineDot} />
              <View>
                <Text style={styles.welcomeLabel}>Good day,</Text>
                <Text style={styles.welcomeText}>
                  {user.name || "Coach"} 👋
                </Text>
              </View>
            </View>
            <View style={styles.navActions}>
              <TouchableOpacity
                onPress={() => router.push("/Profile")}
                style={styles.avatarBtn}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.headerAvatar} />
                ) : (
                  <LinearGradient
                    colors={["#6366f1", "#38bdf8"]}
                    style={styles.avatarFallback}
                  >
                    <Ionicons name="person" size={18} color="#fff" />
                  </LinearGradient>
                )}
                <View style={styles.avatarRing} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.timerPill}>
            <View style={[styles.timerDot, { backgroundColor: timerColor }]} />
            <Ionicons name="time-outline" size={13} color={timerColor} />
            <Text style={styles.timerLabel}>Session: </Text>
            <Text style={[styles.timerValue, { color: timerColor }]}>
              {formatTimer(timeLeft)}
            </Text>
          </View>
        </Animated.View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() =>
              fetchDashboardData(formatDate(currentDate), fromTime, toTime)
            }
          />
        }
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }] }}
        >
          {/* HERO CARD */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsListModalVisible(true)}
          >
            <LinearGradient
              colors={["#0f172a", "#141e33", "#1a1f3a"]}
              style={styles.heroCard}
            >
              <LinearGradient
                colors={["#38bdf8", "#6366f1"]}
                style={styles.heroTopStripe}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <View style={styles.heroBadgeRow}>
                <View style={styles.livePulse}>
                  <View style={styles.liveDotInner} />
                </View>
                <Text style={styles.heroLabel}>LIVE ATTENDANCE</Text>
                {isTimeFiltered && (
                  <TouchableOpacity
                    style={styles.timeFilterBadge}
                    onPress={() => setShowTimeFilter(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="time" size={10} color="#a5b4fc" />
                    <Text style={styles.timeFilterBadgeText}>
                      {fromTime}–{toTime}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation?.();
                        setFromTime("");
                        setToTime("");
                      }}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="close-circle" size={12} color="#a5b4fc" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                <View style={styles.heroDateChip}>
                  <Text style={styles.heroDateText}>
                    {formatDate(currentDate)}
                  </Text>
                </View>
              </View>
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatBlock}>
                  <View style={styles.heroCircleWrap}>
                    <LinearGradient
                      colors={["rgba(99,102,241,0.3)", "rgba(99,102,241,0.05)"]}
                      style={styles.heroCircleBg}
                    />
                    <View
                      style={[styles.heroCircle, { borderColor: "#6366f1" }]}
                    >
                      <Text style={styles.heroPercent}>
                        {stats.n_data?.percent}%
                      </Text>
                      <Text style={styles.heroCircleLabel}>Normal</Text>
                    </View>
                  </View>
                  <View style={styles.heroCountRow}>
                    <Text style={styles.heroCountPresent}>
                      {stats.n_data?.present}
                    </Text>
                    <Text style={styles.heroCountSep}>/</Text>
                    <Text style={styles.heroCountTotal}>
                      {stats.n_data?.total}
                    </Text>
                  </View>
                  <Text style={styles.heroCountCaption}>Students Present</Text>
                </View>
                <View style={styles.heroVertDivider} />
                <View style={styles.heroStatBlock}>
                  <View style={styles.heroCircleWrap}>
                    <LinearGradient
                      colors={["rgba(245,158,11,0.3)", "rgba(245,158,11,0.05)"]}
                      style={styles.heroCircleBg}
                    />
                    <View
                      style={[styles.heroCircle, { borderColor: "#f59e0b" }]}
                    >
                      <Text style={[styles.heroPercent, { color: "#f59e0b" }]}>
                        {stats.s_data?.percent}%
                      </Text>
                      <Text style={styles.heroCircleLabel}>Special</Text>
                    </View>
                  </View>
                  <View style={styles.heroCountRow}>
                    <Text
                      style={[styles.heroCountPresent, { color: "#f59e0b" }]}
                    >
                      {stats.s_data?.present}
                    </Text>
                    <Text style={styles.heroCountSep}>/</Text>
                    <Text style={styles.heroCountTotal}>
                      {stats.s_data?.total}
                    </Text>
                  </View>
                  <Text style={styles.heroCountCaption}>Students Present</Text>
                </View>
              </View>
              <View style={styles.heroCTA}>
                <Text style={styles.ctaText}>View Full Attendance List</Text>
                <View style={styles.ctaArrow}>
                  <Ionicons name="arrow-forward" size={12} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* MANAGEMENT HUB */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Management Hub</Text>
            <View style={styles.sectionAccent} />
          </View>

          <View style={styles.actionGrid}>
            {user.role !== 3 && (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/Employee")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#e0f2fe", "#bfdbfe"]}
                  style={styles.actionIconGrad}
                >
                  <MaterialCommunityIcons
                    name="badge-account-horizontal"
                    size={26}
                    color="#0369a1"
                  />
                </LinearGradient>
                <Text style={styles.actionText}>All{"\n"}Employees</Text>
                <View style={styles.actionArrow}>
                  <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.reportsCard}
              onPress={openAttendanceModal}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#064e3b", "#065f46", "#047857"]}
                style={styles.reportsCardGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.reportsBlob} />
                <View style={styles.reportsCardTop}>
                  <View
                    style={[
                      styles.reportsFolderIcon,
                      {
                        backgroundColor: "rgba(167,243,208,0.15)",
                        borderColor: "rgba(167,243,208,0.25)",
                      },
                    ]}
                  >
                    <Ionicons name="calendar" size={28} color="#6ee7b7" />
                  </View>
                  <View style={styles.reportsOpenArrow}>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="rgba(167,243,208,0.6)"
                    />
                  </View>
                </View>
                <Text style={styles.reportsCardTitle}>Attendance</Text>
                <Text
                  style={[
                    styles.reportsCardSub,
                    { color: "rgba(167,243,208,0.6)" },
                  ]}
                >
                  Normal · Special
                </Text>
                <View style={styles.reportsPreviewRow}>
                  {attendanceItems.map((item, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.reportsChip,
                        { backgroundColor: "rgba(167,243,208,0.15)" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={12}
                        color="#6ee7b7"
                      />
                    </View>
                  ))}
                  <Text
                    style={[
                      styles.reportsChipLabel,
                      { color: "rgba(167,243,208,0.5)" },
                    ]}
                  >
                    2 Classes
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/Viewstudent")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#fae8ff", "#f3e8ff"]}
                style={styles.actionIconGrad}
              >
                <Ionicons name="people" size={26} color="#a21caf" />
              </LinearGradient>
              <Text style={styles.actionText}>All{"\n"}Students</Text>
              <View style={styles.actionArrow}>
                <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/BookingReport")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#fef3c7", "#fde68a"]}
                style={styles.actionIconGrad}
              >
                <Ionicons name="document-text" size={26} color="#b45309" />
              </LinearGradient>
              <Text style={styles.actionText}>Booking{"\n"}Reports</Text>
              <View style={styles.actionArrow}>
                <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportsCard}
              onPress={openReportsModal}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#1e1b4b", "#312e81", "#3730a3"]}
                style={styles.reportsCardGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.reportsBlob} />
                <View style={styles.reportsCardTop}>
                  <View style={styles.reportsFolderIcon}>
                    <Ionicons name="folder-open" size={28} color="#a5b4fc" />
                  </View>
                  <View style={styles.reportsOpenArrow}>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="rgba(165,180,252,0.6)"
                    />
                  </View>
                </View>
                <Text style={styles.reportsCardTitle}>Reports</Text>
                <Text style={styles.reportsCardSub}>
                  Monthly · SPL · Normal
                </Text>
                <View style={styles.reportsPreviewRow}>
                  {reportItems.map((item, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.reportsChip,
                        { backgroundColor: item.bg + "33" },
                      ]}
                    >
                      {item.iconLib === "Ionicons" ? (
                        <Ionicons
                          name={item.icon}
                          size={12}
                          color={item.color}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={12}
                          color={item.color}
                        />
                      )}
                    </View>
                  ))}
                  <Text style={styles.reportsChipLabel}>3 Reports</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/ViewBooking")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ede9fe", "#ddd6fe"]}
                style={styles.actionIconGrad}
              >
                <Ionicons name="calendar-outline" size={26} color="#7c3aed" />
              </LinearGradient>
              <Text style={styles.actionText}>All{"\n"}Bookings</Text>
              <View style={styles.actionArrow}>
                <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            {user.role !== 3 && (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/Feesmanagement")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#dcfce7", "#bbf7d0"]}
                  style={styles.actionIconGrad}
                >
                  <MaterialCommunityIcons
                    name="cash-register"
                    size={26}
                    color="#15803d"
                  />
                </LinearGradient>
                <Text style={styles.actionText}>Fees{"\n"}Management</Text>
                <View style={styles.actionArrow}>
                  <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ATTENDANCE TYPE MODAL */}
      <Modal
        animationType="fade"
        transparent
        visible={isAttendanceModalVisible}
        onRequestClose={() => setIsAttendanceModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.reportsModalOverlay}
          activeOpacity={1}
          onPress={() => setIsAttendanceModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.reportsModalBox}
            onPress={() => {}}
          >
            <View style={styles.modalHandle} />
            <View style={styles.reportsModalHeader}>
              <View style={styles.reportsModalTitleRow}>
                <View
                  style={[
                    styles.reportsModalFolderBadge,
                    { backgroundColor: "#d1fae5" },
                  ]}
                >
                  <Ionicons name="calendar" size={18} color="#047857" />
                </View>
                <View>
                  <Text style={styles.reportsModalTitle}>Attendance</Text>
                  <Text style={styles.reportsModalSub}>
                    Select a class to manage
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsAttendanceModalVisible(false)}
                style={styles.reportsModalClose}
              >
                <Ionicons name="close" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <View style={styles.reportsModalDivider} />
            <View
              style={[
                styles.reportsModalGrid,
                { justifyContent: "center", gap: 16 },
              ]}
            >
              {attendanceItems.map((item, idx) => {
                const scale = attendanceBounce[idx].interpolate({
                  inputRange: [0, 0.6, 0.8, 1],
                  outputRange: [0, 1.18, 0.92, 1],
                });
                const opacity = attendanceBounce[idx].interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0, 1, 1],
                });
                return (
                  <Animated.View
                    key={idx}
                    style={{ transform: [{ scale }], opacity }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.reportModalCard,
                        { width: (width - 48 - 16) / 2 },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => {
                        setIsAttendanceModalVisible(false);
                        router.push(item.route);
                      }}
                    >
                      <LinearGradient
                        colors={[item.bg, item.bg + "99"]}
                        style={styles.reportModalIconWrap}
                      >
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={36}
                          color={item.color}
                        />
                      </LinearGradient>
                      <Text style={styles.reportModalCardLabel}>
                        {item.label}
                      </Text>
                      <View
                        style={[
                          styles.reportModalArrow,
                          { backgroundColor: item.bg },
                        ]}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={12}
                          color={item.color}
                        />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
            <Text style={styles.reportsModalHint}>Tap outside to close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* REPORTS MODAL */}
      <Modal
        animationType="fade"
        transparent
        visible={isReportsModalVisible}
        onRequestClose={() => setIsReportsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.reportsModalOverlay}
          activeOpacity={1}
          onPress={() => setIsReportsModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.reportsModalBox}
            onPress={() => {}}
          >
            <View style={styles.modalHandle} />
            <View style={styles.reportsModalHeader}>
              <View style={styles.reportsModalTitleRow}>
                <View style={styles.reportsModalFolderBadge}>
                  <Ionicons name="folder-open" size={18} color="#6366f1" />
                </View>
                <View>
                  <Text style={styles.reportsModalTitle}>Reports</Text>
                  <Text style={styles.reportsModalSub}>
                    Select a report to view
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsReportsModalVisible(false)}
                style={styles.reportsModalClose}
              >
                <Ionicons name="close" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <View style={styles.reportsModalDivider} />
            <View style={styles.reportsModalGrid}>
              {reportItems.map((item, idx) => {
                const scale = reportBounce[idx].interpolate({
                  inputRange: [0, 0.6, 0.8, 1],
                  outputRange: [0, 1.18, 0.92, 1],
                });
                const opacity = reportBounce[idx].interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0, 1, 1],
                });
                return (
                  <Animated.View
                    key={idx}
                    style={{ transform: [{ scale }], opacity }}
                  >
                    <TouchableOpacity
                      style={styles.reportModalCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        setIsReportsModalVisible(false);
                        router.push(item.route);
                      }}
                    >
                      <LinearGradient
                        colors={[item.bg, item.bg + "99"]}
                        style={styles.reportModalIconWrap}
                      >
                        {item.iconLib === "Ionicons" ? (
                          <Ionicons
                            name={item.icon}
                            size={32}
                            color={item.color}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name={item.icon}
                            size={32}
                            color={item.color}
                          />
                        )}
                      </LinearGradient>
                      <Text style={styles.reportModalCardLabel}>
                        {item.label}
                      </Text>
                      <View
                        style={[
                          styles.reportModalArrow,
                          { backgroundColor: item.bg },
                        ]}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={12}
                          color={item.color}
                        />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
            <Text style={styles.reportsModalHint}>Tap outside to close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  headerGradient: {
    paddingTop: 52,
    paddingBottom: 0,
    paddingHorizontal: 22,
    position: "relative",
    overflow: "hidden",
  },
  headerBlob1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(99,102,241,0.14)",
  },
  headerBlob2: {
    position: "absolute",
    bottom: 20,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(56,189,248,0.09)",
  },
  headerInner: { paddingBottom: 20 },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  greetingBlock: { flexDirection: "row", alignItems: "center", gap: 10 },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#10b981",
    marginRight: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  welcomeLabel: {
    color: "rgba(148,163,184,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  navActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
  },
  avatarRing: {
    position: "absolute",
    inset: 0,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(99,102,241,0.55)",
  },
  headerAvatar: { width: "100%", height: "100%", resizeMode: "cover" },
  avatarFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.14)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.28)",
    justifyContent: "center",
    alignItems: "center",
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 100,
    gap: 6,
  },
  timerDot: { width: 7, height: 7, borderRadius: 4 },
  timerLabel: {
    color: "rgba(148,163,184,0.75)",
    fontSize: 12,
    fontWeight: "600",
  },
  timerValue: { fontSize: 13, fontWeight: "900" },
  headerCurve: {
    height: 30,
    backgroundColor: "#f1f5f9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
  },
  scrollContainer: { paddingHorizontal: 18, paddingBottom: 50 },
  heroCard: {
    borderRadius: 28,
    marginBottom: 6,
    overflow: "hidden",
    elevation: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  heroTopStripe: { height: 4 },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  livePulse: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(74,222,128,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  liveDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
  },
  heroLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    flex: 1,
  },
  heroDateChip: {
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },
  heroDateText: { color: "#64748b", fontSize: 10, fontWeight: "700" },
  timeFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(99,102,241,0.25)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(165,180,252,0.3)",
  },
  timeFilterBadgeText: { color: "#a5b4fc", fontSize: 9, fontWeight: "800" },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  heroStatBlock: { alignItems: "center", flex: 1 },
  heroCircleWrap: { position: "relative", marginBottom: 12 },
  heroCircleBg: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  heroCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  heroPercent: { color: "#fff", fontSize: 22, fontWeight: "900" },
  heroCircleLabel: {
    color: "#475569",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 1,
  },
  heroCountRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  heroCountPresent: { color: "#fff", fontSize: 18, fontWeight: "900" },
  heroCountSep: { color: "#475569", fontSize: 14 },
  heroCountTotal: { color: "#64748b", fontSize: 14, fontWeight: "700" },
  heroCountCaption: {
    color: "#334155",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
  },
  heroVertDivider: {
    width: 1,
    height: 72,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroCTA: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingVertical: 15,
  },
  ctaText: { color: "#475569", fontSize: 11, fontWeight: "600" },
  ctaArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(99,102,241,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  sectionAccent: { flex: 1, height: 1, backgroundColor: "rgba(15,23,42,0.08)" },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionCard: {
    width: "47.5%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    alignItems: "flex-start",
    elevation: 4,
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    position: "relative",
    minHeight: 118,
  },
  actionIconGrad: {
    width: 54,
    height: 54,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 18,
  },
  actionArrow: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  reportsCard: {
    width: "47.5%",
    borderRadius: 22,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#312e81",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    minHeight: 118,
  },
  reportsCardGrad: {
    padding: 16,
    flex: 1,
    minHeight: 118,
    position: "relative",
    overflow: "hidden",
  },
  reportsBlob: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(165,180,252,0.12)",
  },
  reportsCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportsFolderIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "rgba(165,180,252,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(165,180,252,0.25)",
  },
  reportsOpenArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(165,180,252,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportsCardTitle: {
    color: "#e0e7ff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  reportsCardSub: {
    color: "rgba(165,180,252,0.6)",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 10,
  },
  reportsPreviewRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  reportsChip: {
    width: 26,
    height: 26,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  reportsChipLabel: {
    color: "rgba(165,180,252,0.5)",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 2,
  },
  reportsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.68)",
    justifyContent: "flex-end",
  },
  reportsModalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  reportsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reportsModalTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  reportsModalFolderBadge: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  reportsModalTitle: { fontSize: 20, fontWeight: "900", color: "#0f172a" },
  reportsModalSub: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 1,
  },
  reportsModalClose: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  reportsModalDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 24,
  },
  reportsModalGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  reportModalCard: {
    width: (width - 48 - 24) / 3,
    backgroundColor: "#fafafa",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 3,
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: "relative",
  },
  reportModalIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  reportModalCardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 15,
  },
  reportModalArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  reportsModalHint: {
    textAlign: "center",
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 18,
  },
});
