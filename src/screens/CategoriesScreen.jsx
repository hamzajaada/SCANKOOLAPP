import React, { useEffect, useMemo, useState ,useContext } from "react";
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

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newCategory, setNewCategory] = useState({ name: "" });
  const [editCategory, setEditCategory] = useState(null);

  
const { user } = useContext(UserContext);

const USER_ID = user?.id;


  /* ================= FETCH ================= */

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log(USER_ID);
      
      const res = await apiPublic.get(
        `categories/getCategoriesByUser/${USER_ID}/`
      );

      const mapped = (res.data.results || []).map((c) => ({
        id: c.id,
        name: pickFR(c.name),
        status: Boolean(c.is_active),
        totalProducts: c.total_products ?? 0,
      }));

      setCategories(mapped);
    } catch (e) {
      console.log("FETCH CATEGORIES ERROR", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ACTIONS (LOCAL UI) ================= */

  const toggleStatus = (id) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: !c.status } : c
      )
    );
    setSelectedCategory(null);
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSelectedCategory(null);
  };

  const addCategory = () => {
    if (!newCategory.name) {
      alert("Nom requis");
      return;
    }

    setCategories((prev) => [
      {
        id: Date.now(),
        name: newCategory.name,
        status: true,
        totalProducts: 0,
      },
      ...prev,
    ]);

    setNewCategory({ name: "" });
    setShowAddModal(false);
    Keyboard.dismiss();
  };

  const saveEditCategory = () => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editCategory.id ? editCategory : c
      )
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
              <Text style={styles.title}>Gestion des catégories</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>

            {/* LIST */}
            <FlatList
              data={categories}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.card,
                    !item.status && styles.cardInactive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.sub}>
                      {item.totalProducts} produits
                    </Text>
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
              ListEmptyComponent={
                <Text style={styles.empty}>Aucune catégorie</Text>
              }
            />
          </View>

          {/* ================= ACTION MODAL ================= */}
          <Modal visible={!!selectedCategory} transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>
                  {selectedCategory?.name}
                </Text>

                <ActionButton
                  label="✏️ Modifier"
                  onPress={() => {
                    setEditCategory(selectedCategory);
                    setSelectedCategory(null);
                    setShowEditModal(true);
                  }}
                />

                <ActionButton
                  label={
                    selectedCategory?.status
                      ? "🔴 Désactiver"
                      : "🟢 Activer"
                  }
                  onPress={() =>
                    toggleStatus(selectedCategory.id)
                  }
                />

                <ActionButton
                  label="🗑 Supprimer"
                  danger
                  onPress={() =>
                    deleteCategory(selectedCategory.id)
                  }
                />

                <TouchableOpacity
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={styles.cancel}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ================= ADD MODAL ================= */}
          <Modal visible={showAddModal} transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>
                  Ajouter une catégorie
                </Text>

                <TextInput
                  placeholder="Nom de la catégorie"
                  style={styles.input}
                  value={newCategory.name}
                  onChangeText={(t) =>
                    setNewCategory({ name: t })
                  }
                />

                <ActionButton label="Ajouter" onPress={addCategory} />

                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancel}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ================= EDIT MODAL ================= */}
          <Modal visible={showEditModal} transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>
                  Modifier la catégorie
                </Text>

                <TextInput
                  placeholder="Nom"
                  style={styles.input}
                  value={editCategory?.name}
                  onChangeText={(t) =>
                    setEditCategory({ ...editCategory, name: t })
                  }
                />

                <ActionButton
                  label="💾 Enregistrer"
                  onPress={saveEditCategory}
                />

                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                >
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

/* ================= UI COMPONENT ================= */

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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  title: { fontSize: 22, fontWeight: "700" },

  addBtn: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addText: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardInactive: { backgroundColor: "#fef2f2" },

  name: { fontWeight: "700", fontSize: 16 },
  sub: { color: "#777", fontSize: 13, marginTop: 2 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },
  active: { backgroundColor: "#dcfce7", color: "#166534" },
  inactive: { backgroundColor: "#fee2e2", color: "#991b1b" },

  empty: { textAlign: "center", marginTop: 50, color: "#777" },

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
