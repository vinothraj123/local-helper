import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

// Web-safe wrapper — web-ல் TouchableWithoutFeedback pointer events block பண்றது fix
const DismissKeyboard = ({ children }) => {
  if (Platform.OS === "web") {
    return (
      <View style={{ width: "100%", alignItems: "center" }}>{children}</View>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ width: "100%", alignItems: "center" }}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

const { width, height } = Dimensions.get("window");

// Animated floating orb component
function FloatingOrb({ style, delay = 0, size = 120, color }) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }],
        },
        style,
      ]}
    />
  );
}

export default function Login() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(80)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(cardSlide, {
          toValue: 0,
          friction: 9,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(labelAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) router.replace("/dashboard");
    } catch (e) {
      console.log(e);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showAlert("Attention", "Credentials are required to proceed");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post("login/", { username, password });
      const userData = response.data.data;
      const token = userData.token;
      if (!token) {
        showAlert("Error", "Access Denied");
        return;
      }
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user_data", JSON.stringify(userData));
      router.replace("/dashboard");
    } catch (error) {
      showAlert("Login Failed", "Incorrect username or password.");
    } finally {
      setLoading(false);
    }
  };

  const spinInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Deep background */}
      <LinearGradient
        colors={["#020617", "#0a0f1e", "#0c1a3a"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow orbs */}
      <FloatingOrb
        style={{ top: -40, left: -30 }}
        size={200}
        color="rgba(56,189,248,0.07)"
        delay={200}
      />
      <FloatingOrb
        style={{ top: height * 0.3, right: -60 }}
        size={180}
        color="rgba(99,102,241,0.08)"
        delay={800}
      />
      <FloatingOrb
        style={{ bottom: 60, left: -40 }}
        size={160}
        color="rgba(16,185,129,0.06)"
        delay={400}
      />

      {/* Diagonal accent line */}
      <View style={styles.diagonalAccent1} />
      <View style={styles.diagonalAccent2} />

      {/* Grid dot texture */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={[
                styles.gridDot,
                {
                  top: row * 80 + 20,
                  left: col * 70 + 20,
                },
              ]}
            />
          )),
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        enabled={Platform.OS !== "web"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <DismissKeyboard>
            <View style={styles.inner}>
              {/* ── TOP BADGE ── */}
              <Animated.View
                style={[
                  styles.badgeRow,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.badge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>LIVE SYSTEM</Text>
                </View>
              </Animated.View>

              {/* ── LOGO BLOCK ── */}
              <Animated.View
                style={[
                  styles.logoSection,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: logoScale },
                    ],
                  },
                ]}
              >
                {/* Spinning ring */}
                <Animated.View
                  style={[
                    styles.spinRing,
                    { transform: [{ rotate: spinInterpolate }] },
                  ]}
                />
                {/* Static glow ring */}
                <View style={styles.glowRing} />

                <View style={styles.logoBox}>
                  <Image
                    source={require("../assets/images/lend.png")}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Academy Name */}
                <View style={styles.titleBlock}>
                  <Text style={styles.academyLabel}>BSC</Text>
                  <View style={styles.titleDivider} />
                  <Text style={styles.academyName}>CRICKET ACADEMY</Text>
                </View>

                <View style={styles.subtitleRow}>
                  <View style={styles.subtitleLine} />
                  <Text style={styles.subtitleText}>SMART ATTENDANCE</Text>
                  <View style={styles.subtitleLine} />
                </View>
              </Animated.View>

              {/* ── FORM CARD ── */}
              <Animated.View
                style={[
                  styles.formCard,
                  {
                    opacity: cardFade,
                    transform: [{ translateY: cardSlide }],
                  },
                ]}
              >
                {/* Card top accent bar */}
                <LinearGradient
                  colors={["#38bdf8", "#6366f1", "#10b981"]}
                  style={styles.cardAccentBar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />

                <Text style={styles.signInLabel}>Sign in to continue</Text>

                {/* Username input */}
                <View
                  style={[
                    styles.inputGroup,
                    usernameFocused && styles.inputGroupFocused,
                  ]}
                >
                  <View style={styles.inputIconBox}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={usernameFocused ? "#38bdf8" : "#475569"}
                    />
                  </View>
                  <View style={styles.inputDivider} />
                  <TextInput
                    placeholder="Username"
                    placeholderTextColor="#334155"
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                  />
                </View>

                {/* Password input */}
                <View
                  style={[
                    styles.inputGroup,
                    passwordFocused && styles.inputGroupFocused,
                  ]}
                >
                  <View style={styles.inputIconBox}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={passwordFocused ? "#38bdf8" : "#475569"}
                    />
                  </View>
                  <View style={styles.inputDivider} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#334155"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#475569"
                    />
                  </TouchableOpacity>
                </View>

                {/* Forgot */}
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot credentials?</Text>
                </TouchableOpacity>

                {/* Login button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleLogin}
                  disabled={loading}
                  style={styles.loginBtnWrap}
                >
                  <LinearGradient
                    colors={["#0ea5e9", "#6366f1"]}
                    style={styles.loginBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.btnContent}>
                        <Text style={styles.btnText}>ACCESS PORTAL</Text>
                        <View style={styles.btnArrow}>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color="#fff"
                          />
                        </View>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>99%</Text>
                    <Text style={styles.statLabel}>Uptime</Text>
                  </View>
                  <View style={styles.statSep} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>Fast</Text>
                    <Text style={styles.statLabel}>Tracking</Text>
                  </View>
                  <View style={styles.statSep} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>Safe</Text>
                    <Text style={styles.statLabel}>Secure</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Footer */}
              <Animated.Text style={[styles.footer, { opacity: cardFade }]}>
                © BSC Cricket Academy • Attendance Management
              </Animated.Text>
            </View>
          </DismissKeyboard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 50,
  },
  inner: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  // Grid texture
  gridOverlay: { position: "absolute", width: "100%", height: "100%" },
  gridDot: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(148,163,184,0.08)",
  },

  // Diagonal accents
  diagonalAccent1: {
    position: "absolute",
    top: 0,
    left: -width * 0.4,
    width: width * 1.5,
    height: 1,
    backgroundColor: "rgba(56,189,248,0.08)",
    transform: [{ rotate: "15deg" }],
    top: height * 0.25,
  },
  diagonalAccent2: {
    position: "absolute",
    width: width * 1.5,
    left: -width * 0.2,
    height: 1,
    backgroundColor: "rgba(99,102,241,0.06)",
    transform: [{ rotate: "-8deg" }],
    top: height * 0.6,
  },

  // Badge
  badgeRow: { marginBottom: 24 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16,185,129,0.12)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  badgeText: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },

  // Logo section
  logoSection: { alignItems: "center", marginBottom: 32 },
  spinRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: "transparent",
    borderTopColor: "#38bdf8",
    borderRightColor: "rgba(99,102,241,0.4)",
  },
  glowRing: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  logoImage: { width: "100%", height: "100%" },

  titleBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  academyLabel: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 3,
  },
  titleDivider: {
    width: 2,
    height: 20,
    backgroundColor: "#38bdf8",
    borderRadius: 2,
  },
  academyName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#e2e8f0",
    letterSpacing: 2,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  subtitleLine: {
    width: 24,
    height: 1,
    backgroundColor: "rgba(56,189,248,0.4)",
  },
  subtitleText: {
    fontSize: 9,
    color: "#38bdf8",
    fontWeight: "700",
    letterSpacing: 4,
  },

  // Form card
  formCard: {
    width: "100%",
    backgroundColor: "rgba(15,23,42,0.85)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    paddingBottom: 24,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  cardAccentBar: {
    height: 3,
    width: "100%",
  },
  signInLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    textTransform: "uppercase",
  },

  // Inputs
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  inputGroupFocused: {
    borderColor: "rgba(56,189,248,0.4)",
    backgroundColor: "rgba(56,189,248,0.04)",
  },
  inputIconBox: {
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  inputDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: 14,
  },
  input: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "500",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },
  eyeBtn: { paddingHorizontal: 16 },

  forgotBtn: { alignSelf: "flex-end", marginRight: 20, marginBottom: 20 },
  forgotText: { color: "#6366f1", fontSize: 12, fontWeight: "600" },

  // Login button
  loginBtnWrap: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    height: 56,
  },
  loginBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  btnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 0,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statLabel: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  // Footer
  footer: {
    marginTop: 24,
    color: "rgba(100,116,139,0.4)",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
