import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

const CategoryActionModal = ({
  visible,
  category,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (!category) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Header avec titre et statut */}
              <View style={styles.header}>
                <View style={styles.titleContainer}>
                  <Text style={styles.sheetTitle} numberOfLines={2}>
                    {category.displayName || "Catégorie"}
                  </Text>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        category.status ? styles.statusActive : styles.statusInactive,
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {category.status ? "Actif" : "Inactif"}
                    </Text>
                  </View>
                </View>
                {category.totalProducts !== undefined && (
                  <Text style={styles.productCount}>
                    {category.totalProducts} produit{category.totalProducts > 1 ? "s" : ""}
                  </Text>
                )}
              </View>

              {/* Séparateur */}
              <View style={styles.separator} />

              {/* Boutons d'action */}
              <View style={styles.actionsContainer}>
                <ActionButton
                  icon="✏️"
                  label="Modifier"
                  onPress={onEdit}
                  color="#3b82f6"
                />
                
                <ActionButton
                  icon={category.status ? "🔴" : "🟢"}
                  label={category.status ? "Désactiver" : "Activer"}
                  onPress={onToggleStatus}
                  color={category.status ? "#f59e0b" : "#10b981"}
                />
                
                <ActionButton
                  icon="🗑️"
                  label="Supprimer"
                  onPress={onDelete}
                  danger
                />
              </View>
              
              {/* Bouton Annuler */}
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const ActionButton = ({ icon, label, onPress, color, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.actionBtn,
      danger && styles.dangerBtn,
      color && !danger && { borderLeftColor: color },
    ]}
    activeOpacity={0.7}
  >
    <View style={styles.actionContent}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text
        style={[
          styles.actionText,
          danger && styles.dangerText,
          color && !danger && { color },
        ]}
      >
        {label}
      </Text>
    </View>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 24,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  header: {
    padding: 24,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 28,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: "#10b981",
  },
  statusInactive: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  productCount: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 24,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#e5e7eb",
  },
  dangerBtn: {
    backgroundColor: "#fef2f2",
    borderLeftColor: "#ef4444",
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  dangerText: {
    color: "#dc2626",
  },
  arrow: {
    fontSize: 24,
    color: "#9ca3af",
    fontWeight: "300",
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
});

export default CategoryActionModal;