import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import HomeHeader from "../../components/Home/homeHeader";
import BoxComponent from "../../components/Home/boxComponent";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import BottomButton from "../../components/Home/bottomButton";
import { router } from "expo-router";
import { useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function index() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [selfie, setSelfie] = useState(null);

  const callUrgence = () => {
    Linking.openURL("tel:911");
  };

  const callAssurance = () => {
    // Add your insurance contact logic here
    // For example: Linking.openURL("tel:YOUR_INSURANCE_NUMBER");
    console.log("Insurance button pressed");
  };

  const callRemorcage = () => {
    Linking.openURL(
      "https://www.google.com/search?q=remorqueur&oq=remorqueur+&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDY1MjNqMGoxqAIAsAIA&sourceid=chrome&ie=UTF-8",
    );
  };

  const getUser = async () => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem("user"));
      console.log(userData.vehicles[0].vehicle);
      const token = await AsyncStorage.getItem("userToken");
      console.log(token);
      setName(userData.user.name + " " + userData.user.lastName);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      console.log("onback");
      // alert();
      // Do your stuff here
      // navigation.dispatch(e.data.action);
    });
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
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <HomeHeader clientName={name} selfie={selfie}>
          <Text style={{ marginBottom: 10, color: "gray" }}>Bienvenue</Text>
        </HomeHeader>

        <TouchableOpacity onPress={() => router.push("subscription")}>
          <BoxComponent
            height={150}
            style={{
              borderRadius: 5,
              borderWidth: 1,
              borderColor: "grey",
              padding: 15,
              backgroundColor: "#19363C",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontFamily: "bold",
                fontSize: 18,
              }}
            >
              {t("home.promotion")}
            </Text>
            <Text
              style={{
                marginTop: 15,
                textAlign: "center",
                textDecorationLine: "underline",
                color: "white",
                fontSize: 14,
              }}
            >
              {t("home.monthlySubscription")}
            </Text>
          </BoxComponent>
        </TouchableOpacity>

        <BoxComponent height={131} style={styles.box}>
          <View style={{ flexDirection: "row", height: 131 }}>
            <View style={{ flex: 5, padding: 20 }}>
              <View style={styles.textWithIcon}>
                <Text style={styles.mainText}>{t("home.emergency")}</Text>
                <MaterialIcons name="error" size={24} color="#CF8C58" />
              </View>

              <Text style={styles.subText}>
                {t("home.emergencyDescription")}
              </Text>
            </View>

            <View
              style={{
                flex: 2,
                backgroundColor: "#19363C", // Ou une autre couleur selon votre design
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                borderTopRightRadius: 5,
                borderBottomRightRadius: 5,
              }}
            >
              <View style={{ paddingVertical: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    callUrgence();
                  }}
                >
                  <FontAwesome name="phone" size={28} color="#CF8C58" />
                </TouchableOpacity>
              </View>

              <Text style={styles.callText}>{t("home.call")}</Text>
            </View>
          </View>
        </BoxComponent>

        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <TouchableOpacity
            style={{ flex: 1, marginRight: 5 }}
            onPress={() => {
              callAssurance();
            }}
          >
            <BoxComponent height={157} style={styles.innerBox1}>
              <Text
                style={[styles.title, { color: "white", fontFamily: "bold" }]}
              >
                {t("home.insurance")}
              </Text>
              <Text style={[styles.description, { color: "white" }]}>
                {t("home.insuranceDescription")}
              </Text>
              <View style={styles.bottomLine1}></View>
            </BoxComponent>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, marginLeft: 5 }}
            onPress={() => {
              callRemorcage();
            }}
          >
            <BoxComponent height={157} style={styles.innerBox2}>
              <Text style={[styles.title, { fontFamily: "bold" }]}>
                {t("home.towing")}
              </Text>
              <Text style={styles.description}>
                {t("home.towingDescription")}
              </Text>
              <View style={styles.bottomLine2}></View>
            </BoxComponent>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("(tabs)/declaration")}
          style={{
            height: 70,
            borderWidth: 1,
            borderColor: "#0B8BA8",
            borderRadius: 5,
            backgroundColor: "#0B8BA8",
            marginTop: 30,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "grey",
            shadowOpacity: 0.5,
            shadowOffset: { width: 4, height: 4 },
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>
            {t("home.declareIncident")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },

  box: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    marginTop: 15,
  },

  outerBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
    marginTop: 15,
    marginLeft: 20,
  },

  innerboxText: {
    marginBottom: 10,
    marginTop: 10,
  },

  contentContainer: {
    alignItems: "center",
  },

  textWithIcon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  mainText: {
    color: "#19363C",
    fontFamily: "bold",
    fontSize: 18,
    flexShrink: 1,
  },

  subText: {
    marginTop: 15,
    flexShrink: 2,
    color: "#19363C",
    //fontFamily: 'thin',
    fontSize: 14,
  },

  ctaBox: {
    position: "absolute",
    right: 0,
    borderRadius: 5,
  },

  callAction: {
    position: "absolute",
    right: 10,
    top: 10,
    alignItems: "center",
  },

  callText: {
    color: "white",
    fontSize: 14,
  },

  innerBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  innerBox1: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#19363C",
    borderRadius: 5,
  },

  innerBox2: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#F1F1F1",
    borderRadius: 5,
  },

  title: {
    fontSize: 18,
    textAlign: "center",
    //fontWeight: 'bold',
  },

  description: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },

  bottomLine1: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10, // Hauteur du trait
    backgroundColor: "#CF8C58",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },

  bottomLine2: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10, // Hauteur du trait
    backgroundColor: "#19363C",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});
