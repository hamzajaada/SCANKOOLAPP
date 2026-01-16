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

const CategoryAddModal = ({
  visible,
  categoryName,
  setCategoryName,
  menus,
  selectedMenuId,
  setSelectedMenuId,
  loadingTranslation,
  onTranslate,
  onAdd,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <ScrollView style={{ maxHeight: 400 }}>
                <Text style={styles.sheetTitle}>
                  Ajouter une catégorie
                </Text>

                {LANGUAGES.map((lang) => (
                  <View key={lang.key} style={styles.inputGroup}>
                    <Text style={styles.label}>Nom en {lang.label}</Text>
                    <TextInput
                      placeholder={`Entrez le nom en ${lang.label}`}
                      style={styles.input}
                      value={categoryName[lang.key]}
                      onChangeText={(text) =>
                        setCategoryName((prev) => ({ ...prev, [lang.key]: text }))
                      }
                    />
                  </View>
                ))}

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

                <Text style={styles.label}>Sélectionner le menu</Text>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerText}>
                    {menus.find((m) => m.id === selectedMenuId)?.title ||
                      "Aucun menu"}
                  </Text>
                  {menus.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setSelectedMenuId(item.id)}
                      style={[
                        styles.pickerItem,
                        item.id === selectedMenuId && styles.pickerItemSelected,
                      ]}
                    >
                      <Text style={styles.pickerItemText}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.addButton} onPress={onAdd}>
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancel}>Annuler</Text>
              </TouchableOpacity>
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
    fontSize: 18,
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
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  translateBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
  },
  translateBtnDisabled: {
    backgroundColor: "#ccc",
  },
  translateText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pickerText: {
    padding: 12,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  pickerItem: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  pickerItemSelected: {
    backgroundColor: "#e0e7ff",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#374151",
  },
  addButton: {
    backgroundColor: "#FF7A40",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    padding: 10,
    marginTop: 10,
  },
  cancel: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },
});

export default CategoryAddModal;