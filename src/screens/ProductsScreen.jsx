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
import apiPrivate from "../api/apiPrivate";
import { UserContext } from "../context/UserContext";
import ProductAddModal from "../components/products/ProductAddModal";

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
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productName, setProductName] = useState({
    fr: "",
    en: "",
    ar: "",
    es: "",
    it: "",
    zh: "",
    ja: "",
    de: "",
    pt: "",
    ru: "",
    nl: "",
  });

  const [productDescription, setProductDescription] = useState({
    fr: "",
    en: "",
    ar: "",
    es: "",
    it: "",
    zh: "",
    ja: "",
    de: "",
    pt: "",
    ru: "",
    nl: "",
  });

  const [productPrice, setProductPrice] = useState("");
  const [productCategoryId, setProductCategoryId] = useState(null);
  const [productImage, setProductImage] = useState(null);

  /* ================= FETCH ================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching products for user:", USER_ID);
      
      const res = await apiPublic.get(
        `product/getProductsByUser/${USER_ID}/`
      );

      console.log("Products API response:", {
        status: res.status,
        count: res.data.results?.length || 0
      });

      const mapped = (res.data.results || []).map((p) => ({
        id: p.id,
        name: pickFR(p.name),
        categoryId: p.category_id,
        categoryName: pickFR(p.category_name),
        price: p.price,
        image: p.image,
      }));

      console.log("Mapped products:", mapped.length);
      setProducts(mapped);
    } catch (e) {
      console.error("FETCH PRODUCTS ERROR", e.message, e.response?.data);
      Alert.alert("Erreur", "Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      
      let allCategories = [];
      let currentPage = 1;
      const perPage = 10;

      // Pagination pour récupérer toutes les catégories
      while (true) {
        const res = await apiPublic.get(
          `categories/getCategoriesByUser/${USER_ID}/?page=${currentPage}`
        );
        const pageResults = res.data.results || [];
        console.log(`Page ${currentPage}: ${pageResults.length} catégories`);
        
        allCategories = [...allCategories, ...pageResults];

        // Vérifier si nous avons atteint la dernière page
        if (currentPage >= (res.data.last_page || 1) || pageResults.length === 0) {
          break;
        }
        currentPage++;
      }

      // Transformation des données - CORRECTION ICI
      const transformedCategories = allCategories.map((category) => {
        // S'assurer que name est traité correctement
        const categoryName = category.name || {};
        
        console.log("Category data:", {
          id: category.id,
          name: categoryName,
          displayName: pickFR(categoryName)
        });
        
        return {
          id: category.id,
          name: categoryName, // Objet multilingue
          displayName: pickFR(categoryName), // Chaîne pour l'affichage
        };
      });

      console.log("Total categories:", transformedCategories.length);
      setCategories(transformedCategories);
    } catch (e) {
      console.error("FETCH CATEGORIES ERROR", e.message, e.response?.data);
      Alert.alert("Erreur", "Impossible de charger les catégories");
    }
  };

  useEffect(() => {
    if (USER_ID) {
      fetchProducts();
      fetchCategories();
    }
  }, [USER_ID]);

  /* ================= FILTER ================= */

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return products;
    return products.filter(
      (p) => String(p.categoryId) === String(selectedCategoryId)
    );
  }, [products, selectedCategoryId]);

  /* ================= TRANSLATION ================= */

  const fetchTranslations = async () => {
    if (!productName.fr.trim()) {
      Alert.alert("Erreur", "Veuillez d'abord saisir un nom en français");
      return;
    }

    setLoadingTranslation(true);
    try {
      const response = await apiPrivate.post("product/translate_product/", {
        product_name_fr: productName.fr.trim(),
        product_ingredients_fr: productDescription.fr.trim() || "",
      });

      const translations = response.data;

      // Update product name
      setProductName((prev) => ({
        ...prev,
        fr: translations.name.fr || productName.fr,
        en: translations.name.en || "",
        ar: translations.name.ar || "",
        es: translations.name.es || "",
        it: translations.name.it || "",
        zh: translations.name.zh || "",
        ja: translations.name.ja || "",
        de: translations.name.de || "",
        pt: translations.name.pt || "",
        ru: translations.name.ru || "",
        nl: translations.name.nl || "",
      }));

      // Update product description
      setProductDescription((prev) => ({
        ...prev,
        fr: translations.description.fr || productDescription.fr || "",
        en: translations.description.en || "",
        ar: translations.description.ar || "",
        es: translations.description.es || "",
        it: translations.description.it || "",
        zh: translations.description.zh || "",
        ja: translations.description.ja || "",
        de: translations.description.de || "",
        pt: translations.description.pt || "",
        ru: translations.description.ru || "",
        nl: translations.description.nl || "",
      }));

      Alert.alert("Succès", "Traduction terminée");
    } catch (error) {
      console.error("Error fetching translations:", error);
      Alert.alert("Erreur", "Erreur lors de la traduction. Veuillez réessayer.");
    } finally {
      setLoadingTranslation(false);
    }
  };

  /* ================= ADD ================= */

  const addProduct = async () => {
    if (!productName.fr || !productPrice || !productCategoryId) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", JSON.stringify(productName || {}));
      fd.append("description", JSON.stringify(productDescription || {}));
      fd.append("price", String(productPrice ?? 0));
      fd.append("category", productCategoryId);
      fd.append("is_active", "true");

      if (productImage) {
        fd.append("image_file", {
          uri: productImage.uri,
          type: "image/jpeg",
          name: "product.jpg",
        });
      }

      const response = await api.post("product/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Produit ajouté :", response.data);

      // Reset form
      setProductName({
        fr: "",
        en: "",
        ar: "",
        es: "",
        it: "",
        zh: "",
        ja: "",
        de: "",
        pt: "",
        ru: "",
        nl: "",
      });
      setProductDescription({
        fr: "",
        en: "",
        ar: "",
        es: "",
        it: "",
        zh: "",
        ja: "",
        de: "",
        pt: "",
        ru: "",
        nl: "",
      });
      setProductPrice("");
      setProductCategoryId(null);
      setProductImage(null);

      if (response.status === 201 || response.status === 200) {
        fetchProducts();
        setShowAddModal(false);
        Alert.alert("Succès", "Produit ajouté avec succès");
      }
      Keyboard.dismiss();
    } catch (error) {
      console.error("Create product failed:", error.response?.status, error.response?.data || error.message);
      Alert.alert("Erreur", "Erreur lors de l'ajout du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = () => {
    setShowAddModal(false);
    Alert.alert(
      "Ajouter une catégorie",
      "Veuillez d'abord ajouter une catégorie depuis l'écran de gestion des catégories",
      [{ text: "OK" }]
    );
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
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
                disabled={loading}
              >
                <Text style={styles.addText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>

            {/* CATEGORIES FILTER */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              <CategoryChip
                label="Toutes"
                active={!selectedCategoryId}
                onPress={() => setSelectedCategoryId(null)}
              />
              {categories.map((c) => (
                <CategoryChip
                  key={c.id}
                  label={c.displayName || `Catégorie ${c.id}`}
                  active={selectedCategoryId === c.id}
                  onPress={() => setSelectedCategoryId(c.id)}
                />
              ))}
            </ScrollView>

            {/* PRODUCTS LIST */}
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
                    defaultSource={require("../../assets/scankool.png")}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name || "Sans nom"}
                    </Text>
                    <Text style={styles.sub} numberOfLines={1}>
                      {item.categoryName || "Sans catégorie"}
                    </Text>
                    <Text style={styles.price}>
                      {item.price ? `${item.price} MAD` : "Prix non défini"}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>Aucun produit</Text>
                  <Text style={styles.emptyText}>
                    {selectedCategoryId 
                      ? "Aucun produit dans cette catégorie"
                      : "Commencez par ajouter votre premier produit"
                    }
                  </Text>
                </View>
              }
              refreshing={loading}
              onRefresh={() => {
                fetchProducts();
                fetchCategories();
              }}
            />
          </View>

          {/* ADD MODAL */}
          <ProductAddModal
            visible={showAddModal}
            productName={productName}
            setProductName={setProductName}
            productDescription={productDescription}
            setProductDescription={setProductDescription}
            productPrice={productPrice}
            setProductPrice={setProductPrice}
            productCategoryId={productCategoryId}
            setProductCategoryId={setProductCategoryId}
            productImage={productImage}
            setProductImage={setProductImage}
            categories={categories.map(c => ({
              id: c.id,
              name: c.displayName || `Catégorie ${c.id}`
            }))}
            loadingTranslation={loadingTranslation}
            onTranslate={fetchTranslations}
            onAdd={addProduct}
            onClose={() => {
              setShowAddModal(false);
              // Reset form on close
              setProductName({
                fr: "",
                en: "",
                ar: "",
                es: "",
                it: "",
                zh: "",
                ja: "",
                de: "",
                pt: "",
                ru: "",
                nl: "",
              });
              setProductDescription({
                fr: "",
                en: "",
                ar: "",
                es: "",
                it: "",
                zh: "",
                ja: "",
                de: "",
                pt: "",
                ru: "",
                nl: "",
              });
              setProductPrice("");
              setProductCategoryId(null);
              setProductImage(null);
            }}
            onAddCategory={handleAddCategory}
            isSubmitting={isSubmitting}
          />
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
    activeOpacity={0.7}
  >
    <Text 
      style={[styles.chipText, active && styles.chipTextActive]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: "#f5f6f8" 
  },
  loader: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f5f6f8",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "700",
    color: "#333",
  },
  addBtn: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  addText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 14,
  },
  categoryScroll: {
    marginBottom: 15,
    paddingVertical: 5,
  },
  chip: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  chipActive: { 
    backgroundColor: "#FF7A00" 
  },
  chipText: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#374151" 
  },
  chipTextActive: { 
    color: "#fff" 
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: { 
    width: 60, 
    height: 60, 
    borderRadius: 10, 
    marginRight: 12,
    backgroundColor: "#f5f6f8",
  },
  cardContent: {
    flex: 1,
  },
  name: { 
    fontWeight: "700", 
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  sub: { 
    color: "#777", 
    fontSize: 13,
    marginBottom: 4,
  },
  price: { 
    fontWeight: "600",
    color: "#FF7A00",
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#777",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    maxWidth: 300,
  },
});