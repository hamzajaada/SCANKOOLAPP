import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  Image,
  Animated,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { UserContext } from "../context/UserContext";
import apiPublic from "../api/apiPublic";

export default function MenuBar() {
  const navigation = useNavigation();
  const { user, setUser } = useContext(UserContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-320)).current;

  const projectname = user?.project_name;

  // Animation du menu
  React.useEffect(() => {
    if (menuVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible]);

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
      //console.log("LOGOUT API ERROR:", error?.response || error.message);
    } finally {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("refresh");
      setUser(null);
      navigation.replace("Login");
    }
  };

  const goTo = (screen) => {
    //console.log("Navigating to:", screen);
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  return (
    <>
      {/* TOP BAR */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>☰</Text>
          </TouchableOpacity>

          {/* Logo Scankool */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/scankool.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* OVERLAY */}
      {menuVisible && (
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <ScrollView 
              style={styles.menuScroll}
              contentContainerStyle={styles.menuScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {/* Header du menu */}
              <View style={styles.menuHeader}>
                <Image
                  source={require("../../assets/scankool.png")}
                  style={styles.menuLogo}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  onPress={closeMenu}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* User Info */}
              {user?.name && (
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {user?.project_name && (
                    <Text style={styles.projectName}>{user.project_name}</Text>
                  )}
                </View>
              )}

              <View style={styles.divider} />

              {/* Menu Items */}
              <View style={styles.menuItems}>
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
                  label="Paramètres de profil"
                  onPress={() => goTo("ProfileSettings")}
                />
                <MenuItem
                  label="Visualiser Votre Menu"
                  onPress={() => {
                    closeMenu();
                    if (projectname) {
                      Linking.openURL(`https://www.scankool.com/Client/Menu/${projectname}`);
                    } else {
                      Alert.alert("Erreur", "Nom de projet non disponible");
                    }
                  }}
                />
              </View>

              <View style={styles.divider} />

              {/* Logout */}
              <MenuItem
                label="Déconnexion"
                danger
                onPress={() => {
                  closeMenu();
                  Alert.alert(
                    "Déconnexion",
                    "Voulez-vous vraiment vous déconnecter ?",
                    [
                      { text: "Annuler", style: "cancel" },
                      { text: "Oui", onPress: handleLogout },
                    ]
                  );
                }}
              />
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </>
  );
}

/* ================= MENU ITEM ================= */

const MenuItem = ({ label, onPress, danger }) => (
  <TouchableOpacity
    style={[styles.menuItem, danger && styles.menuItemDanger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      style={[
        styles.menuText,
        danger && styles.menuTextDanger,
      ]}
    >
      {label}
    </Text>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FF7A00",
    zIndex: 1000,
  },
  container: {
    height: 60,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 35,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 300,
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingBottom: 20,
  },
  menuHeader: {
    backgroundColor: "#FF7A00",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuLogo: {
    width: 140,
    height: 40,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: "#6b7280",
  },
  menuItems: {
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    minHeight: 56,
  },
  menuItemDanger: {
    backgroundColor: "#fef2f2",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    lineHeight: 22,
  },
  menuTextDanger: {
    color: "#dc2626",
  },
  menuArrow: {
    fontSize: 20,
    color: "#9ca3af",
    fontWeight: "300",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
});
