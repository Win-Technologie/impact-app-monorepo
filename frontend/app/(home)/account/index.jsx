import { SafeAreaView, Text, StyleSheet, ScrollView } from "react-native";
import HeaderBox from "../../../components/Account/headerBox";
import SettingsOptions from "../../../components/Account/settingsOptions";
import Button from "../../../components/History/button";
import { router } from "expo-router";
import clientPic from "../../../assets/splashscreen.png";
import AsyncStorage from "@react-native-async-storage/async-storage";

const userProfile = {
  name: "Michael Lessard",
  email: "Michael.lessard@example.com",
  profileImageUrl: { clientPic },
  currentLanguage: "Français",
  appVersion: "1.0.0",
};

export async function signout() {
  await AsyncStorage.removeItem("userToken");
  router.push("signIn");
}

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <HeaderBox
          name={userProfile.name}
          email={userProfile.email}
          profileImageUrl={userProfile.profileImageUrl}
        />
        <SettingsOptions
          currentLanguage={userProfile.currentLanguage}
          appVersion={userProfile.appVersion}
        />
        <Button style={styles.button} onPress={signout}>
          <Text style={{ color: "white" }}>{t("account.login")}</Text>
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
