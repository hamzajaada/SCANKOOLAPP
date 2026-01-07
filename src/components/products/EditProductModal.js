import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView,
  TouchableWithoutFeedback, Keyboard, StyleSheet, Image, Alert, ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";

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
const EditProductModal = ({
  visible,
  product,  // { id, name, description, price, categoryId, image, categoryName }
  categories,
  loadingTranslation,
  onTranslate,
  onUpdate,  // Replacement for onAdd
  onClose,
  onAddCategory,
  isSubmitting = false,
}) => {
  // Local state for editing (independent of parent)
  const [editName, setEditName] = useState({});
  const [editDescription, setEditDescription] = useState({});
  const [editPrice, setEditPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);

  // Load product data on open
  useEffect(() => {
    if (visible && product) {
      console.log("🖋️ Loading product:", product.id);
      
      // Parse JSON fields safely
      const nameObj = typeof product.name === 'string' ? { fr: product.name } : product.name || {};
      const descObj = typeof product.description === 'string' ? { fr: product.description } : product.description || {};
      
      setEditName(nameObj);
      setEditDescription(descObj);      
      setEditPrice(product.price?.toString() || "");
      setEditCategoryId(product.categoryId);
      setOriginalImage(product.image);
      setEditImage(product.image ? { uri: product.image } : null);
    }
  }, [visible, product]);

  // Image picker (same as Add)
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Accès galerie nécessaire");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setEditImage({
        uri: asset.uri,
        type: "image/jpeg",
        name: `product_${Date.now()}.jpg`,
      });
    }
  };

  // Update product (PATCH)
const handleUpdate = () => {
  if (!editName.fr || !editPrice || !editCategoryId) {
    Alert.alert("Erreur", "Champs obligatoires manquants");
    return;
  }

  onUpdate({
    id: product.id,
    name: editName,
    description: editDescription,
    price: editPrice,
    categoryId: editCategoryId,
    image: editImage, // may be { uri } or null
  });
};


  return (
    <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>

              <TouchableOpacity
      style={StyleSheet.absoluteFill}
      activeOpacity={1}
      onPress={() => {
        Keyboard.dismiss();
        onClose();
      }}
    />

            <View style={styles.sheet}>
              <ScrollView style={{ maxHeight: 500 }} 
              showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

                <Text style={styles.sheetTitle}>Modifier le produit</Text>

                {/* IMAGE */}
                <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                  {editImage ? (
                    <Image source={{ uri: editImage.uri }} style={styles.imagePreview} />
                  ) : (
                    <Text style={styles.imageBtnText}>📷 Changer l'image</Text>
                  )}
                </TouchableOpacity>

                {/* NAME FIELDS (same as Add) */}
                {LANGUAGES.map((lang) => (
                  <View key={lang.key} style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Nom en {lang.label} {lang.key === 'fr' && '*'}
                    </Text>
                    <TextInput
                      placeholder={`Nom en ${lang.label}`}
                      style={styles.input}
                      value={editName[lang.key] || ""}
                      onChangeText={(text) => setEditName(prev => ({ ...prev, [lang.key]: text }))}
                    />
                  </View>
                ))}

                {/* DESCRIPTION FIELDS (same) */}
                {LANGUAGES.map((lang) => (
                  <View key={lang.key} style={styles.inputGroup}>
                    <Text style={styles.label}>Description en {lang.label}</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={editDescription[lang.key] || ""}
                      onChangeText={(text) => setEditDescription(prev => ({ ...prev, [lang.key]: text }))}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                ))}

                {/* TRANSLATE BUTTON (same) */}
                <TouchableOpacity
                  onPress={onTranslate}
                  disabled={loadingTranslation}
                  style={[styles.translateBtn, loadingTranslation && styles.translateBtnDisabled]}
                >
                  <Text style={styles.translateText}>
                    {loadingTranslation ? "Traduction..." : "Retraduire avec IA"}
                  </Text>
                </TouchableOpacity>

                {/* PRICE */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Prix (MAD) *</Text>
                  <TextInput
                    placeholder="Ex: 45.99"
                    style={styles.input}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* CATEGORY (same picker logic) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Catégorie *</Text>
                  <TouchableOpacity
                    style={styles.categorySelector}
                    onPress={() => setShowCategoryPicker(true)}
                  >
                    <Text style={styles.categorySelectorText}>
                      {editCategoryId 
                        ? categories.find(c => c.id === editCategoryId)?.name || "Sélectionner"
                        : "Sélectionner une catégorie"
                      }
                    </Text>
                    <Text style={styles.arrow}>▼</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* ACTION BUTTONS */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={onClose}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} 
                  onPress={handleUpdate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Mettre à jour</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Category picker modal (copy from AddModal) */}
               {/* CATEGORY PICKER MODAL */}
                          <Modal visible={showCategoryPicker} transparent animationType="fade">
                            <TouchableWithoutFeedback onPress={() => setShowCategoryPicker(false)}>
                              <View style={styles.pickerOverlay}>
                                <View style={styles.pickerContainer}>
                                  <Text style={styles.pickerTitle}>Sélectionner une catégorie</Text>
                                  <ScrollView style={styles.pickerScroll}>
                                    {categories.map((category) => (
                                      <TouchableOpacity
                                        key={category.id}
                                        style={[
                                          styles.pickerItem,
                                          editCategoryId === category.id && styles.pickerItemSelected,
                                        ]}
                                        onPress={() => {
                                          setEditCategoryId(category.id);
                                          setShowCategoryPicker(false);
                                        }}
                                      >
                                        <Text style={[
                                          styles.pickerItemText,
                                          editCategoryId === category.id && styles.pickerItemTextSelected,
                                        ]}>
                                          {category.name}
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </ScrollView>
                                  <TouchableOpacity
                                    style={styles.pickerCancelBtn}
                                    onPress={() => setShowCategoryPicker(false)}
                                  >
                                    <Text style={styles.pickerCancelText}>Annuler</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </TouchableWithoutFeedback>
                          </Modal>
            </View>
        </View>
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
  imageBtn: {
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  imageBtnText: {
    color: "#6b7280",
    fontSize: 14,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  categorySelectorText: {
    fontSize: 16,
    color: "#374151",
  },
  arrow: {
    color: "#6b7280",
    fontSize: 12,
  },
  addCategoryBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addCategoryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "80%",
    maxHeight: "60%",
    padding: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  pickerScroll: {
    maxHeight: 200,
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
  pickerCancelBtn: {
    padding: 12,
    marginTop: 10,
    alignItems: "center",
  },
  pickerCancelText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
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
  saveButton: {
    flex: 2,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default EditProductModal;
