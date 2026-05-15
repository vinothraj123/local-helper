import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BottomNav() {
  const router = useRouter();

  // Bottom Navigation Menu Items
  const menuItems = [
    { name: "Home", icon: "home-outline", path: "/dashboard" },
    { name: "Schedule", icon: "calendar-outline", path: "/liveSchedule" },
    { name: "Results", icon: "trophy-outline", path: "/resultsPage" },
    { name: "Profile", icon: "person-circle-outline", path: "/profile" }, // Changed to Profile
  ];

  const handlePress = (path) => {
    router.push(path);
  };

  return (
    <View style={styles.navContainer}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => handlePress(item.path)}
        >
          <Ionicons name={item.icon} size={24} color="#7c3aed" />
          <Text style={styles.navText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 15,
    shadowColor: "#4c1d95",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  navItem: {
    alignItems: "center",
    padding: 5,
  },
  navText: {
    fontSize: 12,
    color: "#7c3aed",
    marginTop: 4,
    fontWeight: '600',
  },
});