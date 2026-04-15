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
import { Alert, ActivityIndicator } from "react-native";
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
  const [vehicleState, setVehicleState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
            setVehicleState(selectedVehicleData.car);
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

  const vehicleInfo = vehicleState
    ? [
        { name: "brand", style: "column", label: t("vehicleInfo.brand"), value: vehicleState.brand || "" },
        { name: "model", style: "column", label: t("vehicleInfo.model"), value: vehicleState.model || "" },
        { name: "year", style: "column", label: t("vehicleInfo.year"), value: vehicleState.year ? String(vehicleState.year) : "" },
        { name: "color", style: "column", label: t("vehicleInfo.color"), value: vehicleState.color || "" },
        { name: "plate", style: "column", label: t("vehicleInfo.plate"), value: vehicleState.plate || "" },
        { name: "serialNumber", style: "column", label: t("vehicleInfo.serialNumber"), value: vehicleState.serialNumber || "" },
      ]
    : [];

  // Prefer vehicle's ownerInfo when present so edits to owner fields are visible immediately.
  // Fall back to user's profile when ownerInfo is empty.
  const displayOwner = (vehicleState?.ownerInfo && Object.keys(vehicleState.ownerInfo).length > 0)
    ? vehicleState.ownerInfo
    : userProfile;

  const ownerInfo = displayOwner
    ? [
        { name: "ownerFirstName", style: "column", label: t("vehicleInfo.ownerFirstName"), value: displayOwner?.firstName || "" },
        { name: "ownerLastName", style: "column", label: t("vehicleInfo.ownerLastName"), value: displayOwner?.lastName || "" },
        { name: "ownerPhone", style: "column", label: t("vehicleInfo.ownerPhone"), value: displayOwner?.phone || "" },
        { name: "ownerAddress", style: "column", label: t("vehicleInfo.ownerAddress"), value: displayOwner?.address || "" },
        { name: "ownerCityPostal", style: "row", firstLabel: t("vehicleInfo.ownerCity"), valueFirstLabel: displayOwner?.city || "", secondLabel: t("vehicleInfo.ownerPostalCode"), valueSecondLabel: displayOwner?.postalCode || "" },
        { name: "ownerCountryProvince", style: "row", firstLabel: t("vehicleInfo.ownerCountry"), valueFirstLabel: displayOwner?.country || "", secondLabel: t("vehicleInfo.ownerProvince"), valueSecondLabel: displayOwner?.province || "" },
      ]
    : [];

  const handleFieldChange = (name, text) => {
    if (!vehicleState) return;
    // vehicle simple fields
    if (["brand", "model", "year", "color", "plate", "serialNumber"].includes(name)) {
      setVehicleState(prev => ({ ...prev, [name]: name === "year" ? (text ? Number(text) : null) : text }));
      return;
    }

    // owner fields: name could be ownerFirstName, ownerLastName, ownerPhone, ownerAddress
    if (name.startsWith("owner") && !name.includes("-") && !name.includes("Postal") ) {
      const ownerField = name.replace("owner", "");
      const key = ownerField.charAt(0).toLowerCase() + ownerField.slice(1);
      setVehicleState(prev => ({ ...prev, ownerInfo: { ...(prev.ownerInfo || {}), [key]: text } }));
      return;
    }

    // row patterns: ownerCityPostal-first -> city, -second -> postalCode
    if (name.startsWith("ownerCityPostal")) {
      const isFirst = name.endsWith("-first");
      setVehicleState(prev => ({ ...prev, ownerInfo: { ...(prev.ownerInfo || {}), [isFirst ? "city" : "postalCode"]: text } }));
      return;
    }

    if (name.startsWith("ownerCountryProvince")) {
      const isFirst = name.endsWith("-first");
      setVehicleState(prev => ({ ...prev, ownerInfo: { ...(prev.ownerInfo || {}), [isFirst ? "country" : "province"]: text } }));
      return;
    }
  };

  const saveVehicle = async () => {
    if (!vehicleState || !selectedVehicleId) return;
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const payload = {
        brand: vehicleState.brand,
        model: vehicleState.model,
        year: vehicleState.year,
        color: vehicleState.color,
        plate: vehicleState.plate,
        serialNumber: vehicleState.serialNumber,
        ...(vehicleState.ownerInfo ? { ownerInfo: vehicleState.ownerInfo } : {}),
      };

      const response = await fetch(`${API_URL}vehicles/${selectedVehicleId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const resText = await response.text();
      let resJson = null;
      try { resJson = JSON.parse(resText); } catch (e) { /* not json */ }
      if (response.ok) {
        // Update local state with server's returned car when available
        if (resJson && resJson.car) {
          setVehicle(resJson.car);
          setVehicleState(resJson.car);
        }
        console.log('Vehicle update response:', resJson || resText);
        Alert.alert("Succès", "Véhicule mis à jour");
      } else {
        console.error("Update failed:", response.status, resText);
        Alert.alert("Erreur", resJson?.error || "Impossible de mettre à jour le véhicule");
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

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
        <InputsShowGroup dataToShow={vehicleInfo} editable={true} onChange={handleFieldChange} />
        <Text style={styles.sectionTitle}>{t("vehicleInfo.ownerInfo")}</Text>
        <InputsShowGroup dataToShow={ownerInfo} editable={true} onChange={handleFieldChange} />

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={{ backgroundColor: "#0B8BA8", padding: 15, borderRadius: 6, alignItems: "center" }}
            onPress={saveVehicle}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "white", fontWeight: "600" }}>Enregistrer</Text>
            )}
          </TouchableOpacity>
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
