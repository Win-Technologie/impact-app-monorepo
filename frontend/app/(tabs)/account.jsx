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
import clientPic from "../../assets/splashscreen.png";
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

  const userProfile = {
    name: "Michael Lessard",
    email: "Michael.lessard@example.com",
    profileImageUrl: { clientPic },
    currentLanguage: (i18n.language = "en" ? "English" : "Français"),
    appVersion: "1.0.0",
  };

  const getUser = async () => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem("user"));
      setEmail(userData.user.email);
      const token = await AsyncStorage.getItem("userToken");
      setName(userData.user.name + " " + userData.user.lastName);
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
      // The screen is focused
      // Call any action
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const getSelfie = async () => {
    const s = await AsyncStorage.getItem("selfie");
    setSelfie(s);
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
          appVersion={userProfile.appVersion}
        />

        <Button style={styles.button} onPress={signout}>
          <Text style={{ color: "white" }}>Me déconnecter</Text>
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
