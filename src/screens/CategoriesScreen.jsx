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
  ScrollView,
} from "react-native";
import MenuBar from "../components/MenuBar";
import apiPublic from "../api/apiPublic";
import apiPrivate from "../api/apiPrivate";
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

  const [newCategory, setNewCategory] = useState({
    name: {
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
      nl: ""
    },
    description: {
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
      nl: ""
    }
  });
  const [editCategory, setEditCategory] = useState(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [loadingTranslationEdit, setLoadingTranslationEdit] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [menus, setMenus] = useState([]);
const [selectedMenuId, setSelectedMenuId] = useState(null);


  
const { user } = useContext(UserContext);

const USER_ID = user?.id;


  /* ================= FETCH ================= */

  const fetchMenus = async () => {
  try {
    const res = await apiPrivate.get(
      `/menu/getMenusByUser/${USER_ID}/`
    );

    const results = res.data.results || [];

 
    setMenus(results);

    // ✅ menu par défaut (premier)
    if (results.length > 0) {
      setSelectedMenuId(results[0].id);
    }
  } catch (error) {
    console.log(
      "FETCH MENUS ERROR",
      error.response?.data || error.message
    );
  }
};


  const fetchCategories = async () => {
    try {
      setLoading(true);

      
      const res = await apiPublic.get(
        `categories/getCategoriesByUser/${USER_ID}/`
      );

      const mapped = (res.data.results || []).map((c) => ({
        id: c.id,
        name: pickFR(c.name),
        status: Boolean(c.is_active),
        totalProducts: c.total_products ?? 0,
      }));
 console.log(mapped);
 
      setCategories(mapped);
    } catch (e) {
      console.log("FETCH CATEGORIES ERROR", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     fetchMenus();
    fetchCategories();
  }, []);

  /* ================= ACTIONS (LOCAL UI) ================= */

  const toggleStatus = async (id) => {
    try {
      const category = categories.find((c) => c.id === id);
      if (!category) return;

      const newStatus = !category.status;
      await apiPrivate.patch(`/categories/${id}/`, { is_active: newStatus });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: newStatus } : c
        )
      );
      setSelectedCategory(null);
    } catch (error) {
      console.log("TOGGLE STATUS ERROR", error.response?.data || error.message);
      alert("Erreur lors de la modification du statut");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await apiPrivate.delete(`/categories/${id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSelectedCategory(null);
    } catch (error) {
      console.log("DELETE CATEGORY ERROR", error.response?.data || error.message);
      alert("Erreur lors de la suppression de la catégorie");
    }
  };

 const fetchTranslations = async () => {
  if (!newCategory.name.fr.trim()) return;
  setLoadingTranslation(true);

  try {
    const response = await apiPrivate.post(
      "categories/translate/",
      { fr: newCategory.name.fr }
    );

    if (response.status === 200) {
      const translations = response.data;

      setNewCategory((prev) => ({
        ...prev,
        name: {
          ...prev.name,
          fr: translations.fr || prev.name.fr,
          en: translations.en || "",
          ar: translations.ar || "",
          es: translations.es || "",
          it: translations.it || "",
          zh: translations.zh || "",
          ja: translations.ja || "",
          de: translations.de || "",
          pt: translations.pt || "",
          ru: translations.ru || "",
          nl: translations.nl || "",
        },
      }));
    }
  } catch (error) {
    console.error("Translation error:", error);
  } finally {
    setLoadingTranslation(false);
  }
};

const fetchTranslationsEdit = async () => {
  if (!editCategory?.name?.fr?.trim()) return;
  setLoadingTranslationEdit(true);

  try {
    const response = await apiPrivate.post(
      "categories/translate/",
      { fr: editCategory.name.fr }
    );

    if (response.status === 200) {
      const translations = response.data;

      setEditCategory((prev) => ({
        ...prev,
        name: {
          ...prev.name,
          fr: translations.fr || prev.name.fr,
          en: translations.en || "",
          ar: translations.ar || "",
          es: translations.es || "",
          it: translations.it || "",
          zh: translations.zh || "",
          ja: translations.ja || "",
          de: translations.de || "",
          pt: translations.pt || "",
          ru: translations.ru || "",
          nl: translations.nl || "",
        },
      }));
    }
  } catch (error) {
    console.error("Translation error:", error);
  } finally {
    setLoadingTranslationEdit(false);
  }
};

 const addCategory = async () => {
  if (!newCategory.name.fr) {
    alert("Nom requis");
    return;
  }

  if (!selectedMenuId) {
    alert("Aucun menu sélectionné");
    return;
  }

  try {
    const payload = {
      name: newCategory.name,
      description: newCategory.description,
      sort_index: 0,
      is_active: true,
      menu: selectedMenuId,
    };

    const res = await apiPrivate.post("/categories/", payload);

    const created = res.data;

    setCategories((prev) => [
      {
        id: created.id,
        name: pickFR(created.name),
        status: Boolean(created.is_active),
        totalProducts: created.total_products ?? 0,
      },
      ...prev,
    ]);

    setNewCategory({
      name: {
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
        nl: ""
      },
      description: {
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
        nl: ""
      }
    });
    setShowAddModal(false);
    Keyboard.dismiss();
  } catch (error) {
    console.log(
      "ADD CATEGORY ERROR",
      error.response?.data || error.message
    );
    alert("Erreur lors de l’ajout de la catégorie");
  }
};



const saveEditCategory = async () => {
  if (!editCategory?.name?.fr) {
    alert("Nom requis");
    return;
  }

  if (!selectedMenuId) {
    alert("Menu introuvable");
    return;
  }

  try {
    const payload = {
      name: editCategory.name,
      description: editCategory.description,
      sort_index: 0,
      is_active: editCategory.status ?? true,
      menu: selectedMenuId, // ✅ MENU REEL OBLIGATOIRE
    };

    const res = await apiPrivate.put(
      `/categories/${editCategory.id}/`,
      payload
    );

    const updated = res.data;

    // ✅ MAJ LISTE LOCALE APRÈS SUCCÈS API
    setCategories((prev) =>
      prev.map((c) =>
        c.id === updated.id
          ? {
              id: updated.id,
              name: pickFR(updated.name),
              status: Boolean(updated.is_active),
              totalProducts: updated.total_products ?? c.totalProducts,
            }
          : c
      )
    );

    setShowEditModal(false);
    setEditCategory(null);
    Keyboard.dismiss();
  } catch (error) {
    console.log(
      "UPDATE CATEGORY ERROR",
      error.response?.data || error.message
    );
    alert("Erreur lors de la modification");
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
            <TouchableWithoutFeedback onPress={() => setSelectedCategory(null)}>
              <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.sheet}>
                    <Text style={styles.sheetTitle}>
                      {selectedCategory?.name}
                    </Text>

                    <ActionButton
                      label="✏️ Modifier"
                      onPress={() => {
                        setEditCategory({
                          ...selectedCategory,
                          name: {
                            fr: selectedCategory.name,
                            en: "",
                            ar: "",
                            es: "",
                            it: "",
                            zh: "",
                            ja: "",
                            de: "",
                            pt: "",
                            ru: "",
                            nl: ""
                          },
                          description: {
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
                            nl: ""
                          }
                        });
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
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* ================= ADD MODAL ================= */}
          <Modal visible={showAddModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setShowAddModal(false)}>
              <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.sheet}>
                    <Text style={styles.sheetTitle}>
                      Ajouter une catégorie
                    </Text>

                    <TextInput
                      placeholder="Nom de la catégorie (Français)"
                      style={styles.input}
                      value={newCategory.name.fr}
                      onChangeText={(t) =>
                        setNewCategory({
                          ...newCategory,
                          name: { ...newCategory.name, fr: t }
                        })
                      }
                    />

                    <TouchableOpacity
                      onPress={fetchTranslations}
                      disabled={loadingTranslation}
                      style={[
                        styles.translateBtn,
                        loadingTranslation && styles.translateBtnDisabled,
                      ]}
                    >
                      <Text style={styles.translateText}>
                        {loadingTranslation ? "Traduction..." : "Traduire avec IA"}
                      </Text>
                    </TouchableOpacity>

                    <ActionButton label="Ajouter" onPress={addCategory} />

                    <TouchableOpacity
                      onPress={() => setShowAddModal(false)}
                    >
                      <Text style={styles.cancel}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* ================= EDIT MODAL ================= */}
          <Modal visible={showEditModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
              <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.sheet}>
                    <Text style={styles.sheetTitle}>
                      Modifier la catégorie
                    </Text>

                    <ScrollView style={{ maxHeight: 400 }}>
                      <Text style={styles.label}>Nom en Français</Text>
                      <TextInput
                        placeholder="Entrez le nom en Français"
                        style={styles.input}
                        value={editCategory?.name?.fr || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, fr: t }
                          })
                        }
                      />

                      <TouchableOpacity
                        onPress={fetchTranslationsEdit}
                        disabled={loadingTranslationEdit}
                        style={[
                          styles.translateBtn,
                          loadingTranslationEdit && styles.translateBtnDisabled,
                        ]}
                      >
                        <Text style={styles.translateText}>
                          {loadingTranslationEdit ? "Traduction..." : "Traduire avec IA"}
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.label}>Nom en Anglais</Text>
                      <TextInput
                        placeholder="Entrez le nom en Anglais"
                        style={styles.input}
                        value={editCategory?.name?.en || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, en: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Arabe</Text>
                      <TextInput
                        placeholder="Entrez le nom en Arabe"
                        style={styles.input}
                        value={editCategory?.name?.ar || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, ar: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Espagnol</Text>
                      <TextInput
                        placeholder="Entrez le nom en Espagnol"
                        style={styles.input}
                        value={editCategory?.name?.es || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, es: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Italien</Text>
                      <TextInput
                        placeholder="Entrez le nom en Italien"
                        style={styles.input}
                        value={editCategory?.name?.it || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, it: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Chinois</Text>
                      <TextInput
                        placeholder="Entrez le nom en Chinois"
                        style={styles.input}
                        value={editCategory?.name?.zh || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, zh: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Japonais</Text>
                      <TextInput
                        placeholder="Entrez le nom en Japonais"
                        style={styles.input}
                        value={editCategory?.name?.ja || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, ja: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Flamand</Text>
                      <TextInput
                        placeholder="Entrez le nom en Flamand"
                        style={styles.input}
                        value={editCategory?.name?.nl || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, nl: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Allemand</Text>
                      <TextInput
                        placeholder="Entrez le nom en Allemand"
                        style={styles.input}
                        value={editCategory?.name?.de || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, de: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Portugais</Text>
                      <TextInput
                        placeholder="Entrez le nom en Portugais"
                        style={styles.input}
                        value={editCategory?.name?.pt || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, pt: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Nom en Russe</Text>
                      <TextInput
                        placeholder="Entrez le nom en Russe"
                        style={styles.input}
                        value={editCategory?.name?.ru || ""}
                        onChangeText={(t) =>
                          setEditCategory({
                            ...editCategory,
                            name: { ...editCategory.name, ru: t }
                          })
                        }
                      />

                      <Text style={styles.label}>Sélectionner le menu</Text>
                      <View style={styles.pickerContainer}>
                        <Text style={styles.pickerText}>
                          {menus.find(m => m.id === selectedMenuId)?.title || "Aucun menu"}
                        </Text>
                        <FlatList
                          data={menus}
                          keyExtractor={(item) => String(item.id)}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              onPress={() => setSelectedMenuId(item.id)}
                              style={styles.pickerItem}
                            >
                              <Text style={styles.pickerItemText}>{item.title}</Text>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </ScrollView>

                    <ActionButton
                      label={loadingEdit ? "Enregistrement..." : "💾 Enregistrer"}
                      onPress={saveEditCategory}
                      disabled={loadingEdit}
                    />

                    <TouchableOpacity
                      onPress={() => setShowEditModal(false)}
                    >
                      <Text style={styles.cancel}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
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
    backgroundColor: "#FF7A40",
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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

  translateBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  translateBtnDisabled: {
    backgroundColor: "#ccc",
  },
  translateText: {
    color: "#fff",
    fontWeight: "600",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 5,
  },

  pickerContainer: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 10,
  },

  pickerText: {
    padding: 12,
    fontSize: 16,
    color: "#374151",
  },

  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  pickerItemText: {
    fontSize: 16,
    color: "#374151",
  },
});
