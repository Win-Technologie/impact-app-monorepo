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
import { Alert, ActivityIndicator } from "react-native";
import { useRecoilValue } from "recoil";
import { useLocalSearchParams } from "expo-router";
import { UserInfoState } from "../../GlobalState/UserInfoState";
import { SelectedVehicleState } from "../../GlobalState/SelectedVehiclesState";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const formatDate = (dateString, format = "year/mm/dd") => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
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
  const params = useLocalSearchParams();
  const recoilVehicleId = useRecoilValue(SelectedVehicleState);
  const selectedVehicleId = params.vehicleId || recoilVehicleId;
  const ownerDetails = useRecoilValue(UserInfoState);
  const [insuranceDetails, setInsuranceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insuranceState, setInsuranceState] = useState(null);
  const [saving, setSaving] = useState(false);
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
            setInsuranceState(selectedVehicleData.insurance);
          } else {
            // Initialize empty insurance state so user can add one
            setInsuranceDetails(null);
            setInsuranceState({ insuranceCompany: "", policyNumber: "", expirationDate: "" });
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

  const insuranceInfo = insuranceState
    ? [
        { name: "insuranceCompany", style: "column", label: t("insuranceInfo.companyName"), value: insuranceState?.insuranceCompany || "" },
        { name: "policyAndExpiration", style: "row", firstLabel: t("insuranceInfo.policyNumber"), valueFirstLabel: insuranceState?.policyNumber || "", secondLabel: t("insuranceInfo.expirationDate"), valueSecondLabel: insuranceState?.expirationDate || "" },
      ]
    : [];

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

  const handleFieldChange = (name, text) => {
    if (!insuranceState) return;
    if (name === "insuranceCompany") {
      setInsuranceState(prev => ({ ...prev, insuranceCompany: text }));
      return;
    }
    if (name.startsWith("policyAndExpiration")) {
      const isFirst = name.endsWith("-first");
      if (isFirst) setInsuranceState(prev => ({ ...prev, policyNumber: text }));
      else setInsuranceState(prev => ({ ...prev, expirationDate: text }));
      return;
    }
  };

  const toIsoIfPossible = (dateStr) => {
    if (!dateStr) return dateStr;
    // Already ISO-ish
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.toISOString();
    }

    // Try native parse first
    const native = new Date(dateStr);
    if (!isNaN(native.getTime())) {
      const y = native.getFullYear();
      if (y >= 1900 && y <= 2100) return native.toISOString();
    }

    // Try common localized formats like DD/MM/YYYY or MM/DD/YYYY
    const m = String(dateStr).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      let p1 = parseInt(m[1], 10);
      let p2 = parseInt(m[2], 10);
      let py = parseInt(m[3], 10);
      if (m[3].length === 2) py = py + (py < 50 ? 2000 : 1900);

      // Try treat as DD/MM/YYYY
      let d1 = new Date(py, p2 - 1, p1);
      if (!isNaN(d1.getTime()) && d1.getFullYear() === py && d1.getMonth() === p2 - 1 && d1.getDate() === p1 && py >= 1900 && py <= 2100) {
        return d1.toISOString();
      }

      // Try treat as MM/DD/YYYY
      let d2 = new Date(py, p1 - 1, p2);
      if (!isNaN(d2.getTime()) && d2.getFullYear() === py && d2.getMonth() === p1 - 1 && d2.getDate() === p2 && py >= 1900 && py <= 2100) {
        return d2.toISOString();
      }
    }

    // If we couldn't parse into a sensible year range, return original so server validation can report.
    return dateStr;
  };

  const saveInsurance = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Erreur", "Session expirée");
        setSaving(false);
        return;
      }

      // Client-side validation for expiration date
      const parsedExpirationIso = toIsoIfPossible(insuranceState?.expirationDate);
      const isIsoLike = typeof parsedExpirationIso === "string" && /^\d{4}-\d{2}-\d{2}T/.test(parsedExpirationIso);
      if (!insuranceState?.expirationDate || !isIsoLike) {
        Alert.alert("Erreur", "Date d'expiration invalide. Utilisez JJ/MM/AAAA ou AAAA-MM-JJ.");
        setSaving(false);
        return;
      }

      if (insuranceState && insuranceState._id) {
        // edit existing - backend requires policyNumber, expirationDate (ISO), vehicleId
        const payload = {
          policyNumber: insuranceState.policyNumber,
          expirationDate: parsedExpirationIso,
          vehicleId: selectedVehicleId,
        };

        const response = await fetch(`${API_URL}insurances/${insuranceState._id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          Alert.alert("Succès", "Assurance mise à jour");
        } else {
          let bodyText = await response.text();
          try {
            const parsed = JSON.parse(bodyText);
            console.error("Insurance update failed", parsed);
            const detail = parsed.details ? JSON.stringify(parsed.details) : "";
            Alert.alert("Erreur", `${parsed.error || 'Impossible de mettre à jour l\'assurance'}\n${detail}`);
          } catch (e) {
            console.error("Insurance update failed", bodyText);
            Alert.alert("Erreur", "Impossible de mettre à jour l'assurance");
          }
        }
      } else {
        // add new - backend expects insuranceCompany, policyNumber, expirationDate in body and vehicleId in URL
        const payload = {
          insuranceCompany: insuranceState.insuranceCompany,
          policyNumber: insuranceState.policyNumber,
          expirationDate: parsedExpirationIso,
        };

        const response = await fetch(`${API_URL}insurances/add/${selectedVehicleId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          Alert.alert("Succès", "Assurance ajoutée");
        } else {
          let bodyText = await response.text();
          try {
            const parsed = JSON.parse(bodyText);
            console.error("Insurance add failed", parsed);
            const detail = parsed.details ? JSON.stringify(parsed.details) : "";
            Alert.alert("Erreur", `${parsed.error || 'Impossible d\'ajouter l\'assurance'}\n${detail}`);
          } catch (e) {
            console.error("Insurance add failed", bodyText);
            Alert.alert("Erreur", "Impossible d'ajouter l'assurance");
          }
        }
      }
    } catch (error) {
      console.error(error);
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
            <InputsShowGroup dataToShow={insuranceInfo} editable={true} onChange={handleFieldChange} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>
              {t("insuranceInfo.ownerInfo")}
            </Text>
            <InputsShowGroup dataToShow={ownerInfo} editable={false} />
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={{ backgroundColor: "#0B8BA8", padding: 15, borderRadius: 6, alignItems: "center" }}
            onPress={saveInsurance}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "white", fontWeight: "600" }}>Enregistrer</Text>}
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
