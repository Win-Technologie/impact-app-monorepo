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
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { insuranceCompanyState } from '../../GlobalState/InsuranceState';
import { useForm, Controller } from "react-hook-form";
import SingleBottomButton from "../../../../../components/SignUp/SingleBottomButton";
import { AntDesign } from "@expo/vector-icons";
import InputsShowGroup from "../../../../../components/Utils/Inputs/InputsShowGroup";
import { fetchUserInfoAndVehicle } from "../../../../api/users/userApi";
import { useRecoilState, useRecoilValue } from "recoil";
import { accidentVehicleState } from "../../../../../GlobalState/AccidentVehiculeState";
import { globalPersonalInfo } from "../../../../../GlobalState/PersonalInfoState";
import Loading from "../../../../../components/Utils/Notification/Loading";
import { ScannedQrCodeData } from "../../../../../GlobalState/ScannedQrCodeData";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonanalInformation() {
  //obtenir la valeur de manière globale
  const VEHICLE_ID = useRecoilValue(accidentVehicleState);
  const ENDPOINT = "users/user/vehicle/info/";
  const [userData, setUserData] = useState(null);
  const [, setPersonalInfoState] = useRecoilState(globalPersonalInfo);
  const [isEditable, setIsEditable] = useState(true);
  const userInfo = useRecoilValue(ScannedQrCodeData);

  //obtenir les données au moment du rendu du composant
  useEffect(() => {
    //  userInformation()
    createDataUser(userInfo);
  }, []);

  /**
   * Crée et organise les données de l'utilisateur pour l'affichage.
   * @param {Object} data - Contient les données de l'utilisateur et de son permis de conduire.
   */
  const createDataUser = (data) => {
    //console.log("Received Data:", data); // Add this line to log the received data
    if (!data.owner) {
      // console.error("Data does not contain owner information.");
      return; // Prevent further execution if owner is undefined
    }
    const dataToShow = [
      {
        style: "column",
        label: "Prénom",
        value: data.owner?.name || "non disponible",
      },
      {
        style: "column",
        label: "Nom",
        value: data.owner.lastName || "non disponible",
      },
      {
        style: "row",
        firstLabel: "Numéro du permis de conduire",
        valueFirstLabel: data.driverLicense.number || "non disponible",
        secondLabel: "Expiration",
        valueSecondLabel: data.driverLicense.expires || "non disponible",
      },
      {
        style: "column",
        label: "adresse courriel",
        value: data.owner.email || "non disponible",
      },
      {
        style: "column",
        label: "Numéro de téléphone",
        value: data.owner.phone || "non disponible",
      },
      {
        style: "column",
        label: "Numéro et rue de l'adresse",
        value: data.owner.address || "non disponible",
      },
      {
        style: "row",
        firstLabel: "Ville",
        valueFirstLabel: data.owner.city || "non disponible",
        secondLabel: "Code postale",
        valueSecondLabel: data.owner.postalCode || "non disponible",
      },
      {
        style: "row",
        firstLabel: "Pays",
        valueFirstLabel: data.owner.country || "non disponible",
        secondLabel: "Province",
        valueSecondLabel: data.owner.province || "non disponible",
      },
    ];
    setUserData(dataToShow);
  };

  const handlePressContinue = () => {
    router.navigate(
      "/declarations/twoPersonnes/InfoPersons/myInfo/vehicleInfo",
    );
  };

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
            name="arrowleft"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            {" "}
            Informations personnelles
          </Text>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.contentContainer}>
          {!userData ? (
            <Loading text="Loading.." />
          ) : (
            <InputsShowGroup dataToShow={userData} editable={true} />
          )}
        </View>
      </ScrollView>

      <View style={styles.footContainer}>
        <SingleBottomButton
          children="Continuer"
          onPress={handlePressContinue}
        />
      </View>
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

  safeAreaContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },

  contentContainer: {
    marginTop: 20,
    marginBottom: 40,
    justifyContent: "center",
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

  footContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
