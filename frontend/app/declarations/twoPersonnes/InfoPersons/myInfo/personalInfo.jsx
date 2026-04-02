import React, { useState, useEffect } from "react";
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
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import SingleBottomButton from "../../../../../components/SignUp/SingleBottomButton";
import { AntDesign } from "@expo/vector-icons";
import InputsShowGroup from "../../../../../components/Utils/Inputs/InputsShowGroup";
import { fetchUserInfoAndVehicle } from "../../../../api/users/userApi";
import { useRecoilState, useRecoilValue } from "recoil";
import { accidentVehicleState } from "../../../../../GlobalState/AccidentVehiculeState";
import { globalPersonalInfo } from "../../../../../GlobalState/PersonalInfoState";
import Loading from "../../../../../components/Utils/Notification/Loading";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonanalInformation() {
  const VEHICLE_ID = useRecoilValue(accidentVehicleState);
  const ENDPOINT = "users/user/vehicle/info/";
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [userData, setUserData] = useState(null);
  const [, setPersonalInfoState] = useRecoilState(globalPersonalInfo);
  const userInfo = useRecoilValue(globalPersonalInfo);

  useEffect(() => {
    if (userInfo?.owner?.name || userInfo?.owner?.email) {
      createDataUser(userInfo);
    } else {
      // No vehicle selected or owner data not loaded — fetch profile directly from API
      fetchProfileFromApi();
    }
  }, [userInfo]);

  const fetchProfileFromApi = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userId = JSON.parse(await AsyncStorage.getItem("user"))?.user?._id;
      if (!token || !userId) { setUserData([]); return; }
      const response = await fetch(`${API_URL}users/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.user) {
        const u = data.user;
        setUserData([
          { style: "column", label: "Prénom", value: u.name || "non disponible" },
          { style: "column", label: "Nom", value: u.lastName || "non disponible" },
          { style: "row", firstLabel: "Numéro du permis de conduire", valueFirstLabel: u.driverLicense?.number || "non disponible", secondLabel: "Expiration", valueSecondLabel: u.driverLicense?.expires || "non disponible" },
          { style: "column", label: "adresse courriel", value: u.email || "non disponible" },
          { style: "column", label: "Numéro de téléphone", value: u.phone || "non disponible" },
          { style: "column", label: "Numéro et rue de l'adresse", value: u.address || "non disponible" },
          { style: "row", firstLabel: "Ville", valueFirstLabel: u.city || "non disponible", secondLabel: "Code postale", valueSecondLabel: u.postalCode || "non disponible" },
          { style: "row", firstLabel: "Pays", valueFirstLabel: u.country || "non disponible", secondLabel: "Province", valueSecondLabel: u.province || "non disponible" },
        ]);
      } else {
        setUserData([]);
      }
    } catch {
      setUserData([]);
    }
  };

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
        valueFirstLabel: data.driverLicense?.number || "non disponible",
        secondLabel: "Expiration",
        valueSecondLabel: data.driverLicense?.expires || "non disponible",
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
            {" "}
            Informations personnelles
          </Text>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.contentContainer}>
          {userData === null ? (
            <Loading text="Loading.." />
          ) : userData.length === 0 ? (
            <>
              <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
                Informations non disponibles. Veuillez sélectionner un véhicule.
              </Text>
            </>
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
