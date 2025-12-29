import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { UserProvider } from "./src/context/UserContext";
import DashboardUser from "./src/screens/DashboardUser";
import Login from "./src/screens/Login";
import Register from "./src/screens/Register";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import ProductsScreen from "./src/screens/ProductsScreen";
import ProfileSettingsScreen from "./src/screens/ProfileSettingsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Dashboard" component={DashboardUser} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
