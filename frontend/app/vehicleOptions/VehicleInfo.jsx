import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import InputsShowGroup from "../../components/Utils/Inputs/InputsShowGroup";
import { useRecoilValue } from "recoil";
import { useLocalSearchParams } from "expo-router";
import { SelectedVehicleState } from "../../GlobalState/SelectedVehiclesState";
import { UserInfoState } from "../../GlobalState/UserInfoState";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const VehicleInfo = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const recoilVehicleId = useRecoilValue(SelectedVehicleState);
  const selectedVehicleId = params.vehicleId || recoilVehicleId;
  const ownerDetails = useRecoilValue(UserInfoState);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

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
    const fetchVehicleDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.error('No userToken found when fetching vehicle details');
        }
        const response = await fetch(`${API_URL}vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched vehicles data:", data);
          // Find the selected vehicle from the carsWithInsurances array
          const selectedVehicleData = data.carsWithInsurances?.find(
            item => item.car?._id === selectedVehicleId
          );
          
          console.log("Selected vehicle data:", selectedVehicleData);
          
          if (selectedVehicleData?.car) {
            setVehicle(selectedVehicleData.car);
          } else {
            console.log("Vehicle not found for ID:", selectedVehicleId);
          }
        } else {
          const text = await response.text();
          console.error("Failed to fetch vehicles:", response.status, text);
        }
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedVehicleId) {
      fetchVehicleDetails();
    } else {
      console.log("No vehicle selected");
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

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Véhicule non trouvé</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{color: '#19363C', marginTop: 20}}>Retour</Text>
          </TouchableOpacity>
        </View>
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

  const vehicleInfo = [
    {
      style: "column",
      label: t("vehicleInfo.brand"),
      value: vehicle.brand || "N/A",
    },
    {
      style: "column",
      label: t("vehicleInfo.model"),
      value: vehicle.model || "N/A",
    },
    {
      style: "column",
      label: t("vehicleInfo.year"),
      value: vehicle.year ? vehicle.year.toString() : "N/A",
    },
    {
      style: "column",
      label: t("vehicleInfo.color"),
      value: vehicle.color || "N/A",
    },
    {
      style: "column",
      label: t("vehicleInfo.plate"),
      value: vehicle.plate || "N/A",
    },
    {
      style: "column",
      label: t("vehicleInfo.serialNumber"),
      value: vehicle.serialNumber || "N/A",
    },
  ];

  // If vehicle has ownerInfo (meaning user is NOT the owner), use that. Otherwise use user's profile.
  const displayOwner = (vehicle?.isOwner === false && vehicle?.ownerInfo) ? vehicle.ownerInfo : userProfile;
  
  const ownerInfo = [
    {
      style: "column",
      label: t("vehicleInfo.ownerFirstName"),
      value: displayOwner?.firstName || displayOwner?.name || "N/A",
    },
    {
      style: "column",
      label: t("vehicleInfo.ownerLastName"),
      value: displayOwner?.lastName || "N/A",
    },
    {
      style: "column",
      label: t("vehicleInfo.ownerPhone"),
      value: displayOwner?.phone || "N/A",
    },
    {
      style: "column",
      label: t("vehicleInfo.ownerAddress"),
      value: displayOwner?.address || "N/A",
    },
    {
      style: "row",
      firstLabel: t("vehicleInfo.ownerCity"),
      valueFirstLabel: displayOwner?.city || "N/A",
      secondLabel: t("vehicleInfo.ownerPostalCode"),
      valueSecondLabel: displayOwner?.postalCode || "N/A",
    },
    {
      style: "row",
      firstLabel: t("vehicleInfo.ownerCountry"),
      valueFirstLabel: displayOwner?.country || "N/A",
      secondLabel: t("vehicleInfo.ownerProvince"),
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
            {t("vehicleList.title")}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>{t("vehicleInfo.title")}</Text>
        <InputsShowGroup dataToShow={vehicleInfo} editable={false} />
        <Text style={styles.sectionTitle}>{t("vehicleInfo.ownerInfo")}</Text>
        <InputsShowGroup dataToShow={ownerInfo} editable={false} />
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 35,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
    marginVertical: 10,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30, // Add bottom padding to ensure the last item is visible
  },
});

export default VehicleInfo;
