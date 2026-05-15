import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react"; // useRef added
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserRegisterScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // --- New States for OTP ---
  const [isOtpSent, setIsOtpSent] = useState(false); // OTP அனுப்பப்பட்டதா என்பதைக் கண்காணிக்க
  const [otp, setOtp] = useState(["", "", "", ""]); // 4 OTP பெட்டிகளுக்கான நிலை
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]; // பெட்டிக்கு இடையே கவனம் செலுத்த

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // API Endpoints:
  const REGISTER_USER_API = "http://192.168.1.101:8000/api/v1/register-user/"; // OTP அனுப்பப் பயன்படுகிறது
  const VERIFY_OTP_API = "http://192.168.1.101:8000/api/v1/verify-otp/"; // உதாரணம்: இந்த API-ஐ உங்கள் Backend-இல் உருவாக்க வேண்டும்

  // --- OTP உள்ளீட்டைக் கையாளுதல் ---
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // அடுத்த உள்ளீட்டிற்கு தானாக கவனம் செலுத்த
    if (text.length === 1 && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
    // பின் உள்ளீட்டிற்கு தானாக கவனம் செலுத்த (Backspace)
    if (text.length === 0 && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // --- பதிவு செயல்முறை (OTP அனுப்ப) ---
  const handleRegister = async () => {
    if (!fullName || !email || !password || !phone) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // 1. Backend-க்கு பயனரின் தகவலை அனுப்பி OTP-ஐ மின்னஞ்சலில் பெறவும்.
      await axios.post(REGISTER_USER_API, {
        full_name: fullName,
        email,
        password,
        phone,
      });

      Alert.alert(
        "OTP Sent",
        "A verification code has been sent to your email address."
      );
      setIsOtpSent(true); // OTP பெட்டிகளைக் காட்டவும்
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- OTP சரிபார்ப்பு செயல்முறை (Final Registration) ---
  const handleVerifyOtp = async () => {
    const fullOtp = otp.join(""); // 4 பெட்டிகளையும் இணைக்கவும்

    if (fullOtp.length !== 4) {
      Alert.alert("Error", "Please enter the 4-digit OTP");
      return;
    }

    try {
      setLoading(true);

      // 2. Backend-க்கு OTP, email உடன் அனுப்பி பதிவை முடிக்கவும்.
      await axios.post(VERIFY_OTP_API, {
        email,
        otp: fullOtp,
        // மற்ற விவரங்கள் தேவைப்பட்டால் (full_name, password, phone) அனுப்பலாம்
      });

      Alert.alert("Success", "User Registered and Verified Successfully");
      router.push("/login"); // உள்நுழைவுப் பக்கத்திற்குச் செல்லவும்
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error.response?.data?.message || "Invalid OTP or something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- ரெண்டர் OTP உள்ளீடுகள் ---
  const renderOtpInputs = () => (
    <View style={styles.otpContainer}>
      {otp.map((value, index) => (
        <TextInput
          key={index}
          ref={otpInputRefs[index]}
          style={styles.otpInput}
          keyboardType="numeric"
          maxLength={1}
          value={value}
          onChangeText={(text) => handleOtpChange(text, index)}
          placeholderTextColor="#6b7280"
          textAlign="center"
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.main}
    >
      <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
        <Text style={styles.title}>
          {isOtpSent ? "Verify Email OTP" : "User Registration"}
        </Text>

        {/* --- பதிவுப் படிவம் (Registration Form) --- */}
        {!isOtpSent && (
          <>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#6a1b9a"
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* --- OTP பகுதி --- */}
        {isOtpSent && (
          <>
            <Text style={styles.otpInstruction}>
              Enter the 4-digit code sent to {email}.
            </Text>
            {renderOtpInputs()}
          </>
        )}

        {/* --- பட்டன் (Button) --- */}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={isOtpSent ? handleVerifyOtp : handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            {loading
              ? "Please wait..."
              : isOtpSent
              ? "Verify & Complete Registration"
              : "Send OTP & Register"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#6a1b9a",
  },
  cardWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 26,
    borderRadius: 32,
    shadowColor: "#9c27b0",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    color: "#6a1b9a",
    fontWeight: "bold",
    marginBottom: 20,
  },
  // --- OTP Styles ---
  otpInstruction: {
    fontSize: 15,
    textAlign: "center",
    color: "#4a4a4a",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#d1c4e9",
    borderRadius: 12,
    padding: 10,
    width: "22%", // 4 பெட்டிகளுக்கு இடமளிக்கும்
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    backgroundColor: "#f3e5f5",
    height: 55,
    textAlign: "center",
  },
  // --- Existing Styles ---
  input: {
    borderWidth: 1,
    borderColor: "#d1c4e9",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#f3e5f5",
    marginBottom: 18,
    fontSize: 16,
    color: "#000",
    shadowColor: "#9c27b0",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  eyeIcon: { position: "absolute", right: 14 },
  registerBtn: {
    backgroundColor: "#9c27b0",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 5,
  },
  registerText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});