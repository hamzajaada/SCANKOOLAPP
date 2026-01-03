import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import MenuBar from "../components/MenuBar";
import api from "../api/api";
import apiPublic from "../api/apiPublic";
import { UserContext } from "../context/UserContext";

/* ================= HELPERS ================= */

const pickFR = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.fr || "";
};

/* ================= SCREEN ================= */

export default function ProductsScreen() {
  const { user } = useContext(UserContext);
  const USER_ID = user?.id;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: { fr: "" },
    description: { fr: "" },
    price: "",
    categoryId: null,
    image: null,
  });

  /* ================= FETCH ================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiPublic.get(
        `product/getProductsByUser/${USER_ID}/`
      );

      const mapped = (res.data.results || []).map((p) => ({
        id: p.id,
        name: pickFR(p.name),
        categoryId: p.category_id,
        categoryName: pickFR(p.category_name),
        price: p.price,
        image: p.image,
      }));

      setProducts(mapped);
    } catch (e) {
      console.log("FETCH PRODUCTS ERROR", e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiPublic.get(
        `categories/getCategoriesByUser/${USER_ID}/`
      );

      const mapped = (res.data.results || []).map((c) => ({
        id: c.id,
        name: pickFR(c.name),
      }));

      setCategories(mapped);
    } catch (e) {
      console.log("FETCH CATEGORIES ERROR", e.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ================= FILTER ================= */

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return products;
    return products.filter(
      (p) => String(p.categoryId) === String(selectedCategoryId)
    );
  }, [products, selectedCategoryId]);

  /* ================= IMAGE ================= */

  const handleImagePick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission requise");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) {
      setNewProduct({ ...newProduct, image: res.assets[0] });
    }
  };

  /* ================= ADD ================= */

  const addProduct = async () => {
    if (
      !newProduct.name.fr ||
      !newProduct.price ||
      !newProduct.categoryId
    ) {
      Alert.alert("Tous les champs sont obligatoires");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", JSON.stringify(newProduct.name));
      fd.append("description", JSON.stringify(newProduct.description));
      fd.append("price", String(newProduct.price));
      fd.append("category", newProduct.categoryId);
      fd.append("is_active", "true");

      if (newProduct.image) {
        fd.append("image_file", {
          uri: newProduct.image.uri,
          type: "image/jpeg",
          name: "product.jpg",
        });
      }

      await api.post("product/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchProducts();
      setShowAddModal(false);
      setNewProduct({
        name: { fr: "" },
        description: { fr: "" },
        price: "",
        categoryId: null,
        image: null,
      });
      Keyboard.dismiss();
    } catch (error) {
      console.log("ADD PRODUCT ERROR", error.message);
      Alert.alert("Erreur lors de l'ajout");
    }
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1 }}>
          <MenuBar />

          <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Gestion des produits</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>

            {/* CATEGORIES FILTER */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <CategoryChip
                label="Toutes"
                active={!selectedCategoryId}
                onPress={() => setSelectedCategoryId(null)}
              />
              {categories.map((c) => (
                <CategoryChip
                  key={c.id}
                  label={c.name}
                  active={selectedCategoryId === c.id}
                  onPress={() => setSelectedCategoryId(c.id)}
                />
              ))}
            </ScrollView>

            {/* PRODUCTS */}
            <FlatList
              data={filteredProducts}
              keyExtractor={(i) => String(i.id)}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Image
                    source={
                      item.image
                        ? { uri: item.image }
                        : require("../../assets/scankool.png")
                    }
                    style={styles.image}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.sub}>{item.categoryName}</Text>
                    <Text style={styles.price}>{item.price} MAD</Text>
                  </View>
                </View>
              )}
            />
          </View>

          {/* ADD MODAL */}
          <Modal visible={showAddModal} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowAddModal(false)}>
              <View style={styles.overlay}>
                <View style={styles.sheet}>
                  <Text style={styles.sheetTitle}>Ajouter un produit</Text>

                  <ScrollView>
                    <Text style={styles.label}>Nom</Text>
                    <TextInput
                      style={styles.input}
                      value={newProduct.name.fr}
                      onChangeText={(t) =>
                        setNewProduct({
                          ...newProduct,
                          name: { fr: t },
                        })
                      }
                    />

                    <Text style={styles.label}>Prix</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={newProduct.price}
                      onChangeText={(t) =>
                        setNewProduct({ ...newProduct, price: t })
                      }
                    />

                    <Text style={styles.label}>Catégorie</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowCategoryPicker(true)}
                    >
                      <Text>
                        {categories.find(
                          (c) => c.id === newProduct.categoryId
                        )?.name || "Sélectionner une catégorie"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.imageBtn}
                      onPress={handleImagePick}
                    >
                      <Text>
                        {newProduct.image
                          ? "Image sélectionnée"
                          : "Choisir une image"}
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>

                  <ActionButton label="Ajouter" onPress={addProduct} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* CATEGORY PICKER */}
          <Modal visible={showCategoryPicker} transparent animationType="fade">
            <TouchableWithoutFeedback
              onPress={() => setShowCategoryPicker(false)}
            >
              <View style={styles.overlay}>
                <View style={styles.picker}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        setNewProduct({
                          ...newProduct,
                          categoryId: c.id,
                        });
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

/* ================= COMPONENTS ================= */

const CategoryChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ActionButton = ({ label, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f6f8" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: "700" },

  addBtn: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addText: { color: "#fff", fontWeight: "700" },

  chip: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: { backgroundColor: "#FF7A00" },
  chipText: { fontSize: 14, fontWeight: "500", color: "#374151" },
  chipTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    marginBottom: 10,
  },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },

  name: { fontWeight: "700", fontSize: 16 },
  sub: { color: "#777", fontSize: 13 },
  price: { marginTop: 4, fontWeight: "600" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    width: "90%",
  },

  label: { fontWeight: "600", marginBottom: 5 },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  imageBtn: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  picker: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "80%",
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  actionBtn: {
    backgroundColor: "#FF7A00",
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
