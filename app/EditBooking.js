// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { Picker } from "@react-native-picker/picker";
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     SafeAreaView,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import axios from "../axios";

// export default function EditBooking() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [customers, setCustomers] = useState([]);
//   const [filteredCustomers, setFilteredCustomers] = useState([]);
//   const [showCustomerList, setShowCustomerList] = useState(false);
//   const [searchText, setSearchText] = useState("");

//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     net_selection: "Cricket Nets 1",
//     booking_type: "Day",
//     booking_date: new Date(),
//     end_date: new Date(),
//     start_time: new Date(),
//     end_time: new Date(),
//     amount: "",
//     payment_status: "Pending",
//   });

//   const [pickerMode, setPickerMode] = useState({
//     show: false,
//     type: "date",
//     field: "",
//   });

//   // Time String-ஐ Date Object-ஆக மாற்றும் பங்க்ஷன்
//   const parseTime = (timeStr) => {
//     try {
//       if (!timeStr) return new Date();
//       const [time, modifier] = timeStr.split(" ");
//       let [hours, minutes] = time.split(":");
//       let hh = parseInt(hours, 10);
//       const mm = parseInt(minutes, 10);

//       if (modifier === "PM" && hh < 12) hh += 12;
//       if (modifier === "AM" && hh === 12) hh = 0;

//       const tempDate = new Date();
//       tempDate.setHours(hh, mm, 0, 0);
//       return tempDate;
//     } catch (e) {
//       return new Date();
//     }
//   };

//   useEffect(() => {
//     if (id) fetchAllData();
//   }, [id]);

//   const fetchAllData = async () => {
//     try {
//       // 1. அனைத்து வாடிக்கையாளர்களையும் பெறுதல் (தேடுதலுக்காக)
//       const custRes = await axios.get("/booking/");
//       const allData = custRes.data.data || [];
//       const uniqueCustomers = Array.from(
//         new Set(allData.map((a) => a.phone)),
//       ).map((phone) => allData.find((a) => a.phone === phone));
//       setCustomers(uniqueCustomers);

//       // 2. குறிப்பிட்ட புக்கிங் தரவைப் பெறுதல்
//       const res = await axios.get(`/booking/${id}/`);
//       const d = res.data.data;

//       setForm({
//         name: d.customer_name,
//         phone: d.phone,
//         email: d.email || "",
//         net_selection: d.net_selection,
//         booking_type: d.booking_type || "Day",
//         booking_date: new Date(d.booking_date),
//         end_date: d.end_date ? new Date(d.end_date) : new Date(),
//         start_time: parseTime(d.start_time),
//         end_time: parseTime(d.end_time),
//         amount: d.amount.toString(),
//         payment_status: d.payment_status || "Pending",
//       });
//       setSearchText(d.customer_name);
//     } catch (error) {
//       Alert.alert("Error", "தரவுகளைப் பெறுவதில் சிக்கல்.");
//     } finally {
//       setFetching(false);
//     }
//   };

//   const handleSearch = (text) => {
//     setSearchText(text);
//     setForm({ ...form, name: text });
//     if (text.length > 0) {
//       const filtered = customers.filter((c) => {
//         const nameMatch = (c.customer_name || "")
//           .toLowerCase()
//           .includes(text.toLowerCase());
//         const phoneMatch = (c.phone || "").includes(text);
//         return nameMatch || phoneMatch;
//       });
//       setFilteredCustomers(filtered);
//       setShowCustomerList(true);
//     } else {
//       setShowCustomerList(false);
//     }
//   };

//   const selectCustomer = (customer) => {
//     setForm({
//       ...form,
//       name: customer.customer_name,
//       phone: customer.phone,
//       email: customer.email || "",
//     });
//     setSearchText(customer.customer_name);
//     setShowCustomerList(false);
//   };

//   const formatTime = (date) => {
//     return date.toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const onPickerChange = (event, selectedValue) => {
//     setPickerMode({ ...pickerMode, show: false });
//     if (selectedValue) {
//       setForm({ ...form, [pickerMode.field]: selectedValue });
//     }
//   };

//   const handleUpdate = async () => {
//     // வேலிடேஷன்
//     if (!form.name || !form.phone || !form.amount) {
//       return Alert.alert("Error", "பெயர், போன் மற்றும் கட்டணம் அவசியம்.");
//     }

//     if (form.start_time >= form.end_time) {
//       return Alert.alert(
//         "Time Error",
//         "முடிவு நேரம், ஆரம்ப நேரத்திற்குப் பிறகு இருக்க வேண்டும்.",
//       );
//     }

//     if (form.booking_type === "Month" && form.end_date <= form.booking_date) {
//       return Alert.alert(
//         "Date Error",
//         "முடிவுத் தேதி, ஆரம்பத் தேதிக்குப் பிறகு இருக்க வேண்டும்.",
//       );
//     }

//     setLoading(true);
//     try {
//       const dataToSend = {
//         customer_name: form.name,
//         phone: form.phone,
//         email: form.email,
//         net_selection: form.net_selection,
//         booking_type: form.booking_type,
//         booking_date: form.booking_date.toISOString().split("T")[0],
//         end_date:
//           form.booking_type === "Month"
//             ? form.end_date.toISOString().split("T")[0]
//             : null,
//         start_time: formatTime(form.start_time),
//         end_time: formatTime(form.end_time),
//         amount: form.amount,
//         payment_status: form.payment_status,
//       };

//       await axios.put(`/booking/${id}/`, dataToSend);
//       Alert.alert("Success", "புக்கிங் வெற்றிகரமாக அப்டேட் செய்யப்பட்டது!");
//       router.back();
//     } catch (error) {
//       Alert.alert(
//         "Update Failed",
//         "சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetching)
//     return (
//       <ActivityIndicator size="large" color="#1e3a8a" style={{ flex: 1 }} />
//     );

//   return (
//     <SafeAreaView style={styles.container}>
//       <Stack.Screen
//         options={{ title: "Edit Booking", headerTintColor: "#1e3a8a" }}
//       />
//       <ScrollView
//         contentContainerStyle={{ padding: 20 }}
//         keyboardShouldPersistTaps="handled"
//       >
//         {/* Booking Mode */}
//         <Text style={styles.label}>Booking Mode</Text>
//         <View style={styles.modeContainer}>
//           {["Day", "Month"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeBtn,
//                 form.booking_type === mode && styles.activeModeBtn,
//               ]}
//               onPress={() => setForm({ ...form, booking_type: mode })}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   form.booking_type === mode && styles.activeModeText,
//                 ]}
//               >
//                 {mode === "Day" ? "Day Wise" : "Month Wise"}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Search */}
//         <Text style={styles.label}>Customer Search (Name or Phone)</Text>
//         <View style={styles.inputGroup}>
//           <Ionicons name="search-outline" size={20} color="#64748b" />
//           <TextInput
//             placeholder="Search..."
//             style={styles.input}
//             value={searchText}
//             onChangeText={handleSearch}
//           />
//         </View>

//         {showCustomerList && filteredCustomers.length > 0 && (
//           <View style={styles.searchDropdown}>
//             {filteredCustomers.map((c, i) => (
//               <TouchableOpacity
//                 key={i}
//                 style={styles.searchItem}
//                 onPress={() => selectCustomer(c)}
//               >
//                 <Text style={{ fontWeight: "bold" }}>{c.customer_name}</Text>
//                 <Text style={{ fontSize: 12, color: "#1e3a8a" }}>
//                   {c.phone}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         <View style={styles.row}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.label}>Confirm Phone</Text>
//             <TextInput
//               keyboardType="phone-pad"
//               style={[styles.inputGroup, { paddingLeft: 15 }]}
//               value={form.phone}
//               onChangeText={(v) => setForm({ ...form, phone: v })}
//             />
//           </View>
//           <View style={{ flex: 1.5, marginLeft: 10 }}>
//             <Text style={styles.label}>Email</Text>
//             <TextInput
//               style={[styles.inputGroup, { paddingLeft: 15 }]}
//               value={form.email}
//               onChangeText={(v) => setForm({ ...form, email: v })}
//             />
//           </View>
//         </View>

//         {/* Date Selection */}
//         <Text style={styles.label}>
//           {form.booking_type === "Month" ? "Start Date" : "Booking Date"}
//         </Text>
//         <TouchableOpacity
//           onPress={() =>
//             setPickerMode({ show: true, type: "date", field: "booking_date" })
//           }
//           style={styles.inputGroup}
//         >
//           <Ionicons name="calendar-outline" size={20} color="#1e3a8a" />
//           <Text style={styles.input}>{form.booking_date.toDateString()}</Text>
//         </TouchableOpacity>

//         {form.booking_type === "Month" && (
//           <>
//             <Text style={styles.label}>End Date</Text>
//             <TouchableOpacity
//               onPress={() =>
//                 setPickerMode({ show: true, type: "date", field: "end_date" })
//               }
//               style={styles.inputGroup}
//             >
//               <Ionicons name="calendar" size={20} color="#1e3a8a" />
//               <Text style={styles.input}>{form.end_date.toDateString()}</Text>
//             </TouchableOpacity>
//           </>
//         )}

//         {/* Time Selection */}
//         <Text style={styles.label}>Time Slot</Text>
//         <View style={styles.row}>
//           <TouchableOpacity
//             onPress={() =>
//               setPickerMode({ show: true, type: "time", field: "start_time" })
//             }
//             style={[styles.inputGroup, { flex: 1 }]}
//           >
//             <Ionicons name="time-outline" size={20} color="#1e3a8a" />
//             <Text style={styles.input}>{formatTime(form.start_time)}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() =>
//               setPickerMode({ show: true, type: "time", field: "end_time" })
//             }
//             style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}
//           >
//             <Text style={styles.input}>{formatTime(form.end_time)}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Court & Amount */}
//         <Text style={styles.label}>Court Selection</Text>
//         <View style={styles.pickerWrapper}>
//           <Picker
//             selectedValue={form.net_selection}
//             onValueChange={(v) => setForm({ ...form, net_selection: v })}
//           >
//             {[
//               "Cricket Nets 1",
//               "Cricket Nets 2",
//               "Cricket Nets 3",
//               "Box Cricket 1",
//               "Box Cricket 2",
//             ].map((n) => (
//               <Picker.Item key={n} label={n} value={n} />
//             ))}
//           </Picker>
//         </View>

//         <Text style={styles.label}>Amount (OMR)</Text>
//         <View style={styles.inputGroup}>
//           <Text style={styles.currencyText}>OMR</Text>
//           <TextInput
//             keyboardType="numeric"
//             style={styles.input}
//             value={form.amount}
//             onChangeText={(v) => setForm({ ...form, amount: v })}
//           />
//         </View>

//         <Text style={styles.label}>Status</Text>
//         <View style={styles.pickerWrapper}>
//           <Picker
//             selectedValue={form.payment_status}
//             onValueChange={(v) => setForm({ ...form, payment_status: v })}
//           >
//             <Picker.Item label="Pending" value="Pending" color="#ef4444" />
//             <Picker.Item label="Collected" value="Collected" color="#059669" />
//           </Picker>
//         </View>

//         {pickerMode.show && (
//           <DateTimePicker
//             value={form[pickerMode.field] || new Date()}
//             mode={pickerMode.type}
//             onChange={onPickerChange}
//           />
//         )}

//         <TouchableOpacity
//           style={styles.saveBtn}
//           onPress={handleUpdate}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.saveText}>Update Booking</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   label: {
//     fontSize: 13,
//     fontWeight: "bold",
//     color: "#1e3a8a",
//     marginTop: 15,
//     marginBottom: 5,
//   },
//   modeContainer: { flexDirection: "row", gap: 10, marginBottom: 5 },
//   modeBtn: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     alignItems: "center",
//   },
//   activeModeBtn: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
//   modeText: { color: "#64748b", fontWeight: "600" },
//   activeModeText: { color: "#fff" },
//   inputGroup: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f8fafc",
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     height: 55,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   input: { flex: 1, marginLeft: 8, fontSize: 15, color: "#1e293b" },
//   row: { flexDirection: "row" },
//   currencyText: { fontWeight: "bold", color: "#1e3a8a", marginRight: 5 },
//   searchDropdown: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#cbd5e1",
//     marginTop: -8,
//     marginBottom: 10,
//     elevation: 4,
//     zIndex: 1000,
//   },
//   searchItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f5f9",
//   },
//   pickerWrapper: {
//     backgroundColor: "#f8fafc",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     marginBottom: 10,
//     overflow: "hidden",
//   },
//   saveBtn: {
//     backgroundColor: "#1e3a8a",
//     height: 60,
//     borderRadius: 15,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 25,
//     marginBottom: 30,
//   },
//   saveText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
// });
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import axios from "../axios";

// ✅ Web Date/Time Picker Modal
const WebDatePickerModal = ({ visible, mode, value, onClose, onSelect }) => {
  if (!visible) return null;
  const formatted =
    mode === "date"
      ? value.toISOString().split("T")[0]
      : `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={webStyles.overlay}>
        <View style={webStyles.box}>
          <Text style={webStyles.title}>
            {mode === "date" ? "📅 Select Date" : "⏰ Select Time"}
          </Text>
          <input
            type={mode === "date" ? "date" : "time"}
            defaultValue={formatted}
            onChange={(e) => {
              if (!e.target.value) return;
              if (mode === "date") {
                const [y, m, d] = e.target.value.split("-");
                onSelect(new Date(y, m - 1, d));
              } else {
                const [h, min] = e.target.value.split(":");
                const d = new Date(value);
                d.setHours(parseInt(h));
                d.setMinutes(parseInt(min));
                onSelect(d);
              }
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

// ✅ Custom Select Modal
const CustomSelectModal = ({
  visible,
  options,
  selectedValue,
  onSelect,
  onClose,
  title,
}) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={webStyles.overlay}>
        <View style={selectStyles.box}>
          <View style={selectStyles.header}>
            <Text style={selectStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={26} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((opt) => {
              const isSelected = opt.value === selectedValue;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    selectStyles.option,
                    isSelected && selectStyles.selectedOption,
                  ]}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      selectStyles.optionText,
                      isSelected && selectStyles.selectedText,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1e3a8a"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const NET_OPTIONS = [
  { label: "🏏 Cricket Nets 1", value: "Cricket Nets 1" },
  { label: "🏏 Cricket Nets 2", value: "Cricket Nets 2" },
  { label: "🏏 Cricket Nets 3", value: "Cricket Nets 3" },
  { label: "🏏 Cricket Nets 4", value: "Cricket Nets 4" },
  { label: "🏏 Cricket Nets 5", value: "Cricket Nets 5" },
  { label: "🏏 Cricket Nets 6", value: "Cricket Nets 6" },
  { label: "📦 Box Cricket 1", value: "Box Cricket 1" },
  { label: "📦 Box Cricket 2", value: "Box Cricket 2" },
];

const PAYMENT_OPTIONS = [
  { label: "⏳ Pending", value: "Pending" },
  { label: "✅ Collected", value: "Collected" },
];

export default function EditBooking() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showNetPicker, setShowNetPicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    net_selection: "Cricket Nets 1",
    booking_type: "Day",
    booking_date: new Date(),
    end_date: new Date(),
    start_time: new Date(),
    end_time: new Date(),
    amount: "",
    payment_status: "Pending",
  });

  const [pickerMode, setPickerMode] = useState({
    show: false,
    type: "date",
    field: "",
  });
  const [tempDate, setTempDate] = useState(new Date());
  const [showWebPicker, setShowWebPicker] = useState(false);
  const [webPickerMode, setWebPickerMode] = useState({
    type: "date",
    field: "",
  });

  const parseTime = (timeStr) => {
    try {
      if (!timeStr) return new Date();
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");
      let hh = parseInt(hours, 10);
      const mm = parseInt(minutes, 10);
      if (modifier === "PM" && hh < 12) hh += 12;
      if (modifier === "AM" && hh === 12) hh = 0;
      const d = new Date();
      d.setHours(hh, mm, 0, 0);
      return d;
    } catch (e) {
      return new Date();
    }
  };

  useEffect(() => {
    if (id) fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      const custRes = await axios.get("/booking/");
      const allData = custRes.data.data || [];
      const uniqueCustomers = Array.from(
        new Set(allData.map((a) => a.phone)),
      ).map((phone) => allData.find((a) => a.phone === phone));
      setCustomers(uniqueCustomers);

      const res = await axios.get(`/booking/${id}/`);
      const d = res.data.data;

      setForm({
        name: d.customer_name,
        phone: d.phone,
        email: d.email || "",
        net_selection: d.net_selection,
        booking_type: d.booking_type || "Day",
        booking_date: new Date(d.booking_date),
        end_date: d.end_date ? new Date(d.end_date) : new Date(),
        start_time: parseTime(d.start_time),
        end_time: parseTime(d.end_time),
        amount: d.amount.toString(),
        payment_status: d.payment_status || "Pending",
      });
      setSearchText(d.customer_name);
    } catch (error) {
      Alert.alert("Error", "தரவுகளைப் பெறுவதில் சிக்கல்.");
    } finally {
      setFetching(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setForm({ ...form, name: text });
    if (text.length > 0) {
      const filtered = customers.filter((c) => {
        const nameMatch = (c.customer_name || "")
          .toLowerCase()
          .includes(text.toLowerCase());
        const phoneMatch = (c.phone || "").includes(text);
        return nameMatch || phoneMatch;
      });
      setFilteredCustomers(filtered);
      setShowCustomerList(true);
    } else {
      setShowCustomerList(false);
    }
  };

  const selectCustomer = (customer) => {
    setForm({
      ...form,
      name: customer.customer_name,
      phone: customer.phone,
      email: customer.email || "",
    });
    setSearchText(customer.customer_name);
    setShowCustomerList(false);
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const openPicker = (field, type) => {
    if (Platform.OS === "web") {
      setWebPickerMode({ type, field });
      setShowWebPicker(true);
    } else {
      setTempDate(form[field] || new Date());
      setPickerMode({ show: true, type, field });
    }
  };

  const onPickerChange = (event, selectedValue) => {
    if (Platform.OS === "android") {
      setPickerMode({ ...pickerMode, show: false });
      if (selectedValue)
        setForm({ ...form, [pickerMode.field]: selectedValue });
    } else {
      if (selectedValue) setTempDate(selectedValue);
    }
  };

  const confirmIOSDate = () => {
    setForm({ ...form, [pickerMode.field]: tempDate });
    setPickerMode({ ...pickerMode, show: false });
  };

  const handleUpdate = async () => {
    if (!form.name || !form.phone || !form.amount)
      return Alert.alert("Error", "பெயர், போன் மற்றும் கட்டணம் அவசியம்.");
    setLoading(true);
    try {
      const dataToSend = {
        customer_name: form.name,
        phone: form.phone,
        email: form.email,
        net_selection: form.net_selection,
        booking_type: form.booking_type,
        booking_date: form.booking_date.toISOString().split("T")[0],
        end_date:
          form.booking_type === "Month"
            ? form.end_date.toISOString().split("T")[0]
            : null,
        start_time: formatTime(form.start_time),
        end_time: formatTime(form.end_time),
        amount: form.amount,
        payment_status: form.payment_status,
      };
      await axios.put(`/booking/${id}/`, dataToSend);
      Alert.alert("Success", "புக்கிங் வெற்றிகரமாக அப்டேட் செய்யப்பட்டது!");
      router.back();
    } catch (error) {
      Alert.alert("Update Failed", "சேமிக்க முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f4ff",
        }}
      >
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 12, color: "#64748b", fontWeight: "600" }}>
          Loading booking...
        </Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ Web Date/Time Picker */}
      <WebDatePickerModal
        visible={showWebPicker}
        mode={webPickerMode.type}
        value={form[webPickerMode.field] || new Date()}
        onClose={() => setShowWebPicker(false)}
        onSelect={(date) => {
          setForm({ ...form, [webPickerMode.field]: date });
          setShowWebPicker(false);
        }}
      />

      {/* ✅ Net Select Modal */}
      <CustomSelectModal
        visible={showNetPicker}
        title="Select Court / Net"
        options={NET_OPTIONS}
        selectedValue={form.net_selection}
        onSelect={(v) => setForm({ ...form, net_selection: v })}
        onClose={() => setShowNetPicker(false)}
      />

      {/* ✅ Payment Select Modal */}
      <CustomSelectModal
        visible={showPaymentPicker}
        title="Payment Status"
        options={PAYMENT_OPTIONS}
        selectedValue={form.payment_status}
        onSelect={(v) => setForm({ ...form, payment_status: v })}
        onClose={() => setShowPaymentPicker(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Booking</Text>
        <View style={styles.editBadge}>
          <Ionicons name="create-outline" size={16} color="#fff" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Mode */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar" size={15} color="#1e3a8a" /> Booking Mode
          </Text>
          <View style={styles.modeContainer}>
            {["Day", "Month"].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modeBtn,
                  form.booking_type === m && styles.activeModeBtn,
                ]}
                onPress={() => setForm({ ...form, booking_type: m })}
              >
                <Ionicons
                  name={m === "Day" ? "sunny-outline" : "calendar-outline"}
                  size={18}
                  color={form.booking_type === m ? "#fff" : "#64748b"}
                />
                <Text
                  style={[
                    styles.modeText,
                    form.booking_type === m && styles.activeModeText,
                  ]}
                >
                  {m} Wise
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person" size={15} color="#1e3a8a" /> Customer
            Details
          </Text>

          <View style={styles.inputGroup}>
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search by name or phone..."
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>

          {showCustomerList && filteredCustomers.length > 0 && (
            <View style={styles.searchDropdown}>
              {filteredCustomers.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.searchItem}
                  onPress={() => selectCustomer(c)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.searchAvatar}>
                      <Text style={styles.searchAvatarText}>
                        {(c.customer_name || "?").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.searchTextName}>
                        {c.customer_name}
                      </Text>
                      <Text style={styles.searchTextPhone}>{c.phone}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#cbd5e1"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Phone *</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="call-outline" size={16} color="#94a3b8" />
                <TextInput
                  placeholder="Phone number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(v) => setForm({ ...form, phone: v })}
                />
              </View>
            </View>
            <View style={{ flex: 1.4, marginLeft: 10 }}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={16} color="#94a3b8" />
                <TextInput
                  placeholder="Email (optional)"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  style={styles.input}
                  value={form.email}
                  onChangeText={(v) => setForm({ ...form, email: v })}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar-outline" size={15} color="#1e3a8a" /> Date
            & Time
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>
                {form.booking_type === "Month" ? "Start Date" : "Booking Date"}
              </Text>
              <TouchableOpacity
                onPress={() => openPicker("booking_date", "date")}
                style={styles.dateBtn}
              >
                <Ionicons name="calendar-outline" size={16} color="#1e3a8a" />
                <Text style={styles.dateBtnText}>
                  {formatDate(form.booking_date)}
                </Text>
              </TouchableOpacity>
            </View>
            {form.booking_type === "Month" && (
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.fieldLabel}>End Date</Text>
                <TouchableOpacity
                  onPress={() => openPicker("end_date", "date")}
                  style={styles.dateBtn}
                >
                  <Ionicons name="calendar" size={16} color="#f59e0b" />
                  <Text style={styles.dateBtnText}>
                    {formatDate(form.end_date)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.fieldLabel}>Time Slot</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => openPicker("start_time", "time")}
              style={[styles.dateBtn, { flex: 1 }]}
            >
              <Ionicons name="time-outline" size={16} color="#059669" />
              <Text style={styles.dateBtnText}>
                {formatTime(form.start_time)}
              </Text>
            </TouchableOpacity>
            <View style={styles.timeDivider}>
              <Text style={styles.timeDividerText}>→</Text>
            </View>
            <TouchableOpacity
              onPress={() => openPicker("end_time", "time")}
              style={[styles.dateBtn, { flex: 1 }]}
            >
              <Ionicons name="time" size={16} color="#ef4444" />
              <Text style={styles.dateBtnText}>
                {formatTime(form.end_time)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Court & Payment */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="grid-outline" size={15} color="#1e3a8a" /> Court &
            Payment
          </Text>

          <Text style={styles.fieldLabel}>Court / Net Selection</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowNetPicker(true)}
          >
            <Ionicons name="baseball-outline" size={18} color="#1e3a8a" />
            <Text style={styles.selectBtnText}>{form.net_selection}</Text>
            <Ionicons name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>Amount (OMR) *</Text>
          <View style={styles.amountGroup}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>OMR</Text>
            </View>
            <TextInput
              placeholder="0.000"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              style={styles.amountInput}
              value={form.amount}
              onChangeText={(v) => setForm({ ...form, amount: v })}
            />
          </View>

          <Text style={styles.fieldLabel}>Payment Status</Text>
          <TouchableOpacity
            style={[
              styles.selectBtn,
              {
                backgroundColor:
                  form.payment_status === "Collected" ? "#f0fdf4" : "#fff5f5",
                borderColor:
                  form.payment_status === "Collected" ? "#bbf7d0" : "#fecaca",
              },
            ]}
            onPress={() => setShowPaymentPicker(true)}
          >
            <Ionicons
              name={
                form.payment_status === "Collected"
                  ? "checkmark-circle"
                  : "time-outline"
              }
              size={18}
              color={
                form.payment_status === "Collected" ? "#059669" : "#ef4444"
              }
            />
            <Text
              style={[
                styles.selectBtnText,
                {
                  color:
                    form.payment_status === "Collected" ? "#059669" : "#ef4444",
                },
              ]}
            >
              {form.payment_status}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={22} color="#fff" />
              <Text style={styles.saveText}>Update Booking</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ iOS Picker */}
      {Platform.OS === "ios" && (
        <Modal visible={pickerMode.show} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setPickerMode({ ...pickerMode, show: false })}
                >
                  <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{ fontWeight: "bold", color: "#1e3a8a", fontSize: 15 }}
                >
                  {pickerMode.type === "date" ? "Select Date" : "Select Time"}
                </Text>
                <TouchableOpacity onPress={confirmIOSDate}>
                  <Text style={{ color: "#1e3a8a", fontWeight: "bold" }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={pickerMode.type}
                display="spinner"
                onChange={onPickerChange}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* ✅ Android Picker */}
      {Platform.OS === "android" && pickerMode.show && (
        <DateTimePicker
          value={form[pickerMode.field] || new Date()}
          mode={pickerMode.type}
          display="default"
          onChange={onPickerChange}
        />
      )}
    </SafeAreaView>
  );
}

// Web picker styles
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

const selectStyles = StyleSheet.create({
  box: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: 420,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#f8fafc",
  },
  selectedOption: {
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  optionText: { fontSize: 15, color: "#475569", fontWeight: "500" },
  selectedText: { color: "#1e3a8a", fontWeight: "700" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: Platform.OS === "ios" ? 20 : 55,
    paddingBottom: 22,
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  editBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
  },
  scrollContent: { padding: 16, paddingBottom: 50 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e3a8a",
    marginBottom: 14,
  },
  modeContainer: { flexDirection: "row", gap: 10 },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  activeModeBtn: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  modeText: { color: "#64748b", fontWeight: "700", fontSize: 14 },
  activeModeText: { color: "#fff" },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 6,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: "#1e293b" },
  row: { flexDirection: "row", alignItems: "flex-end" },
  searchDropdown: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
    elevation: 6,
    overflow: "hidden",
  },
  searchItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  searchAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  searchAvatarText: { color: "#1e3a8a", fontWeight: "bold", fontSize: 16 },
  searchTextName: { fontWeight: "700", color: "#1e293b", fontSize: 14 },
  searchTextPhone: { fontSize: 12, color: "#64748b", marginTop: 2 },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0f7ff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  dateBtnText: { flex: 1, fontSize: 14, color: "#1e3a8a", fontWeight: "600" },
  timeDivider: { paddingHorizontal: 8, paddingBottom: 2 },
  timeDividerText: { fontSize: 18, color: "#94a3b8" },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 4,
  },
  selectBtnText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  amountGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    marginBottom: 4,
  },
  currencyBadge: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  currencyText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  amountInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#059669",
    height: 58,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  saveText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
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
});
