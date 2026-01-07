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
import ProductEditModal from "../components/products/EditProductModal";
import EditProductModal from "../components/products/EditProductModal";

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
const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    console.log("🔄 Refreshing products...");
    setLoading(true);
    
    const res = await apiPublic.get(`product/getProductsByUser/${USER_ID}/`);
    const oldCount = products.length;
    
    const mapped = (res.data.results || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      categoryId: p.category_id,
      categoryName: pickFR(p.category_name),
      price: p.price,
      status: p.is_active,
      image: p.image,
    }));
console.log("uszer id " , USER_ID);

    products.map(product => {
      console.log("ID: ", product.id);
  console.log("Name: ", product.name);
  console.log("Description:", product.description);
});

    setProducts(mapped);
  } catch (e) {
    console.error("❌ FETCH ERROR:", e);
  } finally {
    setLoading(false);
  }
};


  const fetchCategories = async () => {
    try {
      //console.log("Fetching categories...");
      
      let allCategories = [];
      let currentPage = 1;
      const perPage = 10;

      // Pagination pour récupérer toutes les catégories
      while (true) {
        const res = await apiPublic.get(
          `categories/getCategoriesByUser/${USER_ID}/`
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
        
        return {
          id: category.id,
          name: categoryName, // Objet multilingue
          displayName: pickFR(categoryName), // Chaîne pour l'affichage
        };
      });

      //console.log("Total categories:", transformedCategories.length);
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


  /* ================= UPDATE ================= */

const updateProduct = async (payload) => {
  const { id, name, description, price, categoryId, image } = payload;

  setIsSubmitting(true);
  try {
    const fd = new FormData();

    console.log("==> ",JSON.stringify(name));
    console.log("==> ",JSON.stringify(description));
    
    fd.append("name", JSON.stringify(name));
    fd.append("description", JSON.stringify(description));
    fd.append("price", String(price));
    fd.append("category", categoryId);

    if (image?.uri && image.uri !== selectedProduct.image) {
      fd.append("image_file", {
        uri: image.uri,
        type: "image/jpeg",
        name: "product.jpg",
      });
    }

    await apiPrivate.patch(`/product/${id}/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ Update local state
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              name: name,
              description: description,
              price: parseFloat(price),
              categoryId,
              categoryName:
                categories.find(c => c.id === categoryId)?.displayName ||
                p.categoryName,
              image: image?.uri || p.image,
            }
          : p
      )
    );

    setShowEditModal(false);
    setSelectedProduct(null);
    Alert.alert("Succès", "Produit mis à jour !");
  } catch (e) {
    Alert.alert("Erreur", "Erreur lors de la mise à jour");
  } finally {
    setIsSubmitting(false);
  }
};

/* ================= TOGGLE STATUS ================= */

const toggleProductStatus = async () => {
  if (!selectedProduct) return;
  try {
    const newStatus = !selectedProduct.status;
    await apiPrivate.patch(`/product/${selectedProduct.id}/`, { is_active: newStatus });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id ? { ...p, status: newStatus } : p
      )
    );

    setSelectedProduct(null);
    Alert.alert("Succès", `Produit ${newStatus ? "activé" : "désactivé"} !`);
  } catch (error) {
    console.error("❌ Toggle status failed:", error.response?.data || error.message);
    Alert.alert("Erreur", "Impossible de changer le statut du produit");
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
    fd.append("name", JSON.stringify(productName));
    fd.append("description", JSON.stringify(productDescription));
    fd.append("price", String(productPrice));
    fd.append("category", productCategoryId);
    fd.append("is_active", "true");

    if (productImage) {
      fd.append("image_file", {
        uri: productImage.uri,
        type: "image/jpeg",
        name: "product.jpg",
      });
    }

    const response = await apiPrivate.post("product/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Product created:", response.data.id);

    // 1. OPTIMISTIC UPDATE - Add immediately (UI instant)
    const newProduct = {
      id: response.data.id,
      name: pickFR(productName),
      categoryId: productCategoryId,
      categoryName: categories.find(c => c.id == productCategoryId)?.displayName || "Nouvelle catégorie",
      price: parseFloat(productPrice),
      image: productImage?.uri || null,
    };
    setProducts(prev => [newProduct, ...prev]);  // Prepend new product

    // 2. REFRESH FROM SERVER (background)
    setTimeout(async () => {  // Delay to avoid race
      await fetchProducts();
    }, 500);

    // 3. Reset + close
    setProductName({ fr: "", en: "", ar: "", es: "", it: "", zh: "", ja: "", de: "", pt: "", ru: "", nl: "" });
    setProductDescription({ fr: "", en: "", ar: "", es: "", it: "", zh: "", ja: "", de: "", pt: "", ru: "", nl: "" });
    setProductPrice("");
    setProductCategoryId(null);
    setProductImage(null);
    setShowAddModal(false);

    Alert.alert("Succès", "Produit ajouté !");
  } catch (error) {
    console.error("❌ Add product failed:", error.response?.data);
    
    // Rollback optimistic update if failed
    setProducts(prev => prev.slice(1)); 
    
    Alert.alert("Erreur", error.response?.data?.detail || "Erreur lors de l'ajout");
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


  
 

  /* ================= ACTIONS ================= */

  const disableProduct = async (id) => {
    try {
      const prdt = products.find((p) => p.id === id);
      if (!prdt) return;

      const newStatus = !prdt.status;
      await apiPrivate.patch(`/product/${id}/`, { is_active: newStatus });
       setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      setSelectedProduct(null);
      Alert.alert("Succès", "Produit désactivé");
    } catch (e) {
      Alert.alert("Erreur", "Impossible de désactiver le produit");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiPrivate.delete(`/product/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedProduct(null);
      Alert.alert("Succès", "Produit supprimé");
    } catch (e) {
      Alert.alert("Erreur", "Impossible de supprimer le produit");
    }
  };

  const openEditProduct = () => {
    setProductName(selectedProduct.name);
    setProductDescription(selectedProduct.description);
    setProductPrice(String(selectedProduct.price));
    setProductCategoryId(selectedProduct.categoryId);
    setProductImage(selectedProduct.image ? { uri: selectedProduct.image } : null);
   setShowEditModal(true);
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
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
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
          <FlatList
          style={{ maxHeight: 50, marginBottom: 10 }}
            horizontal
            data={[{ id: null, displayName: "Toutes" }, ...categories]}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.displayName || "Toutes"}
                active={selectedCategoryId === item.id}
                onPress={() => setSelectedCategoryId(item.id)}
              />
            )}
          />
  <FlatList
            style={{ flex: 1 }}
            data={filteredProducts}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedProduct(item)}
              >
                <View style={styles.card}>
                  <View
                   style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <Image
                    source={
                      item.image
                        ? { uri: item.image }
                        : require("../../assets/scankool.png")
                    }
                    style={styles.image}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.name} numberOfLines={1}>
                      {pickFR(item.name) || "Sans nom"}
                    </Text>
                    <Text style={styles.sub} numberOfLines={1}>
                      {item.categoryName || "Sans catégorie"}
                    </Text>
                    <Text style={styles.price}>
                      {item.price ? `${item.price} MAD` : "Prix non défini"}
                    </Text>
                  </View>
                  </View>
                    <Text
                            style={[
                              styles.badge,
                              item.status ? styles.active : styles.inactive,
                            ]}
                          >
                             {item.status ? "Actif" : "Inactif"}

                          </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Aucun produit</Text>
                <Text style={styles.emptyText}>
                  {selectedCategoryId
                    ? "Aucun produit dans cette catégorie"
                    : "Commencez par ajouter votre premier produit"}
                </Text>
              </View>
            }
            refreshing={loading}
            onRefresh={async () => {
              await Promise.all([fetchProducts(), fetchCategories()]);
            }}
          />
  </View>


   {/* ACTION MODAL */}
        <ProductActionModal
        status= {selectedProduct?.status}
          visible={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={openEditProduct}
          onDisable={() => disableProduct(selectedProduct?.id)}
          onDelete={() => deleteProduct(selectedProduct?.id)}
        />

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
        

<EditProductModal
  visible={showEditModal}
  product={{
    ...selectedProduct,
    name: productName,
    description: productDescription,
    price: productPrice,
    categoryId: productCategoryId,
    image: productImage?.uri || selectedProduct?.image,
  }}
  categories={categories.map(c => ({
    id: c.id,
    name: c.displayName,
  }))}
  loadingTranslation={loadingTranslation}
  onTranslate={fetchTranslations}
  onUpdate={updateProduct}   // 👈 single source of truth
  onClose={() => setShowEditModal(false)}
  onAddCategory={handleAddCategory}
  isSubmitting={isSubmitting}
/>

      </KeyboardAvoidingView>
    </View>
  );
}

/* ================= COMPONENTS ================= */


const ProductActionModal = ({ status ,visible, product, onClose, onEdit, onDisable, onDelete }) => {
  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{pickFR(product.name)}</Text>

          <TouchableOpacity style={styles.modalBtn} onPress={onEdit}>
            <Text style={styles.modalBtnText}>✏️ Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalBtn} onPress={onDisable}>
            <Text style={styles.modalBtnText}> 

                 {!status ? "✅ Activer" : "🚫 Désactiver"}

            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modalBtn, styles.deleteBtn]} onPress={onDelete}>
            <Text style={[styles.modalBtnText, { color: "#fff" }]}>🗑 Supprimer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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

/* ================= STYLES ================= */

const styles = StyleSheet.create({

    badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "600",
    minWidth: 70,
    textAlign: 'center',
  },
  active: { backgroundColor: "#dcfce7", color: "#166534" },
  inactive: { backgroundColor: "#fee2e2", color: "#991b1b" },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    padding: 20,
  },

  container: { flex: 1, backgroundColor: "#f5f6f8" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 15,
    marginTop: 10 ,
  },
  title: { fontSize: 22, fontWeight: "700" },
  addBtn: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addText: { color: "#fff", fontWeight: "700" },
  categoryScroll: { paddingHorizontal: 15, paddingBottom: 10 },
  chip: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: { backgroundColor: "#FF7A00" },
  chipText: { fontSize: 14, color: "#374151" },
  chipTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  name: { fontWeight: "700", fontSize: 16 },
  sub: { color: "#777", fontSize: 13 },
  price: { fontWeight: "600", color: "#FF7A00", fontSize: 15 },
  emptyContainer: { alignItems: "center", paddingVertical: 50 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#777" },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center" },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  modalBtn: { paddingVertical: 12 },
  modalBtnText: { fontSize: 16 },
  deleteBtn: { backgroundColor: "#E53935", borderRadius: 8, paddingHorizontal: 10 },
  cancelText: { marginTop: 10, textAlign: "center", color: "#666" },
});