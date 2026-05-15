import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "../axios";

// ─────────────────────────────────────────────────────────────
// Alert helper
// ─────────────────────────────────────────────────────────────
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ─────────────────────────────────────────────────────────────
// Image compress + resize
// ஏன்?: Oman network-ல large base64 string timeout ஆகுது
// இந்த function photo-ஐ 800px, quality 0.6-ஆ compress பண்ணும்
// Result: 5MB photo → ~150KB → Oman-லயும் fast upload ஆகும்
// ─────────────────────────────────────────────────────────────
const compressImage = (uri, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");

    img.onload = () => {
      // Aspect ratio maintain பண்ணி resize
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Compressed base64 string
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = uri;
  });
};

// ─────────────────────────────────────────────────────────────
// URI → Base64 convert (iOS native - no canvas needed)
// ─────────────────────────────────────────────────────────────
const uriToBase64 = (uri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = () => reject(new Error("XHR failed"));
    xhr.open("GET", uri);
    xhr.responseType = "blob";
    xhr.send();
  });
};

// ─────────────────────────────────────────────────────────────
// Main image append function
//
// Android  → Native multipart file   (fastest, no conversion)
// Web      → Canvas compress + blob  (India Netlify Chrome/Safari)
// iOS      → Compress + base64       (Oman Safari FIX ✅)
// ─────────────────────────────────────────────────────────────
const appendImageToFormData = async (formData, imageUri, filename) => {
  // ── Android ──────────────────────────────────────────────
  if (Platform.OS === "android") {
    formData.append("photo", {
      uri: imageUri,
      name: filename,
      type: "image/jpeg",
    });
    return;
  }

  // ── Web (Chrome, Firefox, Edge, Safari on Mac) ────────────
  if (Platform.OS === "web") {
    try {
      // Canvas-ல compress பண்ணி blob-ஆ அனுப்பு
      const compressedBase64 = await compressImage(imageUri, 800, 0.6);

      // base64 → blob convert
      const response = await fetch(compressedBase64);
      const blob = await response.blob();

      // Direct blob upload — request.FILES-ல வரும்
      formData.append("photo", blob, filename);
    } catch (webErr) {
      console.warn("[Web] Compress failed, using raw blob:", webErr);
      try {
        const res = await fetch(imageUri);
        const blob = await res.blob();
        formData.append("photo", blob, filename);
      } catch (fallbackErr) {
        console.error("[Web] All methods failed:", fallbackErr);
        throw fallbackErr;
      }
    }
    return;
  }

  // ── iOS Safari (Oman + எல்லா country) ────────────────────
  // iOS Safari blob URI direct upload பண்ண மாட்டாது
  // Canvas compress + base64 string-ஆ அனுப்புறோம்
  // Compressed ஆனதால் Oman slow network-லயும் fast upload ஆகும்
  try {
    // Step 1: Raw URI → base64
    const rawBase64 = await uriToBase64(imageUri);

    // Step 2: Canvas-ல compress (800px, 60% quality → ~150KB)
    const compressedBase64 = await compressImage(rawBase64, 800, 0.6);

    // Step 3: Compressed base64 → backend
    formData.append("photo_base64", compressedBase64);
    formData.append("photo_filename", filename);
  } catch (iosErr) {
    console.warn("[iOS] Canvas compress failed, trying raw base64:", iosErr);
    try {
      // Fallback: compress இல்லாம raw base64
      const rawBase64 = await uriToBase64(imageUri);
      formData.append("photo_base64", rawBase64);
      formData.append("photo_filename", filename);
    } catch (fallbackErr) {
      console.error("[iOS] All methods failed:", fallbackErr);
      throw fallbackErr;
    }
  }
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function EditStudent() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [image, setImage] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    mobilenumber: "",
    age: "",
    address: "",
    normal_fees: "",
    special_fees: "",
  });

  useEffect(() => {
    if (id) fetchStudentDetails();
  }, [id]);

  // ── Fetch student ─────────────────────────────────────────
  const fetchStudentDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`student/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data || response.data;

      setFormData({
        studentName: data.studentName || "",
        parentName: data.parentName || "",
        mobilenumber: data.mobilenumber || "",
        normal_fees: data.normal_fees?.toString() || "",
        special_fees: data.special_fees?.toString() || "",
        age: data.age?.toString() || "",
        address: data.address || "",
      });

      if (data.photo) setImage(data.photo);

      let classes = [];
      if (data.classType === 1) classes = ["Normal"];
      else if (data.classType === 2) classes = ["Special"];
      else if (data.classType === 3) classes = ["Normal", "Special"];
      setSelectedClasses(classes);
    } catch (error) {
      console.error("Fetch error:", error?.response?.data || error.message);
      showAlert("Error", "Failed to load student details.");
    } finally {
      setFetching(false);
    }
  };

  // ── Class toggle ──────────────────────────────────────────
  const toggleClass = (type) => {
    if (selectedClasses.includes(type)) {
      if (selectedClasses.length > 1) {
        setSelectedClasses(selectedClasses.filter((c) => c !== type));
      } else {
        showAlert("Notice", "At least one class must be selected.");
      }
    } else {
      setSelectedClasses([...selectedClasses, type]);
    }
  };

  // ── Pick image ────────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8, // Expo-level quality (canvas-ல மேலும் compress ஆகும்)
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ── Submit ────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!formData.studentName.trim()) {
      showAlert("Validation", "Student name is required.");
      return;
    }
    if (selectedClasses.length === 0) {
      showAlert("Validation", "Please select at least one class.");
      return;
    }
    if (selectedClasses.includes("Normal") && !formData.normal_fees.trim()) {
      showAlert("Validation", "Please enter Normal class fees.");
      return;
    }
    if (selectedClasses.includes("Special") && !formData.special_fees.trim()) {
      showAlert("Validation", "Please enter Special class fees.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const data = new FormData();

      data.append("studentName", formData.studentName);
      data.append("parentName", formData.parentName);
      data.append("mobilenumber", formData.mobilenumber);
      data.append("age", formData.age);
      data.append("address", formData.address);
      data.append("normal_fees", formData.normal_fees);
      data.append("special_fees", formData.special_fees);

      let finalClassId = 1;
      if (
        selectedClasses.includes("Normal") &&
        selectedClasses.includes("Special")
      ) {
        finalClassId = 3;
      } else if (selectedClasses.includes("Special")) {
        finalClassId = 2;
      }
      data.append("classType", finalClassId);

      // Photo — புது image மட்டும் upload பண்ணு
      if (image && !image.startsWith("http")) {
        const filename = `photo_${Date.now()}.jpg`;
        await appendImageToFormData(data, image, filename);
      }

      await axios.put(`student/${id}/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        // Oman slow network-க்கு timeout கூட்டுறோம்
        timeout: 60000, // 60 seconds
      });

      showAlert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Update error:", error?.response?.data || error.message);
      if (error.code === "ECONNABORTED") {
        showAlert(
          "Error",
          "Upload timed out. Please try with a smaller photo.",
        );
      } else {
        showAlert("Error", "Update failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Loader ────────────────────────────────────────────────
  if (fetching) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  // ── UI ────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Student Details</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollArea}
      >
        {/* Photo */}
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.photoCircle}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={32} color="#1e3a8a" />
                <Text style={styles.photoText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

        {/* Class type */}
        <Text style={styles.sectionLabel}>Update Enrollment Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            onPress={() => toggleClass("Normal")}
            style={[
              styles.typeBtn,
              selectedClasses.includes("Normal") && styles.activeNormal,
            ]}
          >
            <Ionicons
              name={
                selectedClasses.includes("Normal")
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={20}
              color={selectedClasses.includes("Normal") ? "#fff" : "#10b981"}
            />
            <Text
              style={[
                styles.typeBtnText,
                selectedClasses.includes("Normal") && styles.activeText,
              ]}
            >
              Normal Class
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleClass("Special")}
            style={[
              styles.typeBtn,
              selectedClasses.includes("Special") && styles.activeSpecial,
            ]}
          >
            <Ionicons
              name={
                selectedClasses.includes("Special")
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={20}
              color={selectedClasses.includes("Special") ? "#fff" : "#1e3a8a"}
            />
            <Text
              style={[
                styles.typeBtnText,
                selectedClasses.includes("Special") && styles.activeText,
              ]}
            >
              Special Class
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Student Full Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              value={formData.studentName}
              onChangeText={(t) => setFormData({ ...formData, studentName: t })}
              placeholder="Student full name"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.row}>
            {selectedClasses.includes("Normal") && (
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>
                  Normal Fees <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    keyboardType="numeric"
                    style={styles.input}
                    value={formData.normal_fees}
                    onChangeText={(t) =>
                      setFormData({ ...formData, normal_fees: t })
                    }
                    placeholder="0.000"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            )}
            {selectedClasses.includes("Special") && (
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Spl Fees <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    keyboardType="numeric"
                    style={styles.input}
                    value={formData.special_fees}
                    onChangeText={(t) =>
                      setFormData({ ...formData, special_fees: t })
                    }
                    placeholder="0.000"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.inputBox}>
                <TextInput
                  keyboardType="numeric"
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(t) => setFormData({ ...formData, age: t })}
                  placeholder="Age"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  keyboardType="numeric"
                  maxLength={10}
                  style={styles.input}
                  value={formData.mobilenumber}
                  onChangeText={(t) =>
                    setFormData({ ...formData, mobilenumber: t })
                  }
                  placeholder="10 digits"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Parent Name</Text>
          <View style={styles.inputBox}>
            <Ionicons name="people-outline" size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              value={formData.parentName}
              onChangeText={(t) => setFormData({ ...formData, parentName: t })}
              placeholder="Father/Mother name"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Address</Text>
          <View
            style={[
              styles.inputBox,
              { height: 80, alignItems: "flex-start", paddingTop: 10 },
            ]}
          >
            <TextInput
              style={styles.input}
              multiline
              value={formData.address}
              onChangeText={(t) => setFormData({ ...formData, address: t })}
              placeholder="City, Area"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleUpdate}
          style={styles.saveBtn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveText}>Save Changes</Text>
              <Ionicons name="save-outline" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: { backgroundColor: "#fff", padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  scrollArea: { padding: 20 },
  photoContainer: { alignItems: "center", marginBottom: 20 },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#1e3a8a",
  },
  selectedImage: { width: "100%", height: "100%" },
  photoPlaceholder: { alignItems: "center" },
  photoText: { fontSize: 10, color: "#1e3a8a", fontWeight: "bold" },
  photoHint: { fontSize: 11, color: "#64748b", marginTop: 8 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 15,
  },
  typeRow: { flexDirection: "row", gap: 12, marginBottom: 25 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  activeNormal: { backgroundColor: "#10b981", borderColor: "#10b981" },
  activeSpecial: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  activeText: { color: "#fff" },
  typeBtnText: { fontWeight: "bold", color: "#64748b" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginTop: 15,
    marginBottom: 8,
  },
  required: { color: "#ef4444" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
    gap: 10,
    ...(Platform.OS === "web" ? { cursor: "text" } : {}),
  },
  input: {
    flex: 1,
    color: "#1e293b",
    fontWeight: "600",
    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none",
          outlineWidth: 0,
          borderWidth: 0,
          backgroundColor: "transparent",
          fontSize: 15,
        }
      : {}),
  },
  row: { flexDirection: "row" },
  saveBtn: {
    backgroundColor: "#1e3a8a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: 30,
    gap: 10,
    marginBottom: 20,
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
