    import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Charger user depuis SecureStore au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
      
        
        const storedUser = await SecureStore.getItemAsync('user');
      
        if (storedUser) {
          let parsedUser = JSON.parse(storedUser);

          // Même logique que le web
          if (parsedUser?.description && typeof parsedUser.description === 'string') {
            try {
              parsedUser.description = JSON.parse(parsedUser.description);
            } catch (e) {
              console.warn('Failed to parse description:', e);
              parsedUser.description = null;
            }
          }

          setUser(parsedUser);
        } else {
          // Set default user if no stored user
          const defaultUser = {
            "currency": "MAD",
            "email": "adminkoya@scankool.com",
            "id": 87,
            "lang": "fr",
            "logo_url": "https://res.cloudinary.com/dujneqlwr/image/upload/v1766443451/scankool/profile/asppbpv7nihd3lgsbhnx.jpg",
            "name": "adminkoya",
            "phone": "0681131722",
            "project_name": "koya",
            "role": "admin_project"
          };
          setUser(defaultUser);
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 🔹 Sauvegarder user à chaque changement
  useEffect(() => {
    const saveUser = async () => {
      try {
        if (user) {
          let userToSave = { ...user };

          if (
            userToSave.description &&
            typeof userToSave.description === 'object'
          ) {
            userToSave.description = JSON.stringify(userToSave.description);
          }

          await SecureStore.setItemAsync(
            'user',
            JSON.stringify(userToSave)
          );
        } else {
          await SecureStore.deleteItemAsync('user');
        }
      } catch (e) {
        console.error('Failed to save user:', e);
      }
    };

    saveUser();
  }, [user]);

  const setUserFromObject = (userObject) => {
    setUser(userObject);
  };

  return (
    <UserContext.Provider value={{ user, setUser, setUserFromObject, loading }}>
      {children}
    </UserContext.Provider>
  );
}
