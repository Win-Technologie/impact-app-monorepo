import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
//import _layout from '../(home)/_layout'
import HomeHeader from "../../components/Home/homeHeader";
import BoxComponent from "../../components/Home/boxComponent";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import BottomButton from "../../components/Home/bottomButton";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as Location from "expo-location";

import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { insuranceState } from "../../GlobalState/InsuranceState";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const insurance = useRecoilValue(insuranceState);
  const setInsurance = useSetRecoilState(insuranceState);
  const insurancePhone = insurance?.insuranceFirmPhone || "";
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const userData = JSON.parse(await AsyncStorage.getItem("user"));
        if (userData?.user) {
          const n = userData.user.name === "pending" ? "" : (userData.user.name || "");
          const ln = userData.user.lastName === "pending" ? "" : (userData.user.lastName || "");
          setName((n + " " + ln).trim());
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, []);

  // Fetch insurance info on mount and set in Recoil
  React.useEffect(() => {
    const fetchInsurance = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const API_URL = process.env.EXPO_PUBLIC_API_URL;
        const response = await fetch(`${API_URL}vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // Use the first insurance found (or improve logic as needed)
          const insuranceData = data.carsWithInsurances?.[0]?.insurance;
          if (insuranceData) {
            setInsurance((prev) => ({
              ...prev,
              ...insuranceData,
              insuranceNumber: insuranceData.policyNumber || insuranceData.insuranceNumber,
              insuranceFirmPhone: insuranceData.insuranceCompanyPhone || prev.insuranceFirmPhone,
            }));
          }
        }
      } catch (e) {
        // fail silently
      }
    };
    fetchInsurance();
  }, [setInsurance]);

  const callUrgence = () => {
    Alert.alert(
      "Appeler les urgences",
      "Voulez-vous appeler le num\u00e9ro d'urgence ?\n911",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Appeler",
          onPress: () => Linking.openURL("tel:911"),
        },
      ]
    );
  };

  const callAssurance = () => {
    if (!insurancePhone) {
      Alert.alert(
        "Numéro manquant",
        "Aucun numéro d'assurance n'est enregistré."
      );
      return;
    }
    Alert.alert(
      "Appeler l'assurance",
      `Voulez-vous appeler ce numéro ?\n${insurancePhone}`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Appeler",
          onPress: () => Linking.openURL(`tel:${insurancePhone}`),
        },
      ]
    );
  };

  const callRemorcage = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Linking.openURL("https://www.google.com/maps/search/remorqueur+pr%C3%A8s+de+moi");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      Linking.openURL(`https://www.google.com/maps/search/remorqueur/@${latitude},${longitude},14z`);
    } catch (error) {
      console.error("Error getting location for towing:", error);
      Linking.openURL("https://www.google.com/maps/search/remorqueur+pr%C3%A8s+de+moi");
    }
  };

  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <HomeHeader clientName={name}>
          <Text style={{ marginBottom: 10, color: "gray" }}>
            {t("welcome")}
          </Text>
        </HomeHeader>

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
            {t("homeScreen.subscriptionOffer")}
          </Text>
          <Text
            style={{
              marginTop: 15,
              extAlign: "center",
              textDecorationLine: "underline",
              color: "white",
              fontSize: 14,
            }}
          >
            {" "}
            {t("homeScreen.monthlySubscription")}
          </Text>
        </BoxComponent>

        <BoxComponent height={131} style={styles.box}>
          <View style={{ flexDirection: "row", height: 131 }}>
            <View style={{ flex: 5, padding: 20 }}>
              <View style={styles.textWithIcon}>
                <Text style={styles.mainText}>{t("homeScreen.emergency")}</Text>
                <MaterialIcons name="error" size={24} color="#CF8C58" />
              </View>

              <Text style={styles.subText}>
                {t("homeScreen.emergencyDescription")}
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

              <Text style={styles.callText}>{t("homeScreen.call")}</Text>
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
                {t("homeScreen.insurance")}
              </Text>
              <Text style={[styles.description, { color: "white" }]}>
                {t("homeScreen.contactInsurance")}
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
                {t("homeScreen.towing")}
              </Text>
              <Text style={styles.description}>
                {t("homeScreen.contactTowing")}
              </Text>
              <View style={styles.bottomLine2}></View>
            </BoxComponent>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("declaration/index")}
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
            {t("homeScreen.declareIncident")}
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
