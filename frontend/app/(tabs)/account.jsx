import {
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import React from "react";
import HeaderBox from "../../components/Account/headerBox";
import SettingsOptions from "../../components/Account/settingsOptions";
import Button from "../../components/History/button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useNavigation } from "expo-router";

export async function signout() {
  await AsyncStorage.removeItem("userToken");
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("selfie");
  router.push("signIn");
}

export default function Index() {
  const { t, i18n } = useTranslation();
  const [selfie, setSelfie] = React.useState();
  const navigation = useNavigation();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [language, setLanguage] = React.useState("");

  const appVersion = "1.0.0";

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

  const getLanguage = async () => {
    const val = await AsyncStorage.getItem("language");
    setLanguage(val);
  };

  React.useEffect(() => {
    // alert(i18n.languages[0]);
    getUser();
    getLanguage(i18n.languages[0]);
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getSelfie();
      getUser();
    });

    return unsubscribe;
  }, [navigation]);

  const getSelfie = async () => {
    const s = await AsyncStorage.getItem("selfie");
    console.log("[account] getSelfie read ->", s);
    const now = Date.now();
    let parsed;
    try {
      parsed = s ? JSON.parse(s) : null;
    } catch (e) {
      parsed = { url: s, ts: 0 };
    }

    if (parsed && parsed.url) {
      // Only update if value differs
      if (parsed.url !== selfie) {
        console.log("[account] updating selfie from AsyncStorage", parsed.url);
        setSelfie(parsed.url);
      }
    }

    // Re-read shortly after to catch any pending writes from other screens
    setTimeout(async () => {
      try {
        const s2 = await AsyncStorage.getItem("selfie");
        console.log("[account] delayed getSelfie read ->", s2);
        let parsed2;
        try {
          parsed2 = s2 ? JSON.parse(s2) : null;
        } catch (e) {
          parsed2 = { url: s2, ts: 0 };
        }
        if (parsed2 && parsed2.url && parsed2.url !== selfie) {
          console.log("[account] updating selfie from delayed AsyncStorage read", parsed2.url);
          setSelfie(parsed2.url);
        }
      } catch (e) {
        // ignore
      }
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        animated={true}
        backgroundColor="#19363C"
        barStyle="light-content"
      />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <HeaderBox
          name={name}
          email={email}
          selfie={selfie}
          setSelfie={setSelfie}
        />

        <SettingsOptions
          currentLanguage={language}
          appVersion={appVersion}
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
