import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, StyleSheet, ScrollView } from "react-native";
import HeaderBox from "../../../components/Account/headerBox";
import SettingsOptions from "../../../components/Account/settingsOptions";
import Button from "../../../components/History/button";
import { router, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export async function signout() {
  await AsyncStorage.removeItem("userToken");
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("selfie");
  router.push("signIn");
}

export default function Index() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("");

  const getUser = async () => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem("user"));
      if (userData?.user) {
        const n = userData.user.name === "pending" ? "" : (userData.user.name || "");
        const ln = userData.user.lastName === "pending" ? "" : (userData.user.lastName || "");
        setName((n + " " + ln).trim());
        setEmail(userData.user.email || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
    const val = i18n.language === "en" ? "English" : "Français";
    setLanguage(val);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getUser();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <HeaderBox
          name={name}
          email={email}
        />
        <SettingsOptions
          currentLanguage={language}
          appVersion="1.0.0"
        />
        <Button style={styles.button} onPress={signout}>
          <Text style={{ color: "white" }}>{t("account.logout")}</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    alignItems: "center",
  },
  button: {
    width: 334,
    height: 51,
    borderRadius: 5,
    backgroundColor: "#0B8BA8",
    shadowColor: "grey",
    shadowOpacity: 0.5,
    shadowOffset: { width: 4, height: 4 },
    marginBottom: 25,
  },
});
