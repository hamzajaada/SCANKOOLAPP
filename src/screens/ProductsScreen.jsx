import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

import api from "../../../Api/api";
import AddCategorie from "./AddCategorie";
import dashboardTranslations from "../../../Api/dashboardTranslations.json";
import { useLanguage } from "../../../Components/context/LanguageContext";

const languages = ["fr","en","ar","es","it","zh","ja","de","pt","ru","nl"];

const emptyLangObject = () =>
  languages.reduce((acc, l) => ({ ...acc, [l]: "" }), {});

const AddProduct = ({ visible, onClose, onSubmit }) => {
  const { selectedLanguage } = useLanguage();

  const [productName, setProductName] = useState(emptyLangObject());
  const [productIngredients, setProductIngredients] = useState(emptyLangObject());
  const [productPrice, setProductPrice] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productImage, setProductImage] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  /* ================== FETCH CATEGORIES ================== */
  useEffect(() => {
    const fetchCategories = async () => {
      const userId = await AsyncStorage.getItem("userId");
      try {
        const res = await api.get(`categories/getCategoriesByUser/${userId}/`);
        setCategories(res.data.results || []);
      } catch (e) {
        console.log("Category error", e);
      }
    };
    fetchCategories();
  }, []);

  /* ================== IMAGE PICKER ================== */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0]);
    }
  };

  /* ================== TRANSLATION ================== */
  const fetchTranslations = async () => {
    if (!productName.fr.trim()) return;

    setLoadingTranslation(true);
    try {
      const res = await api.post("product/translate_product/", {
        product_name_fr: productName.fr,
        product_ingredients_fr: productIngredients.fr,
      });

      setProductName(prev => ({ ...prev, ...res.data.name }));
      setProductIngredients(prev => ({ ...prev, ...res.data.description }));
    } catch (e) {
      Alert.alert("Erreur", "Traduction échouée");
    } finally {
      setLoadingTranslation(false);
    }
  };

  /* ================== SUBMIT ================== */
  const handleSubmit = async () => {
    if (!productPrice || !productCategoryId) {
      Alert.alert("Erreur", "Champs obligatoires manquants");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", JSON.stringify(productName));
      fd.append("description", JSON.stringify(productIngredients));
      fd.append("price", productPrice);
      fd.append("category", productCategoryId);
      fd.append("is_active", "true");

      if (productImage) {
        fd.append("image_file", {
          uri: productImage.uri,
          name: "product.jpg",
          type: "image/jpeg",
        });
      }

      const res = await api.post("product/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSubmit(res.data);
      onClose();
    } catch (e) {
      console.log(e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================== UI ================== */
  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView style={styles.container}>

        <Text style={styles.title}>Ajouter un Produit</Text>

        {/* FR */}
        <Text style={styles.label}>Nom (FR)</Text>
        <TextInput style={styles.input} value={productName.fr}
          onChangeText={v => setProductName({ ...productName, fr: v })} />

        <Text style={styles.label}>Description (FR)</Text>
        <TextInput style={styles.input}
          value={productIngredients.fr}
          onChangeText={v => setProductIngredients({ ...productIngredients, fr: v })} />

        <TouchableOpacity style={styles.aiBtn} onPress={fetchTranslations}>
          {loadingTranslation ? <ActivityIndicator color="#fff"/> :
            <Text style={styles.aiText}>
              {dashboardTranslations.translate_with_ai[selectedLanguage]}
            </Text>}
        </TouchableOpacity>

        {/* OTHER LANGUAGES */}
        {languages.filter(l => l !== "fr").map(lang => (
          <View key={lang}>
            <Text style={styles.label}>Nom ({lang.toUpperCase()})</Text>
            <TextInput style={styles.input}
              value={productName[lang]}
              onChangeText={v => setProductName({ ...productName, [lang]: v })} />

            <Text style={styles.label}>Description ({lang.toUpperCase()})</Text>
            <TextInput style={styles.input}
              value={productIngredients[lang]}
              onChangeText={v => setProductIngredients({ ...productIngredients, [lang]: v })} />
          </View>
        ))}

        {/* PRICE */}
        <Text style={styles.label}>Prix</Text>
        <TextInput style={styles.input} keyboardType="numeric"
          value={productPrice} onChangeText={setProductPrice} />

        {/* CATEGORY */}
        <Picker selectedValue={productCategoryId}
          onValueChange={(v) => v === "add_new" ? setIsCategoryModalOpen(true) : setProductCategoryId(v)}>
          <Picker.Item label="Sélectionner catégorie" value="" />
          {categories.map(c => (
            <Picker.Item key={c.id} label={c.name.fr} value={c.id} />
          ))}
          <Picker.Item label="+ Ajouter catégorie" value="add_new" />
        </Picker>

        {/* IMAGE */}
        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <Text>Choisir image</Text>
        </TouchableOpacity>

        {productImage && <Image source={{ uri: productImage.uri }} style={styles.image} />}

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={{color:"#fff"}}>Confirmer</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <AddCategorie
          onClose={() => setIsCategoryModalOpen(false)}
          onSubmit={(c) => {
            setCategories([...categories, c]);
            setProductCategoryId(c.id);
            setIsCategoryModalOpen(false);
          }}
        />
      )}
    </Modal>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { marginTop: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  aiBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  aiText: { color: "#fff", fontWeight: "600" },
  imageBtn: { marginVertical: 15 },
  image: { width: 120, height: 120, borderRadius: 8 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  cancelBtn: { padding: 12 },
  saveBtn: { backgroundColor: "#4f46e5", padding: 12, borderRadius: 8 },
});
