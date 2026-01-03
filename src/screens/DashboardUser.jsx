import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import apiPrivate from '../api/apiPrivate';
import MenuBar from '../components/MenuBar';
import * as SecureStore from 'expo-secure-store';



/* ===================== HELPERS ===================== */

const readSecureStore = async () => {
  const user = await SecureStore.getItemAsync('user');
  const token = await SecureStore.getItemAsync('token');


};



// Normalise les réponses backend (DRF / array / legacy)
const normalizeListResponse = (data) => {
  if (data?.results && Array.isArray(data.results)) {
    return { items: data.results, total: data.count ?? data.results.length };
  }
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  if (data?.data && Array.isArray(data.data)) {
    return { items: data.data, total: data.total ?? data.data.length };
  }
  return { items: [], total: 0 };
};

// Récupère toutes les pages DRF
const fetchAll = async (relativeUrl) => {
  let url = relativeUrl;
  let allItems = [];

  while (url) {
    const res = await apiPrivate.get(url);

    const { items } = normalizeListResponse(res.data);
    allItems.push(...items);

    // pagination DRF
    if (res.data?.next) {
      url = res.data.next.replace(
        'https://syapi.scankool.com/api/v1/',
        ''
      );
    } else {
      url = null;
    }
  }

  return allItems;
};

/* ===================== COMPONENT ===================== */

export default function DashboardUser() {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const userId = user?.id;

  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [nbTotalProducts, setNbTotalProducts] = useState(0);
  const [nbInactiveProducts, setNbInactiveProducts] = useState(0);
  const [nbTotalCategories, setNbTotalCategories] = useState(0);
  const [nbInactiveCategories, setNbInactiveCategories] = useState(0);

  // 🔒 Redirection si non connecté
  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user]);

  /* ===================== DATA ===================== */

  const fetchProducts = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const items = await fetchAll(
        `product/getProductsByUser/${userId}/`
      );

      setNbTotalProducts(items.length);

      const inactive = items.filter(
        (p) => !p.is_active || p.is_active === 0
      );

      setNbInactiveProducts(inactive.length);

      setProducts(
        inactive.map((p) => ({
          id: p.id,
          name: typeof p.name === 'string' ? p.name : p.name?.fr ?? '',
          category:
            typeof p.category_name === 'string'
              ? p.category_name
              : p.category_name?.fr ?? '',
          price: p.price ?? 0,
          status: p.is_active,
        }))
      );
    } catch (e) {
      console.error('Erreur produits :', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiPrivate.get(
        `categories/getCategoriesByUser/${userId}/`
      );


      const { items } = normalizeListResponse(res.data);

      setNbTotalCategories(items.length);

      const inactive = items.filter(
        (c) => !c.is_active || c.is_active === 0
      );

      setNbInactiveCategories(inactive.length);

      setCategories(
        inactive.map((c) => ({
          id: c.id,
          name: typeof c.name === 'string' ? c.name : c.name?.fr ?? '',
          totalProducts: c.total_products ?? 0,
          status: c.is_active,
        }))
      );
    } catch (e) {
      console.error('Erreur catégories :', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
      readSecureStore();
  }, [userId]);

  /* ===================== UI ===================== */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

 return (
  <View style={{ flex: 1 }}>
    {/* MENU BAR */}
    <MenuBar />

    {/* CONTENT */}
    <ScrollView style={styles.container}>
      {/* STATISTIQUES */}
      <View style={styles.statsRow}>
        <StatCard value={nbTotalCategories} label="Catégories totales" />
        <StatCard value={nbTotalProducts} label="Produits totaux" />
        <StatCard
          value={nbInactiveProducts}
          label="Produits indisponibles"
        />
        <StatCard
          value={nbInactiveCategories}
          label="Catégories indisponibles"
        />
      </View>

      {/* PRODUITS INACTIFS */}
      <Text style={styles.sectionTitle}>
        Produits indisponibles
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <ItemRow
            title={item.name}
            subtitle={item.category}
            right={`${item.price} ${user?.currency ?? ''}`}
            status={item.status}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aucun produit indisponible
          </Text>
        }
      />

      {/* CATÉGORIES INACTIVES */}
      <Text style={styles.sectionTitle}>
        Catégories indisponibles
      </Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <ItemRow
            title={item.name}
            subtitle={`Produits : ${item.totalProducts}`}
            status={item.status}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aucune catégorie indisponible
          </Text>
        }
      />
    </ScrollView>
  </View>
);

}

/* ===================== UI COMPONENTS ===================== */

const StatCard = ({ value, label }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ItemRow = ({ title, subtitle, right, status }) => (
  <View style={styles.row}>
    <View>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      {right ? <Text style={styles.rowRight}>{right}</Text> : null}
      <Text
        style={[
          styles.badge,
          status ? styles.active : styles.inactive,
        ]}
      >
        {status ? 'Actif' : 'Inactif'}
      </Text>
    </View>
  </View>
);

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF7A00',
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },

  row: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  rowSub: {
    fontSize: 13,
    color: '#777',
  },
  rowRight: {
    fontWeight: '600',
  },

  badge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    overflow: 'hidden',
    textAlign: 'center',
  },
  active: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  inactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },

  empty: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 20,
  },
});
