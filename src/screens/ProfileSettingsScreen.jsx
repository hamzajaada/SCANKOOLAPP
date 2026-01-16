import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

// Contexts et services
import { UserContext } from "../context/UserContext";
import apiPrivate from "../api/apiPrivate";
import MenuBar from "../components/MenuBar";

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const scrollViewRef = useRef(null);
  const tripAdvisorInputRef = useRef(null);


  
  // États pour les données
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    currency: "MAD",
  });

  const [brandingData, setBrandingData] = useState({
    project_name: "",
    description: "",
    address: "",
    color: "#4D873D",
  });

  const [mediaFiles, setMediaFiles] = useState({
    logo: null,
    image: null,
  });

  const [socialLinks, setSocialLinks] = useState({
    website: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    link_google_map: "",
    trip_advisor: "",
  });

  // États pour les prévisualisations d'images
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Initialisation des données
  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
      return;
    }

    // Charger les données utilisateur
    setProfileData({
      id: user?.id || "",
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "",
      currency: user?.currency || "MAD",
    });

    setBrandingData({
      project_name: user?.project_name || "",
      description: user?.description?.fr || user?.description || "",
      address: user?.address || "",
      color: user?.color || "#4D873D",
    });

    setSocialLinks({
      website: user?.website || "",
      facebook: user?.facebook || "",
      instagram: user?.instagram || "",
      tiktok: user?.tiktok || "",
      link_google_map: user?.link_google_map || "",
      trip_advisor: user?.trip_advisor || "",
    });

    // Configurer les prévisualisations d'images
    if (user?.image_url) {
      setProfileImagePreview(user.image_url);
    }
    if (user?.logo_url) {
      setLogoPreview(user.logo_url);
    }
  }, [user]);

  // Gestionnaire de sélection d'image
  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        type: "image/jpeg",
        name: `${type}_${Date.now()}.jpg`,
      };

      if (type === 'image') {
        setProfileImagePreview(asset.uri);
        setMediaFiles(prev => ({ ...prev, image: file }));
      } else {
        setLogoPreview(asset.uri);
        setMediaFiles(prev => ({ ...prev, logo: file }));
      }
    }
  };

  // Gestionnaire de soumission
  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const formData = new FormData();

      // Ajouter les fichiers média
      if (mediaFiles.image instanceof Object) {
        formData.append("image", mediaFiles.image);
      }
      if (mediaFiles.logo instanceof Object) {
        formData.append("logo", mediaFiles.logo);
      }

      // Données de profil
      formData.append("id", profileData.id);
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);
      formData.append("phone", profileData.phone);
      formData.append("role", profileData.role);
      formData.append("currency", profileData.currency);

      // Données de branding
      formData.append("project_name", brandingData.project_name);
      formData.append("description", JSON.stringify({ fr: brandingData.description }));
      formData.append("address", brandingData.address);
      formData.append("color", brandingData.color);

      // Liens sociaux
      Object.entries(socialLinks).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("lang", "fr");
      formData.append("_method", "put");

      const response = await apiPrivate.post("user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Mettre à jour le contexte utilisateur
      setUser({
        ...user,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        currency: profileData.currency,
        project_name: brandingData.project_name,
        description: { fr: brandingData.description },
        address: brandingData.address,
        color: brandingData.color,
        ...socialLinks,
        image_url: response.data.image_url || user.image_url,
        logo_url: response.data.logo_url || user.logo_url,
      });

      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Profil mis à jour avec succès',
        position: 'bottom',
      });

    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.response?.data?.message || 'Échec de la mise à jour',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour mettre à jour la devise
  const handleCurrencyChange = (currency) => {
    setProfileData(prev => ({ ...prev, currency }));
    setUser(prev => ({ ...prev, currency }));
  };

  // Rendu d'une carte (section)
  const renderCard = (title, children) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );

  if (!user) return null;

  // Fonction pour scroller vers le champ TripAdvisor
  const handleTripAdvisorFocus = () => {
    setTimeout(() => {
      if (tripAdvisorInputRef.current && scrollViewRef.current) {
        tripAdvisorInputRef.current.measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current?.scrollTo({
            y: pageY - 150,
            animated: true,
          });
        });
      }
    }, 300);
  };

  return (
    <View style={styles.safeArea}>
      <MenuBar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
        <Text style={styles.pageTitle}>Paramètres du profil</Text>

        {/* Section Image de profil */}
        {renderCard('Image de profil', (
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={() => pickImage('image')} style={styles.imageButton}>
              <View style={styles.imageContainer}>
                {profileImagePreview ? (
                  <Image source={{ uri: profileImagePreview }} style={styles.image} />
                ) : (
                  <Text style={styles.imagePlaceholder}>+ Image de profil</Text>
                )}
              </View>
              <Text style={styles.imageLabel}>Photo de profil</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage('logo')} style={styles.imageButton}>
              <View style={styles.imageContainer}>
                {logoPreview ? (
                  <Image source={{ uri: logoPreview }} style={styles.image} />
                ) : (
                  <Text style={styles.imagePlaceholder}>+ Logo</Text>
                )}
              </View>
              <Text style={styles.imageLabel}>Logo</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Section Préférences */}
        {renderCard('Préférences', (
          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceItem}>
              <Text style={styles.label}>Votre devise</Text>
              <View style={styles.currencySelector}>
                {['MAD', 'EUR', 'USD'].map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.currencyButton,
                      profileData.currency === currency && styles.currencyButtonActive
                    ]}
                    onPress={() => handleCurrencyChange(currency)}
                  >
                    <Text style={[
                      styles.currencyText,
                      profileData.currency === currency && styles.currencyTextActive
                    ]}>
                      {currency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ))}

        {/* Section Branding */}
        {renderCard('Branding', (
          <View>
            <Text style={styles.label}>Nom du projet</Text>
            <TextInput
              style={styles.input}
              value={brandingData.project_name}
              onChangeText={(text) => setBrandingData(prev => ({ ...prev, project_name: text }))}
              placeholder="Nom de votre projet"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={brandingData.description}
              onChangeText={(text) => setBrandingData(prev => ({ ...prev, description: text }))}
              placeholder="Description du projet"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={styles.input}
              value={brandingData.address}
              onChangeText={(text) => setBrandingData(prev => ({ ...prev, address: text }))}
              placeholder="Adresse complète"
            />

            <Text style={styles.label}>Couleur principale</Text>
            <TouchableOpacity
              style={styles.colorPickerButton}
              onPress={() => setShowColorPicker(true)}
            >
              <View style={[styles.colorPreview, { backgroundColor: brandingData.color }]} />
              <Text style={styles.colorPickerText}>{brandingData.color}</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Section Informations personnelles */}
        {renderCard('Informations personnelles', (
          <View>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              placeholder="Votre nom"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profileData.email}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
              placeholder="votre@email.com"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
              placeholder="Votre numéro"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Rôle</Text>
            <TextInput
              style={styles.input}
              value={profileData.role}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, role: text }))}
              placeholder="Votre rôle"
            />
          </View>
        ))}

        {/* Section Réseaux sociaux */}
        {renderCard('Réseaux sociaux', (
          <View>
            <View style={styles.socialInputContainer}>
              <Text style={styles.label}>Site web</Text>
              <TextInput
                style={styles.input}
                value={socialLinks.website}
                onChangeText={(text) => setSocialLinks(prev => ({ ...prev, website: text }))}
                placeholder="https://votresite.com"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.socialInputContainer}>
              <Text style={styles.label}>Facebook</Text>
              <TextInput
                style={styles.input}
                value={socialLinks.facebook}
                onChangeText={(text) => setSocialLinks(prev => ({ ...prev, facebook: text }))}
                placeholder="https://facebook.com/votrepage"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.socialInputContainer}>
              <Text style={styles.label}>Instagram</Text>
              <TextInput
                style={styles.input}
                value={socialLinks.instagram}
                onChangeText={(text) => setSocialLinks(prev => ({ ...prev, instagram: text }))}
                placeholder="https://instagram.com/votrecompte"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.socialInputContainer}>
              <Text style={styles.label}>TikTok</Text>
              <TextInput
                style={styles.input}
                value={socialLinks.tiktok}
                onChangeText={(text) => setSocialLinks(prev => ({ ...prev, tiktok: text }))}
                placeholder="https://tiktok.com/@votrecompte"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.socialInputContainer}>
              <Text style={styles.label}>Google Maps</Text>
              <TextInput
                style={styles.input}
                value={socialLinks.link_google_map}
                onChangeText={(text) => setSocialLinks(prev => ({ ...prev, link_google_map: text }))}
                placeholder="Lien Google Maps"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.socialInputContainer}>
              <Text style={styles.label}>TripAdvisor</Text>
              <TextInput
                ref={tripAdvisorInputRef}
                style={styles.input}
                value={socialLinks.trip_advisor}
                onChangeText={(text) => setSocialLinks(prev => ({ ...prev, trip_advisor: text }))}
                placeholder="Lien TripAdvisor"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={handleTripAdvisorFocus}
                returnKeyType="done"
              />
            </View>
          </View>
        ))}

        {/* Bouton de soumission */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Mettre à jour</Text>
          )}
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Color Picker */}
      <ColorPickerModal
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentColor={brandingData.color}
        onColorSelect={(color) => setBrandingData(prev => ({ ...prev, color }))}
      />

      <Toast />
    </View>
  );
};

// Composant ColorPickerModal intégré
const ColorPickerModal = ({ visible, onClose, currentColor, onColorSelect }) => {
  const predefinedColors = [
    '#4D873D', '#FF7A00', '#3B82F6', '#EF4444', '#8B5CF6',
    '#10B981', '#F59E0B', '#EC4899', '#6B7280', '#000000'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={colorPickerStyles.modalOverlay}>
        <View style={colorPickerStyles.modalContent}>
          <SafeAreaView>
            <View style={colorPickerStyles.modalHeader}>
              <Text style={colorPickerStyles.modalTitle}>Choisir une couleur</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={colorPickerStyles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={colorPickerStyles.colorGrid}>
              {predefinedColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    colorPickerStyles.colorOption,
                    { backgroundColor: color },
                    currentColor === color && colorPickerStyles.selectedColor
                  ]}
                  onPress={() => {
                    onColorSelect(color);
                    onClose();
                  }}
                />
              ))}
            </View>

            <View style={colorPickerStyles.currentColorContainer}>
              <Text style={colorPickerStyles.currentColorLabel}>Couleur actuelle:</Text>
              <View style={[colorPickerStyles.currentColorPreview, { backgroundColor: currentColor }]} />
              <Text style={colorPickerStyles.currentColorText}>{currentColor}</Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const colorPickerStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 5,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  currentColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  currentColorLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  currentColorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currentColorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    paddingTop: 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  imageSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  imageButton: {
    alignItems: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  imagePlaceholder: {
    color: '#888',
    textAlign: 'center',
    fontSize: 12,
  },
  imageLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  preferencesContainer: {
    gap: 16,
  },
  preferenceItem: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: '#4D873D',
  },
  currencyText: {
    color: '#333',
    fontWeight: '500',
  },
  currencyTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorPickerText: {
    fontSize: 14,
    color: '#333',
  },
  socialInputContainer: {
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#4D873D',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileSettingsScreen;