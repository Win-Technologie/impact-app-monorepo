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
import { AntDesign } from "@expo/vector-icons";
import InputsShowGroup from "../../../../../components/Utils/Inputs/InputsShowGroup";
import { fetchUserInfoAndVehicle } from "../../../../api/users/userApi";
import { useRecoilState, useRecoilValue } from "recoil";
import { accidentVehicleState } from "../../../../../GlobalState/AccidentVehiculeState";
import { globalPersonalInfo } from "../../../../../GlobalState/PersonalInfoState";
import Loading from "../../../../../components/Utils/Notification/Loading";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

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

  const { t } = useTranslation();

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
          { style: "column", label: t("vehicleInfo.ownerFirstName"), value: u.name || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
          { style: "column", label: t("vehicleInfo.ownerLastName"), value: u.lastName || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
          { style: "row", firstLabel: t("insuranceScreen.licenseNumberPlaceholder"), valueFirstLabel: u.driverLicense?.number || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }), secondLabel: t("driverLicense"), valueSecondLabel: u.driverLicense?.expires || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
          { style: "column", label: t("licenseDetails.licenseCategoryPlaceholder"), value: u.driverLicense?.category || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
          { style: "column", label: t("insuranceInfo.ownerEmail", { defaultValue: "adresse courriel" }), value: u.email || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
          { style: "column", label: t("vehicleInfo.ownerPhone"), value: u.phone || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
          { style: "column", label: t("vehicleInfo.ownerAddress", { defaultValue: "Numéro et rue de l'adresse" }), value: u.address || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
          { style: "row", firstLabel: t("vehicleInfo.ownerCity"), valueFirstLabel: u.city || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }), secondLabel: t("vehicleInfo.ownerPostalCode"), valueSecondLabel: u.postalCode || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
          { style: "row", firstLabel: t("vehicleInfo.ownerCountry"), valueFirstLabel: u.country || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }), secondLabel: t("vehicleInfo.ownerProvince"), valueSecondLabel: u.province || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }) },
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
        label: t("vehicleInfo.ownerFirstName"),
        value: data.owner?.name || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
      {
        style: "column",
        label: t("vehicleInfo.ownerLastName"),
        value: data.owner.lastName || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
      {
        style: "row",
        firstLabel: t("insuranceScreen.licenseNumberPlaceholder"),
        valueFirstLabel: data.driverLicense?.number || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
        secondLabel: t("driverLicense"),
        valueSecondLabel: data.driverLicense?.expires || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
      {
        style: "column",
        label: t("licenseDetails.licenseCategoryPlaceholder"),
        value: data.driverLicense?.category || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
      {
        style: "column",
        label: t("insuranceInfo.ownerEmail", { defaultValue: "adresse courriel" }),
        value: data.owner.email || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
      {
        style: "column",
        label: t("vehicleInfo.ownerPhone"),
        value: data.owner.phone || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
      {
        style: "column",
        label: t("vehicleInfo.ownerAddress", { defaultValue: "Numéro et rue de l'adresse" }),
        value: data.owner.address || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
      {
        style: "row",
        firstLabel: t("vehicleInfo.ownerCity"),
        valueFirstLabel: data.owner.city || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
        secondLabel: t("vehicleInfo.ownerPostalCode"),
        valueSecondLabel: data.owner.postalCode || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
      {
        style: "row",
        firstLabel: t("vehicleInfo.ownerCountry"),
        valueFirstLabel: data.owner.country || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
        secondLabel: t("vehicleInfo.ownerProvince"),
        valueSecondLabel: data.owner.province || t("declaration.noInformationAvailable", { defaultValue: "non disponible" }),
      },
    ];
    setUserData(dataToShow);
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
        <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => router.back()}>
          <AntDesign name="arrow-left" size={20} color="#19363C" style={{ fontWeight: "200" }} />
          <Text style={{ color: "#19363C" }}>{"   "}{t("common.back")}</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>{t("declaration.personalInformation")}</Text>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.contentContainer}>
          {userData === null ? (
            <Loading text={t("pleasewait")} />
          ) : userData.length === 0 ? (
            <>
              <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>{t("declaration.noInformationAvailable")}</Text>
            </>
          ) : (
            <InputsShowGroup dataToShow={userData} editable={false} />
          )}
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
