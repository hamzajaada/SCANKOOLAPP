import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { UserContext } from "../context/UserContext";
import apiPublic from "../api/apiPublic";

export default function MenuBar() {
  const navigation = useNavigation();
  const { user, setUser } = useContext(UserContext);
  const [menuVisible, setMenuVisible] = useState(false);
   console.log(user);
   const projectname =  user?.project_name;
   

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    setMenuVisible(false);

    try {
      const refresh = await SecureStore.getItemAsync("refresh");

      if (refresh) {
        await apiPublic.post("logout", {
          refresh,
        });
      }
    } catch (error) {
      console.log("LOGOUT API ERROR:", error?.response || error.message);
      // Même en cas d’erreur backend → on nettoie localement
    } finally {
      // 🔥 Clear secure storage
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("refresh");

      // 🔥 Clear user context
      setUser(null);

      // 🔥 Reset navigation
      navigation.replace("Login");
    }
  };

  const goTo = (screen) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  return (
    <>
      {/* TOP BAR */}
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Text style={styles.icon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {user?.name || "Dashboard"}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* OVERLAY + MENU */}
      {menuVisible && (
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            <MenuItem
              label="Accueil"
              onPress={() => goTo("Dashboard")}
            />
            <MenuItem
              label="Gestion des catégories"
              onPress={() => goTo("Categories")}
            />
            <MenuItem
              label="Gestion des produits"
              onPress={() => goTo("Products")}
            />
             <MenuItem
              label="Parametre de profile"
              onPress={() => goTo("ProfileSettings")}
            />
              <MenuItem
              label="Visualiser Votre Menu"
              onPress={() => {
                setMenuVisible(false);
                Linking.openURL(`https://www.scankool.com/Client/Menu/${projectname}`);
              }}
            />

            <View style={styles.divider} />

            <MenuItem
              label="Déconnexion"
              danger
              onPress={() =>
                Alert.alert(
                  "Déconnexion",
                  "Voulez-vous vraiment vous déconnecter ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    { text: "Oui", onPress: handleLogout },
                  ]
                )
              }
            />
          </View>
        </Pressable>
      )}
    </>
  );
}

/* ================= MENU ITEM ================= */

const MenuItem = ({ label, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text
      style={[
        styles.menuText,
        danger && { color: "#e11d48" },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    height: 60,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 4,
    zIndex: 10,
  },
  icon: {
    fontSize: 26,
    color: "#fff",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  overlay: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 9,
  },

  menu: {
    position: "absolute",
    top: 0,
    left: 10,
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 6,
  },
});
