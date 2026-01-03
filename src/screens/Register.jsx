import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import api from '../api/api';
import apiPublic from '../api/apiPublic';

export default function Register() {
  const nav = useNavigation();

  const [restaurant, setRestaurant] = useState('');
  const [manager, setManager] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ---------- REGISTER API ----------
  const handleRegister = async () => {
    setError("");

    // Validation simple
    if (!restaurant || !manager || !password || !phone) {
      return setError("Tous les champs sont obligatoires");
    }

    setLoading(true);

    try {
      // Préparation du body demandé par l'API
      const timestamp = Date.now();
      const body = {
        username: `${restaurant.toLowerCase().replace(/\s+/g, '')}_${timestamp}`,
        email: `${manager}@gmail.com`,
        password: password,
        first_name: manager,
        last_name: restaurant
      };

console.log(body);


      const res = await apiPublic.post(
        "/register",
        body
      );



      alert("Compte créé avec succès !");
      nav.navigate("Login");

    } catch (e) {
      console.log("API ERROR:", e);
      if (e.response) {
        console.log("Response status:", e.response.status);
        console.log("Response data:", e.response.data);
        if (e.response.status === 500) {
          setError("Erreur serveur interne. Veuillez réessayer plus tard.");
        } else if (e.response.status === 400) {
          setError("Données invalides. Vérifiez vos informations.");
        } else {
          setError("Erreur lors de l'inscription: " + (e.response.data?.message || e.message));
        }
      } else {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
      }
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>

      {/* LOGO */}
      <Image
        source={require('../../assets/scankool.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Créer un compte</Text>

      {/* Nom du restaurant */}
      <TextInput
        placeholder="Nom du restaurant"
        style={styles.input}
        value={restaurant}
        onChangeText={setRestaurant}
      />

      {/* Nom du gérant */}
      <TextInput
        placeholder="Nom du gérant"
        style={styles.input}
        value={manager}
        onChangeText={setManager}
      />

      {/* Mot de passe */}
      <View style={styles.passwordBox}>
        <TextInput
          placeholder="Mot de passe"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eye}>👁</Text>
        </TouchableOpacity>
      </View>

      {/* Téléphone (non utilisé dans API, mais conservé pour UI) */}
      <TextInput
        placeholder="Téléphone"
        keyboardType="phone-pad"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* BTN REGISTER */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>
          {loading ? "Création..." : "Créer un compte →"}
        </Text>
      </TouchableOpacity>

      {/* Aller vers Login */}
      <TouchableOpacity onPress={() => nav.navigate("Login")}>
        <Text style={styles.loginLink}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  logo: {
    width: 180,
    height: 60,
    alignSelf: 'center',
    marginBottom: 25
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20
  },
  input: {
    width: '100%',
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    padding: 15,
    marginTop: 12,
    fontSize: 16,
    color: '#555'
  },
  passwordBox: {
    width: '100%',
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10
  },
  eye: {
    fontSize: 17,
    opacity: 0.7
  },
  button: {
    marginTop: 25,
    backgroundColor: '#FF7A00',
    paddingVertical: 15,
    borderRadius: 12
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  },
  loginLink: {
    marginTop: 18,
    textAlign: 'center',
    color: '#FF7A00',
    fontWeight: '600'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14
  }
});
