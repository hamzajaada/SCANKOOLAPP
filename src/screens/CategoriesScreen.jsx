import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import MenuBar from "../components/MenuBar";
import apiPublic from "../api/apiPublic";
import apiPrivate from "../api/apiPrivate";
import { UserContext } from "../context/UserContext";

// Composants modulaires
import CategoryList from "../components/categories/CategoryList";
import CategoryActionModal from "../components/categories/CategoryActionModal";
import CategoryAddModal from "../components/categories/CategoryAddModal";
import CategoryEditModal from "../components/categories/CategoryEditModal";

/* ================= HELPERS ================= */

const pickFR = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.fr || "";
};

// Fonction helper pour normaliser name (convertir string en objet si nécessaire)
const normalizeName = (name) => {
  if (!name) return {};
  if (typeof name === 'string') {
    return { fr: name };
  }
  if (typeof name === 'object') {
    return { ...name };
  }
  return {};
};

// Fonction helper pour obtenir le nom français depuis name
const getNameFR = (name) => {
  if (!name) return "";
  if (typeof name === 'string') {
    return name;
  }
  if (typeof name === 'object' && name.fr) {
    return name.fr;
  }
  return "";
};

/* ================= SCREEN ================= */

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [categoryName, setCategoryName] = useState({
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

  const [editCategory, setEditCategory] = useState(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [loadingTranslationEdit, setLoadingTranslationEdit] = useState(false);
  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  const { user } = useContext(UserContext);
  const USER_ID = user?.id;

  /* ================= FETCH ================= */

  const fetchMenus = async () => {
    try {
      const res = await apiPrivate.get(`/menu/getMenusByUser/${USER_ID}/`);
      const results = res.data.results || [];
      setMenus(results);

      if (results.length > 0) {
        setSelectedMenuId(results[0].id);
      }
    } catch (error) {
      //console.log("FETCH MENUS ERROR", error.response?.data || error.message);
      alert("Erreur lors du chargement des menus");
    }
  };

  const fetchCategories = async () => {
    //console.log("Fetching categories...");
    
    try {
      setLoading(true);

      const res = await apiPrivate.get(
        `categories/getCategoriesByUser/${USER_ID}/`
      );

      //console.log("API Response:", res.data);
      
      const mapped = (res.data.results || []).map((c) => {
        // Debug: Voir la structure de chaque catégorie
        console.log("Raw category data:", {
          id: c.id,
          name: c.name,
          typeOfName: typeof c.name,
          nameIsString: typeof c.name === 'string',
          nameIsObject: typeof c.name === 'object'
        });

        // Gérer le cas où name est une chaîne
        let nameObj;
        if (typeof c.name === 'string') {
          // Si name est une chaîne, créer un objet avec seulement fr
          nameObj = { fr: c.name };
        } else {
          // Sinon, utiliser l'objet existant ou un objet vide
          nameObj = c.name || {};
        }

        return {
          id: c.id,
          name: nameObj,
          displayName: pickFR(nameObj),
          status: Boolean(c.is_active),
          totalProducts: c.total_products ?? 0,
          menuId: c.menu,
        };
      });

      //console.log("Mapped categories:", mapped);
      setCategories(mapped);
      
    } catch (e) {
      //console.log("FETCH CATEGORIES ERROR:", e.message, e.response?.data);
      alert("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  /* ================= ACTIONS ================= */

  const toggleStatus = async (id) => {
    try {
      const category = categories.find((c) => c.id === id);
      if (!category) return;

      const newStatus = !category.status;
      await apiPrivate.patch(`/categories/${id}/`, { is_active: newStatus });

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      setSelectedCategory(null);
      alert(`Catégorie ${newStatus ? 'activée' : 'désactivée'} avec succès`);
    } catch (error) {
      //console.log("TOGGLE STATUS ERROR", error.response?.data || error.message);
      alert("Erreur lors de la modification du statut");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await apiPrivate.delete(`/categories/${id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSelectedCategory(null);
      alert("Catégorie supprimée avec succès");
    } catch (error) {
      //console.log("DELETE CATEGORY ERROR", error.response?.data || error.message);
      alert("Erreur lors de la suppression de la catégorie");
    }
  };

  const fetchTranslations = async () => {
    if (!categoryName.fr.trim()) {
      alert("Veuillez d'abord saisir un nom en français");
      return;
    }

    setLoadingTranslation(true);
    try {
      const response = await apiPrivate.post("categories/translate/", {
        fr: categoryName.fr,
      });

      if (response.status === 200) {
        const translations = response.data;
        setCategoryName((prev) => ({
          ...prev,
          fr: translations.fr || prev.fr,
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
        }));
        alert("Traduction terminée");
      }
    } catch (err) {
      console.error("Translation error:", err);
      alert("Erreur lors de la traduction");
    } finally {
      setLoadingTranslation(false);
    }
  };

  const fetchTranslationsEdit = async () => {
    const frName = getNameFR(editCategory?.name);
    
    if (!frName?.trim()) {
      alert("Veuillez d'abord saisir un nom en français");
      return;
    }
    
    setLoadingTranslationEdit(true);

    try {
      const response = await apiPrivate.post("categories/translate/", {
        fr: frName,
      });

      if (response.status === 200) {
        const translations = response.data;
        setEditCategory((prev) => {
          const currentName = normalizeName(prev.name);
          
          return {
            ...prev,
            name: {
              ...currentName,
              fr: translations.fr || currentName.fr || "",
              en: translations.en || currentName.en || "",
              ar: translations.ar || currentName.ar || "",
              es: translations.es || currentName.es || "",
              it: translations.it || currentName.it || "",
              zh: translations.zh || currentName.zh || "",
              ja: translations.ja || currentName.ja || "",
              de: translations.de || currentName.de || "",
              pt: translations.pt || currentName.pt || "",
              ru: translations.ru || currentName.ru || "",
              nl: translations.nl || currentName.nl || "",
            },
          };
        });
        alert("Traduction terminée");
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Erreur lors de la traduction");
    } finally {
      setLoadingTranslationEdit(false);
    }
  };

  const addCategory = async () => {
    console.log("Adding category with data:", {
      name: categoryName,
      menu: selectedMenuId
    });

    if (!categoryName.fr) {
      alert("Nom requis");
      return;
    }

    if (!selectedMenuId) {
      alert("Aucun menu sélectionné");
      return;
    }

    try {
      const payload = {
        name: categoryName,
        description: "Description",
        sort_index: 0,
        is_active: true,
        menu: selectedMenuId,
      };

      //console.log("Sending payload:", payload);
      
      const res = await apiPrivate.post("/categories/", payload);
      //console.log("API Response:", res.data);
      
      const created = res.data;

      // CORRECTION : Utiliser la bonne structure
      const newCategory = {
        id: created.id,
        name: created.name || categoryName,
        displayName: pickFR(created.name || categoryName),
        status: Boolean(created.is_active),
        totalProducts: created.total_products ?? 0,
        menuId: created.menu,
      };

      //console.log("New category object:", newCategory);
      
      // Ajouter à la liste
      setCategories((prev) => [newCategory, ...prev]);

      // Réinitialiser le formulaire
      setCategoryName({
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
      
      setShowAddModal(false);
      alert("Catégorie ajoutée avec succès");
      
      // Rafraîchir la liste
      fetchCategories();
      
    } catch (error) {
      //console.log("ADD CATEGORY ERROR:", error.response?.data || error.message);
      alert(`Erreur: ${error.response?.data?.message || "Échec de l'ajout"}`);
    }
  };

  const saveEditCategory = async () => {
    //console.log("Saving edit category:", editCategory);
    
    if (!editCategory) {
      alert("Aucune catégorie à modifier");
      return;
    }

    // Vérifier que name est un objet et a au moins fr
    const nameToSend = editCategory.name || {};
    if (!nameToSend.fr || nameToSend.fr.trim() === "") {
      alert("Le nom en français est requis");
      return;
    }

    if (!selectedMenuId) {
      alert("Menu introuvable");
      return;
    }

    try {
      const payload = {
        name: nameToSend,
        description: "Description",
        sort_index: 0,
        is_active: editCategory.status ?? true,
        menu: selectedMenuId,
      };

      //console.log("Sending update payload:", payload);

      const res = await apiPrivate.put(`/categories/${editCategory.id}/`, payload);
      const updated = res.data;

      // Mettre à jour la liste avec la structure correcte
      const updatedCategory = {
        id: updated.id,
        name: updated.name || nameToSend,
        displayName: pickFR(updated.name || nameToSend),
        status: Boolean(updated.is_active),
        totalProducts: updated.total_products ?? 0,
        menuId: updated.menu,
      };

      setCategories((prev) =>
        prev.map((c) =>
          c.id === updated.id ? updatedCategory : c
        )
      );

      setShowEditModal(false);
      setEditCategory(null);
      alert("Catégorie modifiée avec succès");
      
      // Rafraîchir pour être sûr
      fetchCategories();
      
    } catch (error) {
      //console.log("UPDATE CATEGORY ERROR", error.response?.data || error.message);
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
    <TouchableWithoutFeedback>
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

            {/* CATEGORY LIST */}
            <CategoryList
              categories={categories}
              onSelectCategory={setSelectedCategory}
            />
          </View>

          {/* MODALS */}
          <CategoryActionModal
            visible={!!selectedCategory}
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
            onEdit={() => {
              //console.log("Opening edit for category:", selectedCategory);
              
              // Préparer la catégorie pour l'édition
              const categoryToEdit = {
                ...selectedCategory,
                name: normalizeName(selectedCategory.name),
              };
              
              //console.log("Category to edit:", categoryToEdit);
              
              setEditCategory(categoryToEdit);
              setSelectedMenuId(selectedCategory.menuId);
              setSelectedCategory(null);
              setShowEditModal(true);
            }}
            onToggleStatus={() => toggleStatus(selectedCategory?.id)}
            onDelete={() => deleteCategory(selectedCategory?.id)}
          />

          <CategoryAddModal
            visible={showAddModal}
            categoryName={categoryName}
            setCategoryName={setCategoryName}
            menus={menus}
            selectedMenuId={selectedMenuId}
            setSelectedMenuId={setSelectedMenuId}
            loadingTranslation={loadingTranslation}
            onTranslate={fetchTranslations}
            onAdd={addCategory}
            onClose={() => setShowAddModal(false)}
          />

          <CategoryEditModal
            visible={showEditModal}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
            menus={menus}
            selectedMenuId={selectedMenuId}
            setSelectedMenuId={setSelectedMenuId}
            loadingTranslationEdit={loadingTranslationEdit}
            onTranslate={fetchTranslationsEdit}
            onSave={saveEditCategory}
            onClose={() => setShowEditModal(false)}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

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
}); 