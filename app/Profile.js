import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../axios";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const themeColor = "#1e3a8a";
  const SERVER_URL = axiosInstance.defaults.baseURL.split("/api")[0];

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("user_data");
      if (storedData) {
        const user = JSON.parse(storedData);
        setId(user.id);
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setCompany(user.companyname || "My Company");
        setRole(user.role || "User");

        if (user.profile) {
          const fullImageUrl = user.profile.startsWith("http")
            ? user.profile
            : `${SERVER_URL}${user.profile}`;
          setImage(fullImageUrl);
        }
      }
    } catch (error) {
      console.error("Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!name || !phone || !email) {
      Alert.alert("Required", "All fields are mandatory!");
      return;
    }

    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Login token missing. Please login again.");
        return;
      }

      // FormData உருவாக்கம்
      const formData = new FormData();
      formData.append("first_name", name);
      formData.append("first_names", name); // Backend expects this
      formData.append("last_name", ".");
      formData.append("email_id", email);
      formData.append("phone_no", phone);

      // இமேஜ் இருந்தால் மட்டும் சேர்க்கவும்
      if (image && !image.startsWith("http")) {
        const localUri = image;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("prof_photo", {
          uri: localUri,
          name: filename,
          type: type,
        });
      }

      const response = await axiosInstance.put(
        `profileupdate/${id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Status 200 அல்லது 201 இரண்டையும் சரிபார்க்கிறோம்
      if (
        response.status === 200 ||
        response.status === 201 ||
        response.data.status?.response === "success"
      ) {
        // 1. Local Storage Update
        const storedData = await AsyncStorage.getItem("user_data");
        const user = JSON.parse(storedData);

        // Backend-ல் இருந்து வரும் URL அல்லது லோக்கல் URL-ஐ சேமிக்கிறோம்
        const updatedProfile = response.data.profile_url || image;

        const updatedUser = {
          ...user,
          name: name,
          email: email,
          phone: phone,
          profile: updatedProfile,
        };

        await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));

        Alert.alert("Success 🎉", "Profile updated successfully!");
      }
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
      Alert.alert("Failed", "Could not update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={themeColor} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[themeColor, "#3b82f6"]} style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity>
              {/* <Ionicons name="arrow-back" size={24} color="#fff" /> */}
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile Details</Text>
            <View />
          </View>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
              <View style={styles.imageRing}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="person" size={50} color="#cbd5e1" />
                  </View>
                )}
                <View style={styles.camBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={themeColor} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={20} color={themeColor} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={20} color={themeColor} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.companyRow}>
            <MaterialCommunityIcons name="domain" size={18} color="#94a3b8" />
            <Text style={styles.companyName}>{company}</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: themeColor }]}
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Save All Changes</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  avatarWrapper: { alignItems: "center", marginTop: 20 },
  imageRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff",
    padding: 3,
    elevation: 10,
    position: "relative",
  },
  avatar: { width: "100%", height: "100%", borderRadius: 55 },
  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  camBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#10b981",
    padding: 7,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -45,
    borderRadius: 35,
    padding: 25,
    elevation: 8,
    marginBottom: 40,
  },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: 7,
    marginLeft: 5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 15,
    color: "#1e3a8a",
    fontWeight: "600",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    gap: 8,
  },
  companyName: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  saveBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    gap: 10,
    elevation: 5,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
