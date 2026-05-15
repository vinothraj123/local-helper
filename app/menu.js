import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Menu() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER PROFILE */}
      <View style={styles.profileRow}>
        <Image
          source={{ uri: "https://i.ibb.co/3kHz4t1/default-avatar.png" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>VINOTH</Text>
          <Text style={styles.rating}>⭐ 4.94</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* MENU LIST */}
        <MenuItem label="Refer Friends" />
        <MenuItem label="Opportunities" />
        <MenuItem label="Wallet" />
        <MenuItem label="Account" />
        <MenuItem label="Settings" />

        <View style={styles.divider} />

        <MenuItem label="Help" />
        <MenuItem label="Tips & Info" />
      </ScrollView>
    </View>
  );
}

function MenuItem({ label }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 50,
    marginRight: 15,
  },

  name: {
    fontSize: 23,
    fontWeight: "bold",
  },

  rating: {
    marginTop: 3,
    fontSize: 16,
    color: "#555",
  },

  menuItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuText: {
    fontSize: 22,
    fontWeight: "600",
  },

  divider: {
    height: 20,
  },
});
