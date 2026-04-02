import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { RadioButton } from "react-native-paper";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Language() {
  const [checked, setChecked] = React.useState(null);
  const { t, i18n } = useTranslation();

  const changeLangage = async () => {
    if (checked == "fr") {
      i18n.changeLanguage("fr");
      await AsyncStorage.setItem("language", "fr");
    } else if (checked == "en") {
      i18n.changeLanguage("en");
      await AsyncStorage.setItem("language", "en");
    }

    setTimeout(() => {
      router.navigate("(tabs)/account");
    }, 500);
  };

  const getLanguage = async () => {
    const val = await AsyncStorage.getItem("language");
    return val;
  };

  useEffect(() => {
    getLanguage().then((val) => {
      if (val) {
        setChecked(val);
      } else {
        setChecked(i18n.languages[0]);
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row" }}
          onPress={() => {
            router.back();
          }}
        >
          <AntDesign
            name="arrow-left"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>
            {"   "}
            {t("back")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 80, marginBottom: 10 }}>
        <Text style={{ color: "#19363C", fontSize: 18, fontWeight: 600 }}>
          {t("language")}
        </Text>
      </View>

      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            height: 40,
            marginVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "gray",
          }}
        >
          <View>
            <Text>{t("french")}</Text>
          </View>
          <View>
            <RadioButton
              value="fr"
              status={checked === "fr" ? "checked" : "unchecked"}
              onPress={() => setChecked("fr")}
              color="#19363C"
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            height: 40,
            marginVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "gray",
          }}
        >
          <View>
            <Text>{t("english")}</Text>
          </View>
          <View>
            <RadioButton
              value="en"
              status={checked === "en" ? "checked" : "unchecked"}
              onPress={() => setChecked("en")}
              color="#19363C"
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          changeLangage();
        }}
      >
        <Text style={{ color: "white" }}>Enregistrer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F1F1F1",
  },

  button: {
    position: "absolute",
    bottom: 0,
    margin: 20,
    backgroundColor: "#0B8BA8",
    paddingVertical: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
});
