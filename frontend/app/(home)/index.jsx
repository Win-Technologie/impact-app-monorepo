import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
//import _layout from '../(home)/_layout'
import HomeHeader from "../../components/Home/homeHeader";
import BoxComponent from "../../components/Home/boxComponent";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import BottomButton from "../../components/Home/bottomButton";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function index() {
  const callUrgence = () => {
    Linking.openURL("tel:+123456789");
  };

  const callAssurance = () => {
    Linking.openURL("tel:+123456789");
  };

  const callRemorcage = () => {
    Linking.openURL("tel:+123456789");
  };

  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <HomeHeader clientName="Michael Lessard">
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
              callAssurance();
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
