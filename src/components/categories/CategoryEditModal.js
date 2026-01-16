import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from "react-native";

const LANGUAGES = [
  { key: 'fr', label: 'Français' },
  { key: 'en', label: 'Anglais' },
  { key: 'ar', label: 'Arabe' },
  { key: 'es', label: 'Espagnol' },
  { key: 'it', label: 'Italien' },
  { key: 'zh', label: 'Chinois' },
  { key: 'ja', label: 'Japonais' },
  { key: 'de', label: 'Allemand' },
  { key: 'pt', label: 'Portugais' },
  { key: 'ru', label: 'Russe' },
  { key: 'nl', label: 'Flamand' },
];

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

const CategoryEditModal = ({
  visible,
  editCategory,
  setEditCategory,
  menus,
  selectedMenuId,
  setSelectedMenuId,
  loadingTranslationEdit,
  onTranslate,
  onSave,
  onClose,
}) => {
  if (!editCategory || !visible) {
    return null;
  }

  //console.log("CategoryEditModal - editCategory:", editCategory);
  //console.log("CategoryEditModal - name type:", typeof editCategory.name);

  // Fonction helper pour obtenir la valeur d'un nom de langue
  const getNameValue = (langKey) => {
    if (!editCategory || !editCategory.name) return "";
    
    // Si name est une chaîne (problème), seulement retourner pour 'fr'
    if (typeof editCategory.name === 'string') {
      return langKey === 'fr' ? editCategory.name : "";
    }
    
    // Si name est un objet, retourner la valeur
    return editCategory.name[langKey] || "";
  };

  // Fonction pour gérer le changement de texte
  const handleNameChange = (langKey, text) => {
    if (!editCategory) return;

    // Normaliser name en objet
    const newName = normalizeName(editCategory.name);
    
    // Mettre à jour la valeur pour la langue spécifique
    newName[langKey] = text;
    
    // Mettre à jour l'état
    setEditCategory({
      ...editCategory,
      name: newName
    });
  };

  // Fonction pour gérer la sélection du menu
  const handleMenuSelect = (menuId) => {
    if (setSelectedMenuId) {
      setSelectedMenuId(menuId);
    }
  };

  // Fonction pour le bouton Enregistrer
  const handleSave = () => {
    //console.log("Save button clicked, final data:", editCategory);
    onSave();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.sheetTitle}>
                  Modifier la catégorie
                </Text>

                {LANGUAGES.map((lang) => (
                  <View key={lang.key} style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Nom en {lang.label} {lang.key === 'fr' && '*'}
                    </Text>
                    <TextInput
                      placeholder={`Entrez le nom en ${lang.label}`}
                      style={styles.input}
                      value={getNameValue(lang.key)}
                      onChangeText={(text) => handleNameChange(lang.key, text)}
                      returnKeyType="next"
                    />
                  </View>
                ))}

                <TouchableOpacity
                  onPress={onTranslate}
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

                <Text style={styles.label}>Sélectionner le menu *</Text>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerText}>
                    {menus.find((m) => m.id === selectedMenuId)?.title || "Aucun menu"}
                  </Text>
                  <View style={styles.menuOptionsContainer}>
                    {menus.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleMenuSelect(item.id)}
                        style={[
                          styles.pickerItem,
                          selectedMenuId === item.id && styles.pickerItemSelected,
                        ]}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedMenuId === item.id && styles.pickerItemTextSelected,
                        ]}>
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>💾 Enregistrer</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  translateBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
  },
  translateBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  translateText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 20,
  },
  pickerText: {
    padding: 12,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  menuOptionsContainer: {
    maxHeight: 150,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerItemSelected: {
    backgroundColor: "#3b82f6",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#374151",
  },
  pickerItemTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default CategoryEditModal;