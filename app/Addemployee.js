import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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

// ✅ Web-safe Alert helper
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ✅ URI to Blob converter (Web & iOS Safari fix)
const uriToBlob = async (uri) => {
  const response = await fetch(uri);
  return await response.blob();
};

export default function AddEmployee() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEdit = !!id;
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    is_active: true,
    role: null,
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (isEdit) fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await axios.get(`/register/${id}/`);
      const employeeData = res.data.data;

      if (employeeData) {
        setForm({
          username: employeeData.username || "",
          email: employeeData.email || "",
          phone: employeeData.phone || "",
          password: employeeData.password || "",
          is_active: employeeData.status === 1 ? true : false,
          role: employeeData.role || null,
        });

        if (employeeData.profile_photo) {
          setImage(employeeData.profile_photo);
        }
      }
    } catch (err) {
      console.log("Fetch Error:", err);
      showAlert("Error", "விபரங்களை எடுப்பதில் சிக்கல்.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const { username, email, phone, password, role } = form;

    if (!username.trim()) {
      showAlert("Error", "பெயரை உள்ளிடவும்.");
      return;
    }

    if (role === null || role === undefined) {
      showAlert(
        "Error",
        "Admin அல்லது Employee யாராவது ஒருவரை தேர்ந்தெடுக்கவும்.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("is_active", form.is_active ? "1" : "0");

    if (image) {
      const filename = `photo_${Date.now()}.jpg`;

      if (Platform.OS === "web") {
        // ✅ Web fix
        try {
          const blob = await uriToBlob(image);
          formData.append("profile_photo", blob, filename);
        } catch (blobErr) {
          console.error("Blob conversion error:", blobErr);
        }
      } else if (Platform.OS === "ios") {
        // ✅ iOS Safari fix
        try {
          const blob = await uriToBlob(image);
          formData.append("profile_photo", blob, filename);
        } catch (blobErr) {
          formData.append("profile_photo", {
            uri: image,
            name: filename,
            type: "image/jpeg",
          });
        }
      } else {
        // ✅ Android - native method
        formData.append("profile_photo", {
          uri: image,
          name: filename,
          type: "image/jpeg",
        });
      }
    }

    try {
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (isEdit) {
        await axios.put(`/register/${id}/`, formData, config);
      } else {
        await axios.post("/register/", formData, config);
      }

      showAlert(
        "Success",
        isEdit ? "Updated Successfully!" : "Employee Added!",
      );
      router.back();
    } catch (err) {
      console.log("Submit Error:", err.response?.data || err.message);
      showAlert("Error", "தகவலைச் சேமிப்பதில் தோல்வி.");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: isEdit ? "Edit Employee" : "Add Employee" }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.img} />
          ) : (
            <View style={styles.cameraCircle}>
              <Ionicons name="camera" size={30} color="#1e3a8a" />
              <Text style={styles.cameraText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, username: v })}
            value={form.username}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, email: v })}
            value={form.email}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            value={form.phone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              onChangeText={(v) => setForm({ ...form, password: v })}
              value={form.password}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Select Role</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                form.role === 2 && styles.checkboxSelected,
              ]}
              onPress={() => setForm({ ...form, role: 2 })}
            >
              <Ionicons
                name={form.role === 2 ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={form.role === 2 ? "#1e3a8a" : "#64748b"}
              />
              <Text style={styles.roleText}>Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.checkbox,
                form.role === 3 && styles.checkboxSelected,
              ]}
              onPress={() => setForm({ ...form, role: 3 })}
            >
              <Ionicons
                name={form.role === 3 ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={form.role === 3 ? "#1e3a8a" : "#64748b"}
              />
              <Text style={styles.roleText}>Employee</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.btnText}>
            {isEdit ? "Update Changes" : "Create Employee"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 25 },
  imagePicker: { alignItems: "center", marginBottom: 30 },
  img: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#eff6ff",
  },
  cameraCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderStyle: "dashed",
  },
  cameraText: {
    fontSize: 12,
    color: "#1e3a8a",
    marginTop: 5,
    fontWeight: "bold",
  },
  formGroup: { marginBottom: 10 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    marginBottom: 20,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 15,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },
  eyeIcon: { padding: 15 },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    width: "48%",
  },
  checkboxSelected: {
    borderColor: "#1e3a8a",
    backgroundColor: "#eff6ff",
  },
  roleText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  submitBtn: {
    backgroundColor: "#1e3a8a",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
    marginBottom: 40,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
