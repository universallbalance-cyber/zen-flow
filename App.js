import React, { useEffect, useState } from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "./screens/HomeScreen";
import YogaDiceScreen from "./screens/YogaDiceScreen";
import SequenceScreen from "./screens/SequenceScreen";
import MeditateScreen from "./screens/MeditateScreen";
import JournalScreen from "./screens/JournalScreen";
import PaywallScreen from "./screens/PaywallScreen";
import { getStoredToken, verifyStoredToken, clearToken } from "./data/entitlement";

const Tab = createBottomTabNavigator();

const TEAL = "#2dd4c0";
const NAV_BG = "#111d2c";
const INACTIVE = "#4a6080";

function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: NAV_BG,
            borderTopColor: "#243347",
            borderTopWidth: 1,
            height: 64 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 6,
          },
          tabBarActiveTintColor: TEAL,
          tabBarInactiveTintColor: INACTIVE,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "500",
          },
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: "home-outline",
              "Yoga Dice": "dice-outline",
              Sequences: "list-outline",
              Meditate: "timer-outline",
              Journal: "journal-outline",
            };
            return (
              <Ionicons name={icons[route.name]} size={size} color={color} />
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Yoga Dice" component={YogaDiceScreen} />
        <Tab.Screen name="Sequences" component={SequenceScreen} />
        <Tab.Screen name="Meditate" component={MeditateScreen} />
        <Tab.Screen name="Journal" component={JournalScreen} />
      </Tab.Navigator>
    </>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(Platform.OS !== "web" ? true : null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    let cancelled = false;
    getStoredToken().then((token) => {
      if (cancelled) return;
      if (!token) {
        setUnlocked(false);
        return;
      }
      // Optimistic unlock so an offline returning user isn't blocked; only
      // revoke on an explicit server "invalid" response.
      setUnlocked(true);
      verifyStoredToken(token).then((valid) => {
        if (cancelled || valid) return;
        clearToken();
        setUnlocked(false);
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (unlocked === null) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1a2535", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#2dd4c0" />
      </View>
    );
  }

  if (!unlocked) {
    return <PaywallScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}