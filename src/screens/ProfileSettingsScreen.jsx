import React, { useContext, useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import apiPrivate from '../api/apiPrivate';
import MenuBar from '../components/MenuBar';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileSettingsScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
    currency: user?.currency || 'MAD',
  });

  const [brandingData, setBrandingData] = useState({
    project_name: user?.project_name || '',
    description: user?.description || '',
    address: user?.address || '',
    primaryColor: user?.color || '#FF7A00',
    secondaryColor: user?.secondaryColor || '#333333',
  });

  const [socialLinks, setSocialLinks] = useState({
    website: user?.website || '',
    facebook: user?.facebook || '',
    instagram: user?.instagram || '',
    tiktok: user?.tiktok || '',
    link_google_map: user?.link_google_map || '',
    trip_advisor: user?.trip_advisor || '',
  });

  const [selectedLanguage, setSelectedLanguage] = useState(user?.lang || 'fr');
  const [mediaFiles, setMediaFiles] = useState({
    image: null,
    logo: null,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user]);

  useEffect(() => {
    if (user?.logo_url || user?.image_url) {
      setProfileImage(user.logo_url || user.image_url);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id]);

  const fetchProfileData = async () => {
    try {
      const response = await apiPrivate.get(`profiles/getProfile/${user.id}/`);
      const profile = response.data[0];

      // Set profile data
      setProfileData({
        id: profile.user.id,
        name: profile.display_name || `${profile.user.first_name} ${profile.user.last_name}`.trim(),
        email: profile.user.email,
        phone: profile.phone,
        role: profile.role,
        currency: profile.currency,
      });

      // Set branding data
      setBrandingData({
        project_name: profile.project_name,
        description: profile.description[selectedLanguage] || profile.description.fr || '',
        address: profile.address,
        primaryColor: profile.color,
        secondaryColor: user?.secondaryColor || '#333333',
      });

      // Set social links
      setSocialLinks({
        website: profile.website,
        facebook: profile.facebook,
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        link_google_map: profile.link_google_map,
        trip_advisor: profile.trip_advisor,
      });

      // Set language
      setSelectedLanguage(profile.lang);

      // Set profile image
      setProfileImage(profile.logo || profile.image);
      setLogoImage(profile.logo);

    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setProfileImage(asset.uri);

      // Create a file object for upload
      const file = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      };
      setMediaFiles({ ...mediaFiles, logo: file });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Add media files if they are File objects
      if (mediaFiles.image instanceof File) {
        formData.append("image", mediaFiles.image);
      }
      if (mediaFiles.logo instanceof File) {
        formData.append("logo", mediaFiles.logo);
      }

      // Add profile data
      formData.append("id", profileData.id);
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);
      formData.append("phone", profileData.phone);
      formData.append("role", profileData.role);

      // Add branding data
      if (brandingData.project_name) formData.append("project_name", brandingData.project_name);
      if (brandingData.description) formData.append("description", brandingData.description);
      if (brandingData.address) formData.append("address", brandingData.address);
      if (brandingData.primaryColor) formData.append("color", brandingData.primaryColor);
      formData.append("currency", profileData.currency);
      // Add social links
      if (socialLinks.website) formData.append("website", socialLinks.website);
      if (socialLinks.facebook) formData.append("facebook", socialLinks.facebook);
      if (socialLinks.instagram) formData.append("instagram", socialLinks.instagram);
      if (socialLinks.tiktok) formData.append("tiktok", socialLinks.tiktok);
      if (socialLinks.link_google_map) formData.append("link_google_map", socialLinks.link_google_map);
      if (socialLinks.trip_advisor) formData.append("trip_advisor", socialLinks.trip_advisor);
      formData.append("lang", selectedLanguage);
      // Add method override
      formData.append("_method", "put");


    

      const response = await apiPrivate.put("user", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
      });

      const image = response.data.image_url;
      const logo = response.data.logo_url;

      // Update user context with new data
      setUser({
        ...user,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        logo_url: logo,
        image_url: image,
        description: brandingData.description,
        address: brandingData.address,
        project_name: brandingData.project_name,
        color: brandingData.color,
        website: socialLinks.website,
        facebook: socialLinks.facebook,
        instagram: socialLinks.instagram,
        tiktok: socialLinks.tiktok,
        link_google_map: socialLinks.link_google_map,
        trip_advisor: socialLinks.trip_advisor,
        lang: selectedLanguage,
      });

      // Update local state for immediate display
      setProfileImage(image || logo);
      setLogoImage(logo);

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      console.error("Full error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data?.errors || error.message || 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (currency) => {
    setProfileData({ ...profileData, currency });
    setUser({ ...user, currency });
  };

  return (
    <View style={{ flex: 1 }}>
      <MenuBar />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Paramètres de profil</Text>

        {/* Profile Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Image de profil</Text>
          <View style={styles.imageContainer}>
            <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>Sélectionner une image</Text>
                </View>
              )}
            </TouchableOpacity>
            {logoImage && (
              <View style={styles.logoWrapper}>
                <Image source={{ uri: logoImage }} style={styles.logoImage} />
              </View>
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Devise</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert('Sélectionner devise', '', [
                      { text: 'MAD', onPress: () => handleCurrencyChange('MAD') },
                      { text: 'EUR', onPress: () => handleCurrencyChange('EUR') },
                      { text: 'USD', onPress: () => handleCurrencyChange('USD') },
                    ]);
                  }}
                >
                  <Text style={styles.pickerText}>{profileData.currency}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Langue</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert('Sélectionner langue', '', [
                      { text: 'Français', onPress: () => {} },
                      { text: 'English', onPress: () => {} },
                    ]);
                  }}
                >
                  <Text style={styles.pickerText}>Français</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Branding Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marque</Text>

          <Text style={styles.label}>Nom du projet</Text>
          <TextInput
            style={styles.input}
            value={brandingData.project_name}
            onChangeText={(text) => setBrandingData({ ...brandingData, project_name: text })}
            placeholder="Nom de votre projet"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={brandingData.description}
            onChangeText={(text) => setBrandingData({ ...brandingData, description: text })}
            placeholder="Description de votre projet"
            multiline
          />

          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={brandingData.address}
            onChangeText={(text) => setBrandingData({ ...brandingData, address: text })}
            placeholder="Votre adresse"
            multiline
          />

          <Text style={styles.label}>Couleur principale</Text>
          <TextInput
            style={styles.input}
            value={brandingData.primaryColor}
            onChangeText={(text) => setBrandingData({ ...brandingData, primaryColor: text })}
            placeholder="#FF7A00"
          />

          <Text style={styles.label}>Couleur secondaire</Text>
          <TextInput
            style={styles.input}
            value={brandingData.secondaryColor}
            onChangeText={(text) => setBrandingData({ ...brandingData, secondaryColor: text })}
            placeholder="#333333"
          />
        </View>

        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={profileData.name}
            onChangeText={(text) => setProfileData({ ...profileData, name: text })}
            placeholder="Votre nom"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profileData.email}
            onChangeText={(text) => setProfileData({ ...profileData, email: text })}
            placeholder="votre@email.com"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={profileData.phone}
            onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
            placeholder="+212 6XX XXX XXX"
            keyboardType="phone-pad"
          />
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réseaux sociaux</Text>

          <Text style={styles.label}>Facebook</Text>
          <TextInput
            style={styles.input}
            value={socialLinks.facebook}
            onChangeText={(text) => setSocialLinks({ ...socialLinks, facebook: text })}
            placeholder="https://facebook.com/votrepage"
          />

          <Text style={styles.label}>Instagram</Text>
          <TextInput
            style={styles.input}
            value={socialLinks.instagram}
            onChangeText={(text) => setSocialLinks({ ...socialLinks, instagram: text })}
            placeholder="https://instagram.com/votrecompte"
          />

          <Text style={styles.label}>Twitter</Text>
          <TextInput
            style={styles.input}
            value={socialLinks.twitter}
            onChangeText={(text) => setSocialLinks({ ...socialLinks, twitter: text })}
            placeholder="https://twitter.com/votrecompte"
          />

          <Text style={styles.label}>Site web</Text>
          <TextInput
            style={styles.input}
            value={socialLinks.website}
            onChangeText={(text) => setSocialLinks({ ...socialLinks, website: text })}
            placeholder="https://votresite.com"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Mettre à jour</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerButton: {
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
