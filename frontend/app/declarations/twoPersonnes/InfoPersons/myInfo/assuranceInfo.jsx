import {
  StyleSheet,
  Text,
  View,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import InputsShowGroup from "../../../../../components/Utils/Inputs/InputsShowGroup";
import { AntDesign } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { globalPersonalInfo } from "../../../../../GlobalState/PersonalInfoState";
import Loading from "../../../../../components/Utils/Notification/Loading";
import { SafeAreaView } from "react-native-safe-area-context";

export default function assuranceInfo() {
  // obtenir la valeur de manière globale
  const personalInformation = useRecoilValue(globalPersonalInfo);
  // insurance is null or empty object when no insurance is linked to the selected vehicle
  const rawInsurance = personalInformation?.insurance;
  const insurance = (rawInsurance && rawInsurance.policyNumber) ? rawInsurance : null;
  const owner = personalInformation?.owner || {};

  /**
   * * Contient des informations détaillées sur l'assurance à afficher.
   */
  const infoInsurance = insurance ? [
    {
      style: "column",
      label: "Nom de la société d'assurance",
      value: insurance.insuranceCompany || "non disponible",
    },
    {
      style: "row",
      firstLabel: "Numéro d'assurance ",
      valueFirstLabel:
        insurance.policyNumber || "non disponible",
      secondLabel: "Expiration",
      valueSecondLabel: insurance.expirationDate
        ? insurance.expirationDate.slice(0, 10)
        : "non disponible",
    },
  ] : [];

  /**
   * Contient des informations détaillées sur l'assurance d'utilisateur à afficher.
   */
  const userDataInsurance = [
    {
      style: "column",
      label: "Prénom",
      value: owner.name || "non disponible",
    },
    {
      style: "column",
      label: "Nom",
      value: owner.lastName || "non disponible",
    },
    {
      style: "column",
      label: "adresse courriel",
      value: owner.email || "non disponible",
    },
    {
      style: "column",
      label: "Numéro de téléphone",
      value: owner.phone || "non disponible",
    },
    {
      style: "column",
      label: "Numéro et rue de l'adresse",
      value: owner.address || "non disponible",
    },
    {
      style: "row",
      firstLabel: "Ville",
      valueFirstLabel: owner.city || "non disponible",
      secondLabel: "Code postale",
      valueSecondLabel:
        owner.postalCode || "non disponible",
    },
    {
      style: "row",
      firstLabel: "Pays",
      valueFirstLabel: owner.country || "non disponible",
      secondLabel: "Province",
      valueSecondLabel: owner.province || "non disponible",
    },
  ];


  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 20,
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
          <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            Informations d’assurance
          </Text>
        </View>
      </View>

      <ScrollView>
        <View style={styles.contentContainer}>
          {insurance === null ? (
            <View style={styles.noInsuranceBox}>
              <Text style={styles.noInsuranceText}>Aucune assurance associée au véhicule sélectionné.</Text>
              <Text style={styles.noInsuranceSubText}>Veuillez ajouter une assurance dans votre profil.</Text>
            </View>
          ) : (
            <InputsShowGroup dataToShow={infoInsurance} editable={false} />
          )}
          <View>
            <Text
              style={[
                styles.headerTitle,
                styles.marginSpace,
                styles.centerText,
              ]}
            >
              Informations de l’assuré
            </Text>
            <InputsShowGroup dataToShow={userDataInsurance} editable={false} />
          </View>
        </View>
      </ScrollView>

      {/* Continued navigation removed: user should not auto-advance from this view */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 23,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  scrollviewContainer: {
    flexGrow: 1,
  },

  safeAreaContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },

  headersContainer: {
    marginTop: 20,
    flexDirection: "row",
    gap: 15,
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 19,
    // marginBottom: 30,
    fontWeight: "bold",
    color: "#19363C",
    // marginHorizontal: 20
  },
  headerIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  contentContainer: {
    marginTop: 20,
    justifyContent: "center",
    marginBottom: 50,
  },

  titleText: {
    fontSize: 23,
    marginBottom: 30,
    fontWeight: "bold",
    color: "#19363C",
    marginHorizontal: 20,
  },

  marginSpace: {
    marginVertical: 20,
  },

  centerText: {
    textAlign: "center",
  },

  footContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  noInsuranceBox: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noInsuranceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  noInsuranceSubText: {
    fontSize: 14,
    color: '#856404',
  },
});
