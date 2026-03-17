import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import InputsShowGroup from "../../components/Utils/Inputs/InputsShowGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilValue } from "recoil";
import { UserInfoState } from "../../GlobalState/UserInfoState";
import { SelectedVehicleState } from "../../GlobalState/SelectedVehiclesState";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const formatDate = (dateString, format = "year/mm/dd") => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (format === "year/mm/dd") {
    return `${year}/${month}/${day}`;
  } else if (format === "mm/dd/year") {
    return `${month}/${day}/${year}`;
  } else {
    return dateString; // Retourne la date non formatée si le format n'est pas reconnu
  }
};

const InsuranceInfo = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [insuranceDetails, setInsuranceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const selectedVehicleId = useRecoilValue(SelectedVehicleState);
  const ownerDetails = useRecoilValue(UserInfoState);
  const [userProfile, setUserProfile] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.21:8000/api/";

  useEffect(() => {
    // Fetch logged-in user's profile data
    const fetchUserProfile = async () => {
      try {
        const userData = JSON.parse(await AsyncStorage.getItem("user"));
        if (userData?.user) {
          setUserProfile(userData.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchInsuranceDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await fetch(`${API_URL}vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched insurance data:", data);
          // Find the selected vehicle's insurance from the carsWithInsurances array
          const selectedVehicleData = data.carsWithInsurances?.find(
            item => item.car?._id === selectedVehicleId
          );
          
          console.log("Selected vehicle insurance data:", selectedVehicleData);
          
          if (selectedVehicleData?.car) {
            setVehicleData(selectedVehicleData.car);
          }
          
          if (selectedVehicleData?.insurance) {
            setInsuranceDetails(selectedVehicleData.insurance);
          } else {
            console.log("No insurance found for vehicle ID:", selectedVehicleId);
          }
        } else {
          console.error("Failed to fetch vehicles:", response.status);
        }
      } catch (error) {
        console.error("Error fetching insurance details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedVehicleId) {
      fetchInsuranceDetails();
    } else {
      console.log("No vehicle selected for insurance");
      setLoading(false);
    }
  }, [selectedVehicleId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!ownerDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading owner details...</Text>
      </SafeAreaView>
    );
  }

  const insuranceInfo = [
    {
      style: "column",
      label: t("insuranceInfo.companyName"),
      value: insuranceDetails?.insuranceCompany || "N/A",
    },
    {
      style: "row",
      firstLabel: t("insuranceInfo.policyNumber"),
      valueFirstLabel: insuranceDetails?.policyNumber || "N/A",
      secondLabel: t("insuranceInfo.expirationDate"),
      valueSecondLabel: insuranceDetails?.expirationDate
        ? formatDate(insuranceDetails?.expirationDate, "year/mm/dd")
        : "N/A",
    },
  ];

  // If vehicle has ownerInfo (meaning user is NOT the owner), use that. Otherwise use user's profile.
  const displayOwner = (vehicleData?.isOwner === false && vehicleData?.ownerInfo) ? vehicleData.ownerInfo : userProfile;

  const ownerInfo = [
    {
      style: "column",
      label: t("insuranceInfo.ownerFirstName"),
      value: displayOwner?.firstName || displayOwner?.name || "N/A",
    },
    {
      style: "column",
      label: t("insuranceInfo.ownerLastName"),
      value: displayOwner?.lastName || "N/A",
    },
    {
      style: "column",
      label: t("insuranceInfo.ownerEmail"),
      value: displayOwner?.email || "N/A",
    },
    {
      style: "column",
      label: t("insuranceInfo.ownerPhone"),
      value: displayOwner?.phone || "N/A",
    },
    {
      style: "column",
      label: t("insuranceInfo.ownerAddress"),
      value: displayOwner?.address || "N/A",
    },
    {
      style: "row",
      firstLabel: t("insuranceInfo.ownerCity"),
      valueFirstLabel: displayOwner?.city || "N/A",
      secondLabel: t("insuranceInfo.ownerPostalCode"),
      valueSecondLabel: displayOwner?.postalCode || "N/A",
    },
    {
      style: "row",
      firstLabel: t("insuranceInfo.ownerCountry"),
      valueFirstLabel: displayOwner?.country || "N/A",
      secondLabel: t("insuranceInfo.ownerProvince"),
      valueSecondLabel: displayOwner?.province || "N/A",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: 20,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row" }}
          onPress={() => {
            router.back();
          }}
        >
          <AntDesign
            name="left"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            {t("insuranceInfo.title")}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t("insuranceInfo.title")}</Text>
            <InputsShowGroup dataToShow={insuranceInfo} editable={false} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>
              {t("insuranceInfo.ownerInfo")}
            </Text>
            <InputsShowGroup dataToShow={ownerInfo} editable={false} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 23,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
  },
  content: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
  },
});

export default InsuranceInfo;

//
