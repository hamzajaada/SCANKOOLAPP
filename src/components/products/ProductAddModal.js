import React, { useState } from "react";
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
  Image,
  Alert,
  ActivityIndicator,
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

const ProductAddModal = ({
  visible,
  productName,
  setProductName,
  productDescription,
  setProductDescription,
  productPrice,
  setProductPrice,
  productCategoryId,
  setProductCategoryId,
  productImage,
  setProductImage,
  categories,
  loadingTranslation,
  onTranslate,
  onAdd,
  onClose,
  onAddCategory,
  isSubmitting = false,
}) => {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire");
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
      setProductImage({
        uri: asset.uri,
        type: "image/jpeg",
        name: `product_${Date.now()}.jpg`,
      });
    }
  };

  const handleAdd = () => {
    if (!productName.fr || !productPrice || !productCategoryId) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }
    onAdd();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.sheetTitle}>
                  Ajouter un produit
                </Text>

                {/* PRODUCT IMAGE */}
                <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                  {productImage ? (
                    <Image source={{ uri: productImage.uri }} style={styles.imagePreview} />
                  ) : (
                    <Text style={styles.imageBtnText}>📷 Ajouter une image</Text>
                  )}
                </TouchableOpacity>

                {/* PRODUCT NAME */}
                {LANGUAGES.map((lang) => (
                  <View key={lang.key} style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Nom en {lang.label} {lang.key === 'fr' && '*'}
                    </Text>
                    <TextInput
                      placeholder={`Entrez le nom en ${lang.label}`}
                      style={styles.input}
                      value={productName[lang.key] || ""}
                      onChangeText={(text) =>
                        setProductName(prev => ({ ...prev, [lang.key]: text }))
                      }
                      returnKeyType="next"
                    />
                  </View>
                ))}

                {/* PRODUCT DESCRIPTION */}
                {LANGUAGES.map((lang) => (
                  <View key={lang.key} style={styles.inputGroup}>
                    <Text style={styles.label}>Description en {lang.label}</Text>
                    <TextInput
                      placeholder={`Description en ${lang.label}`}
                      style={[styles.input, styles.textArea]}
                      value={productDescription[lang.key] || ""}
                      onChangeText={(text) =>
                        setProductDescription(prev => ({ ...prev, [lang.key]: text }))
                      }
                      multiline
                      numberOfLines={3}
                      returnKeyType="next"
                    />
                  </View>
                ))}

                {/* TRANSLATE BUTTON */}
                <TouchableOpacity
                  onPress={onTranslate}
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

                {/* PRICE */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Prix (MAD) *</Text>
                  <TextInput
                    placeholder="Ex: 45.99"
                    style={styles.input}
                    value={productPrice}
                    onChangeText={setProductPrice}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                  />
                </View>

                {/* CATEGORY SELECTION */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Catégorie *</Text>
                  <TouchableOpacity
                    style={styles.categorySelector}
                    onPress={() => setShowCategoryPicker(true)}
                  >
                    <Text style={styles.categorySelectorText}>
                      {productCategoryId 
                        ? categories.find(c => c.id === productCategoryId)?.name || "Sélectionner une catégorie"
                        : "Sélectionner une catégorie"
                      }
                    </Text>
                    <Text style={styles.arrow}>▼</Text>
                  </TouchableOpacity>
                  
                  {categories.length === 0 && (
                    <TouchableOpacity style={styles.addCategoryBtn} onPress={onAddCategory}>
                      <Text style={styles.addCategoryBtnText}>+ Ajouter une catégorie</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

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
                              productCategoryId === category.id && styles.pickerItemSelected,
                            ]}
                            onPress={() => {
                              setProductCategoryId(category.id);
                              setShowCategoryPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.pickerItemText,
                              productCategoryId === category.id && styles.pickerItemTextSelected,
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
                  style={[
                    styles.saveButton,
                    isSubmitting && styles.saveButtonDisabled
                  ]} 
                  onPress={handleAdd}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Ajouter</Text>
                  )}
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

export default ProductAddModal;