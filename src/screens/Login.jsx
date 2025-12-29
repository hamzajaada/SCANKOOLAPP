import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

// 🔹 Exemple UserContext (à adapter si déjà existant)
import { UserContext } from "../context/UserContext";
import api from "../api/api";
import apiPublic from "../api/apiPublic";
import apiPrivate from "../api/apiPrivate";

export default function Login() {
  const navigation = useNavigation();
  const { setUser } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
     
      const loginRes = await apiPublic.post("login", {
        username,
        password,
      });

     

      const { access, refresh } = loginRes.data;
      console.log("accex token :"+access);
      

      // 2️⃣ SAVE TOKENS
      await SecureStore.setItemAsync("token", access);
      await SecureStore.setItemAsync("refresh", refresh);

      // 3️⃣ GET PROFILE (ME)
      const meRes = await apiPrivate.get(`/profiles/?page=1&page_size=1`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      const me = meRes.data.results?.[0] || meRes.data;
      const userId = me?.user?.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // 4️⃣ GET FULL PROFILE
      const profileRes = await apiPrivate.get(
        `/profiles/getProfile/${userId}/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );

      const profileData = Array.isArray(profileRes.data)
        ? profileRes.data[0]
        : profileRes.data;

      if (!profileData) {
        throw new Error("Profile not found");
      }

      // 5️⃣ SAVE USER IN CONTEXT
      setUser({
        id: userId,
        name: profileData.user?.first_name || profileData.user?.username || "",
        email: profileData.user?.email || "",
        phone: profileData.phone || "",
        role: profileData.user?.role || "admin_project",
        logo_url: profileData.logo,
        project_name: profileData.project_name,
        currency: profileData.currency,
        lang: profileData.lang,
      });

      // 6️⃣ NAVIGATE
      navigation.replace("Dashboard"); // ou Dashboard
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setError("Identifiants incorrects.");
    }

    setLoading(false);
  };
  return (
    <View style={styles.container}>
      {/* LOGO */}
      <Image
        source={require("../../assets/scankool.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.subtitle}>
        Connectez-vous pour accéder à votre compte.
      </Text>

      {/* ERROR */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* USERNAME */}
      <TextInput
        placeholder="Entrez votre username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      {/* PASSWORD */}
      <View style={styles.passwordBox}>
        <TextInput
          placeholder="Entrez votre mot de passe"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eye}>{showPassword ? "🙈" : "👁"}</Text>
        </TouchableOpacity>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Connexion</Text>
        )}
      </TouchableOpacity>

      {/* REGISTER */}
      <View style={styles.registerRow}>
        <Text style={{ color: "#666" }}>Pas encore inscrit ?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}> Inscrivez-vous !</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 180,
    height: 60,
    alignSelf: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#FF7A00",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F4F5F7",
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
  },
  passwordBox: {
    backgroundColor: "#F4F5F7",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
  },
  eye: {
    fontSize: 18,
    opacity: 0.7,
  },
  button: {
    marginTop: 25,
    backgroundColor: "#FF7A00",
    paddingVertical: 15,
    borderRadius: 12,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#FEE",
    borderLeftWidth: 4,
    borderLeftColor: "red",
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    fontWeight: "600",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerLink: {
    color: "#FF7A00",
    fontWeight: "700",
  },
});
