import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const CategoryList = ({ categories, onSelectCategory, loading }) => {
  const renderCategoryItem = ({ item }) => {
    // console.log("Rendering category item:", item); // Vérifiez chaque item
    
    return (
      <TouchableOpacity
        style={[styles.card, !item.status && styles.cardInactive]}
        onPress={() => onSelectCategory(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {item.displayName || "Sans nom"}
          </Text>
          <Text style={styles.sub}>
            {item.totalProducts || 0} produit{item.totalProducts !== 1 ? 's' : ''}
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
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderCategoryItem}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>Aucune catégorie</Text>
          <Text style={styles.emptySub}>Ajoutez votre première catégorie</Text>
        </View>
      }
      onRefresh={() => console.log("Refreshing...")}
      refreshing={false}
      extraData={categories} // Important pour les mises à jour
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInactive: { backgroundColor: "#fef2f2", opacity: 0.8 },
  name: { 
    fontWeight: "700", 
    fontSize: 16, 
    color: "#333",
    minHeight: 24,
  },
  sub: { 
    color: "#777", 
    fontSize: 13, 
    marginTop: 2,
    minHeight: 18,
  },
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
  empty: {
    fontSize: 18,
    fontWeight: "600",
    color: "#777",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});

export default CategoryList;