import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Inbox() {
  const router = useRouter();

  const notifications = [
    { id: "1", title: "Welcome Vinoth!", msg: "Your account has been verified", unread: true },
    { id: "2", title: "New Test Available", msg: "A new sample test is available", unread: false },
    { id: "3", title: "Score Updated", msg: "Your results are now ready", unread: true },
  ];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderItem = ({ item }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity style={styles.box}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.msg}>{item.msg}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Inbox</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 15,
  },

  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  box: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 18,
    marginBottom: 14,

    // Premium card shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },

  msg: {
    color: "#475569",
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
  },

  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: "#0284c7",
  },
});
