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
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import InputsShowGroup from "../../../../../components/Utils/Inputs/InputsShowGroup";
import { AntDesign } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { globalPersonalInfo } from "../../../../../GlobalState/PersonalInfoState";
import Loading from "../../../../../components/Utils/Notification/Loading";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VehicleInfo() {
  //obtenir la valeur de manière globale
  const personalInformation = useRecoilValue(globalPersonalInfo);
  const vehicle = personalInformation?.vehicle || {};
  const owner = personalInformation?.owner || {};

  /**
   * * Contient des informations détaillées sur le véhicule à afficher.
   */
  const infoVehicle = [
    {
      style: "column",
      label: "Numéro du certificat d’immatriculation",
      value: vehicle.serialNumber || "non disponible",
    },
    {
      style: "column",
      label: "Numéro de plaque",
      value: vehicle.plate || "non disponible",
    },
    {
      style: "row",
      firstLabel: "Modèle du véhicule",
      valueFirstLabel: vehicle.model || "non disponible",
      secondLabel: "Année",
      valueSecondLabel:
        vehicle.year?.toString() || "non disponible",
    },
    {
      style: "column",
      label: "Couleur du véhicule",
      value: vehicle.color || "non disponible",
    },
  ];

  /**
   * * Contient des informations détaillées sur le proprietaire du véhicule à afficher.
   */
  const vehicleOwner = [
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
          paddingBottom: 20,
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
            Informations du véhicule
          </Text>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.contentContainer}>
          {infoVehicle.length === 0 ? (
            <Loading text="Chargement..." />
          ) : (
            <InputsShowGroup dataToShow={infoVehicle} />
          )}
          <View>
            <Text
              style={[
                styles.headerTitle,
                styles.marginSpace,
                styles.centerText,
              ]}
            >
              Informations du propriétaire
            </Text>
            {vehicleOwner.length === 0 ? (
              <Loading text="Chargement" />
            ) : (
              <InputsShowGroup dataToShow={vehicleOwner} />
            )}
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
    padding: 20,
    backgroundColor: "#FFFFFF",
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
    fontWeight: "bold",
    color: "#19363C",
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

  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },

  marginSpace: {
    marginVertical: 20,
  },

  centerText: {
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },

  footContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
