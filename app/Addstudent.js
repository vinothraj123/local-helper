import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Contacts from "expo-contacts";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
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
import KeyboardWrapper from "./KeyboardWrapper";

// ✅ Web-safe TextInput wrapper
const WebInput = ({ style, ...props }) => {
  if (Platform.OS === "web") {
    return (
      <TextInput
        {...props}
        style={[style, { outlineStyle: "none", cursor: "text" }]}
      />
    );
  }
  return <TextInput {...props} style={style} />;
};

// ✅ Web-safe Alert helper
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ✅ URI to Blob converter - Web மட்டும் use பண்ணும்
const uriToBlob = async (uri) => {
  const response = await fetch(uri);
  return await response.blob();
};

// ✅ Image append - எந்த country SIM-லயும், iOS Safari-லயும் work ஆகும்
const appendImageToFormData = async (formData, image, filename) => {
  if (Platform.OS === "web") {
    // Web மட்டும் blob use பண்ணும்
    const blob = await uriToBlob(image);
    formData.append("photo", blob, filename);
  } else {
    // iOS & Android - native method directly
    // Network தேவையே இல்ல, எந்த carrier-லயும் work ஆகும்
    formData.append("photo", {
      uri: image,
      name: filename,
      type: "image/jpeg",
    });
  }
};

export default function AddStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const [selectedClasses, setSelectedClasses] = useState(["Normal", "Special"]);

  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    mobilenumber: "",
    age: "",
    address: "",
    normal_fees: "",
    special_fees: "",
    dateOfJoining: new Date().toISOString().split("T")[0],
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const toggleClass = (type) => {
    if (selectedClasses.includes(type)) {
      if (selectedClasses.length > 1) {
        setSelectedClasses(selectedClasses.filter((item) => item !== type));
      }
    } else {
      setSelectedClasses([...selectedClasses, type]);
    }
  };

  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const contact = await Contacts.presentContactPickerAsync();
      if (contact) {
        const rawNumber = contact.phoneNumbers?.[0]?.number || "";
        const cleanNumber = rawNumber.replace(/\D/g, "").slice(-10);
        setFormData({
          ...formData,
          parentName: contact.name,
          mobilenumber: cleanNumber,
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.studentName) {
      showAlert("Missing Fields", "Please fill required details.");
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
      data.append("dateOfJoining", formData.dateOfJoining);
      data.append("normal_fees", formData.normal_fees);
      data.append("special_fees", formData.special_fees);
      data.append("classType", JSON.stringify(selectedClasses));

      // ✅ Clean - duplicate இல்ல, எந்த நாட்டிலயும் work ஆகும்
      if (image && !image.startsWith("http")) {
        const filename = `photo_${Date.now()}.jpg`;
        await appendImageToFormData(data, image, filename);
      }

      const response = await axios.post("student/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        showAlert("Success", "Enrollment Confirmed!");
        router.back();
      }
    } catch (error) {
      showAlert("Error", "Backend connectivity issue.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Shared UI content - duplicate JSX தவிர்க்க
  const formContent = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.photoContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.photoCircle}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.selectedImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={35} color="#1e3a8a" />
              <Text style={styles.photoText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Enrollment Type (Can select both)</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          onPress={() => toggleClass("Normal")}
          style={[
            styles.typeBtn,
            selectedClasses.includes("Normal") && styles.activeBtn,
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
              selectedClasses.includes("Normal") && styles.activeTypeText,
            ]}
          >
            Normal Class
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleClass("Special")}
          style={[
            styles.typeBtn,
            selectedClasses.includes("Special") && styles.activeBtn,
          ]}
        >
          <Ionicons
            name={
              selectedClasses.includes("Special")
                ? "checkmark-circle"
                : "ellipse-outline"
            }
            size={20}
            color={selectedClasses.includes("Special") ? "#fff" : "#10b981"}
          />
          <Text
            style={[
              styles.typeBtnText,
              selectedClasses.includes("Special") && styles.activeTypeText,
            ]}
          >
            Special Class
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.inputLabel}>Student Full Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#94a3b8"
            style={styles.icon}
          />
          <WebInput
            placeholder="Ex: Rahul Kumar"
            style={styles.input}
            value={formData.studentName}
            onChangeText={(t) => setFormData({ ...formData, studentName: t })}
          />
        </View>

        <View style={styles.row}>
          {selectedClasses.includes("Normal") && (
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Normal Fees (OMR)</Text>
              <View style={styles.inputContainer}>
                <WebInput
                  keyboardType="numeric"
                  placeholder="0.000"
                  style={styles.input}
                  value={formData.normal_fees}
                  onChangeText={(t) =>
                    setFormData({ ...formData, normal_fees: t })
                  }
                />
              </View>
            </View>
          )}
          {selectedClasses.includes("Special") && (
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Spl Fees (OMR)</Text>
              <View style={styles.inputContainer}>
                <WebInput
                  keyboardType="numeric"
                  placeholder="0.000"
                  style={styles.input}
                  value={formData.special_fees}
                  onChangeText={(t) =>
                    setFormData({ ...formData, special_fees: t })
                  }
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.inputLabel}>Age</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Age"
                keyboardType="numeric"
                style={styles.input}
                value={formData.age}
                onChangeText={(t) => setFormData({ ...formData, age: t })}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Parent Contact</Text>
            <TouchableOpacity onPress={pickContact} style={styles.importBtn}>
              <Ionicons name="call-outline" size={18} color="#1e3a8a" />
              <Text style={styles.importText}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.inputLabel}>Parent Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="people-outline"
            size={20}
            color="#94a3b8"
            style={styles.icon}
          />
          <TextInput
            placeholder="Father/Mother Name"
            style={styles.input}
            value={formData.parentName}
            onChangeText={(t) => setFormData({ ...formData, parentName: t })}
          />
        </View>

        <Text style={styles.inputLabel}>Mobile Number</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="phone-portrait-outline"
            size={20}
            color="#94a3b8"
            style={styles.icon}
          />
          <TextInput
            placeholder="10 Digit Number"
            keyboardType="numeric"
            style={styles.input}
            value={formData.mobilenumber}
            onChangeText={(t) => setFormData({ ...formData, mobilenumber: t })}
          />
        </View>

        <Text style={styles.inputLabel}>Address</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#94a3b8"
            style={styles.icon}
          />
          <TextInput
            placeholder="City, Area"
            multiline
            style={styles.input}
            value={formData.address}
            onChangeText={(t) => setFormData({ ...formData, address: t })}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        style={styles.submitBtn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.submitText}>Confirm Enrollment</Text>
            <Ionicons name="checkmark-done-outline" size={22} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return Platform.OS === "web" ? (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Admission</Text>
          <View style={{ width: 45 }} />
        </View>
        {formContent}
      </View>
    </View>
  ) : (
    <KeyboardWrapper>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Admission</Text>
          <View style={{ width: 45 }} />
        </View>
        {formContent}
      </View>
    </KeyboardWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: { backgroundColor: "#fff", padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  scrollContent: { padding: 20 },
  photoContainer: { alignItems: "center", marginBottom: 20 },
  photoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#1e3a8a",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoPlaceholder: { alignItems: "center" },
  photoText: {
    fontSize: 10,
    color: "#1e3a8a",
    fontWeight: "bold",
    marginTop: 4,
  },
  selectedImage: { width: "100%", height: "100%" },
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
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  activeBtn: { backgroundColor: "#10b981", borderColor: "#10b981" },
  typeBtnText: { fontWeight: "bold", color: "#64748b" },
  activeTypeText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginTop: 15,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
    ...(Platform.OS === "web" ? { cursor: "text" } : {}),
  },
  textAreaContainer: { height: 80, alignItems: "flex-start", paddingTop: 12 },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: "#1e293b",
    fontWeight: "500",
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
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1e3a8a",
    borderStyle: "dashed",
    borderRadius: 12,
    height: 50,
    gap: 5,
  },
  importText: { color: "#1e3a8a", fontWeight: "bold" },
  submitBtn: {
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
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
