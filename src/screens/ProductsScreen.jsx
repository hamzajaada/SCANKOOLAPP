import React, { useEffect, useMemo, useState ,useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import MenuBar from "../components/MenuBar";
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
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
  });

  const [editProduct, setEditProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  /* ================= FETCH API ================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await apiPublic.get(
        `product/getProductsByUser/${USER_ID}/`
      );

      const mapped = (res.data.results || []).map((p) => ({
        id: p.id,
        name: pickFR(p.name),
        category: pickFR(p.category_name),
        price: p.price,
        status: p.is_active,
        image: p.image,
      }));

      setProducts(mapped);
    } catch (e) {
      console.log("API ERROR", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= CATEGORIES ================= */

  const categories = useMemo(() => {
    const cats = products.map((p) => p.category);
    return ["Tous", ...new Set(cats)];
  }, [products]);

  const filteredProducts =
    selectedCategory === "Tous"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  /* ================= ACTIONS (LOCAL) ================= */

  const toggleStatus = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: !p.status } : p
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedProduct(null);
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setProducts((prev) => [
      {
        id: Date.now(),
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category,
        status: true,
        image: null,
      },
      ...prev,
    ]);

    setNewProduct({ name: "", price: "", category: "" });
    setShowAddModal(false);
    Keyboard.dismiss();
  };

  const saveEditProduct = () => {
    setProducts((prev) =>
      prev.map((p) => (p.id === editProduct.id ? editProduct : p))
    );
    setShowEditModal(false);
    Keyboard.dismiss();
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

            {/* FILTER */}
            <View style={styles.filterRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.filterBtn,
                    selectedCategory === cat && styles.filterActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedCategory === cat && { color: "#fff" },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* LIST */}
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.card,
                    !item.status && styles.cardInactive,
                  ]}
                  onPress={() => setSelectedProduct(item)}
                >
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
                    <Text style={styles.category}>{item.category}</Text>
                    <Text style={styles.price}>{item.price} MAD</Text>
                  </View>
                  <Text
                    style={[
                      styles.badge,
                      item.status ? styles.active : styles.inactive,
                    ]}
                  >
                    {item.status ? "Actif" : "Inactif"}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* ================= ACTION MODAL ================= */}
          <Modal visible={!!selectedProduct} transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>
                  {selectedProduct?.name}
                </Text>

                <ActionButton
                  label="✏️ Modifier"
                  onPress={() => {
                    setEditProduct(selectedProduct);
                    setSelectedProduct(null);
                    setShowEditModal(true);
                  }}
                />

                <ActionButton
                  label={
                    selectedProduct?.status
                      ? "🔴 Désactiver"
                      : "🟢 Activer"
                  }
                  onPress={() => toggleStatus(selectedProduct.id)}
                />

                <ActionButton
                  label="🗑 Supprimer"
                  danger
                  onPress={() => deleteProduct(selectedProduct.id)}
                />

                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <Text style={styles.cancel}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ================= ADD MODAL ================= */}
          <Modal visible={showAddModal} transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>Ajouter un produit</Text>

                <TextInput
                  placeholder="Nom du produit"
                  style={styles.input}
                  value={newProduct.name}
                  onChangeText={(t) =>
                    setNewProduct({ ...newProduct, name: t })
                  }
                />

                <TextInput
                  placeholder="Prix"
                  keyboardType="numeric"
                  style={styles.input}
                  value={newProduct.price}
                  onChangeText={(t) =>
                    setNewProduct({ ...newProduct, price: t })
                  }
                />

                <TextInput
                  placeholder="Catégorie"
                  style={styles.input}
                  value={newProduct.category}
                  onChangeText={(t) =>
                    setNewProduct({ ...newProduct, category: t })
                  }
                />

                <ActionButton label="Ajouter" onPress={addProduct} />

                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancel}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ================= EDIT MODAL ================= */}
          <Modal visible={showEditModal} transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>Modifier le produit</Text>

                <TextInput
                  placeholder="Nom du produit"
                  style={styles.input}
                  value={editProduct?.name}
                  onChangeText={(t) =>
                    setEditProduct({ ...editProduct, name: t })
                  }
                />

                <TextInput
                  placeholder="Prix"
                  keyboardType="numeric"
                  style={styles.input}
                  value={String(editProduct?.price)}
                  onChangeText={(t) =>
                    setEditProduct({ ...editProduct, price: t })
                  }
                />

                <TextInput
                  placeholder="Catégorie"
                  style={styles.input}
                  value={editProduct?.category}
                  onChangeText={(t) =>
                    setEditProduct({ ...editProduct, category: t })
                  }
                />

                <ActionButton label="💾 Enregistrer" onPress={saveEditProduct} />

                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Text style={styles.cancel}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

/* ================= BUTTON ================= */

const ActionButton = ({ label, onPress, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.actionBtn,
      danger && { backgroundColor: "#fee2e2" },
    ]}
  >
    <Text
      style={[
        styles.actionText,
        danger && { color: "#b91c1c" },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8", padding: 15 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "700" },

  addBtn: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addText: { color: "#fff", fontWeight: "700" },

  filterRow: { flexDirection: "row", flexWrap: "wrap", marginVertical: 12 },
  filterBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterActive: { backgroundColor: "#FF7A00" },
  filterText: { fontSize: 13, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardInactive: { backgroundColor: "#fef2f2" },

  image: { width: 55, height: 55, borderRadius: 8, marginRight: 10 },

  name: { fontWeight: "700", fontSize: 15 },
  category: { fontSize: 13, color: "#777" },
  price: { fontSize: 14, fontWeight: "600", marginTop: 4 },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  active: { backgroundColor: "#dcfce7", color: "#166534" },
  inactive: { backgroundColor: "#fee2e2", color: "#991b1b" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },

  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  actionBtn: { paddingVertical: 14 },
  actionText: { fontSize: 16, fontWeight: "600" },

  cancel: { textAlign: "center", color: "#777", marginTop: 10 },
});
