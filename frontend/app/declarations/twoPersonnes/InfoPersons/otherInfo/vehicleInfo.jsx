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
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import InputsShowGroup from "../../../../../components/Utils/Inputs/InputsShowGroup";
import SingleBottomButton from "../../../../../components/SignUp/SingleBottomButton";
import { AntDesign } from "@expo/vector-icons";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalPersonalInfo } from "../../../../../GlobalState/PersonalInfoState";
import Loading from "../../../../../components/Utils/Notification/Loading";
import { ScannedQrCodeData } from "../../../../../GlobalState/ScannedQrCodeData";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserInfoAndVehicle, getMyVehicles } from "../../../../api/users/userApi";
import SelectDropdown from "react-native-select-dropdown";

export default function VehicleInfo() {
  //obtenir la valeur de manière globale
  const personalInformation = useRecoilValue(ScannedQrCodeData);
  const setScannedData = useSetRecoilState(ScannedQrCodeData);
  const [allVehicles, setAllVehicles] = useState([]);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const ENDPOINT = "users/user/vehicle/info/";

  useEffect(() => {
    loadMyVehicles();
  }, []);

  const loadMyVehicles = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    const vehiclesResponse = await getMyVehicles(userToken, "vehicles/");
    if (vehiclesResponse.status === 200) {
      setAllVehicles(vehiclesResponse.data.carsWithInsurances);
    }
  };

  const handleFillFromAccount = () => {
    if (allVehicles.length === 0) {
      Alert.alert("Erreur", "Aucun véhicule trouvé dans votre compte.");
      return;
    }
    setShowVehicleSelector(true);
  };

  const handleVehicleSelect = async (selectedItem) => {
    const vehicleId = selectedItem?.car?._id;
    if (!vehicleId) {
      Alert.alert("Erreur", "Véhicule invalide");
      return;
    }

    const userToken = await AsyncStorage.getItem("userToken");
    try {
      const result = await fetchUserInfoAndVehicle(
        vehicleId,
        userToken,
        ENDPOINT,
      );

      if (result.error) {
        throw new Error(`Failed to fetch data: ${result.status}`);
      }

      // Set the scanned data with the user's own vehicle info
      setScannedData(result.data);
      setShowVehicleSelector(false);
      Alert.alert("Succès", "Informations remplies depuis votre compte");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les informations");
    }
  };

  /**
   * * Contient des informations détaillées sur le véhicule à afficher.
   */
  const infoVehicle = [
    {
      style: "column",
      label: "Numéro du certificat d’immatriculation",
      value: personalInformation?.vehicle?.serialNumber || "non disponible",
    },
    {
      style: "column",
      label: "Numéro de plaque",
      value: personalInformation?.vehicle?.plate || "non disponible",
    },
    {
      style: "row",
      firstLabel: "Modèle du véhicule",
      valueFirstLabel: personalInformation?.vehicle?.model || "non disponible",
      secondLabel: "Année",
      valueSecondLabel:
        personalInformation?.vehicle?.year?.toString() || "non disponible",
    },
    {
      style: "column",
      label: "Couleur du véhicule",
      value: personalInformation?.vehicle?.color || "non disponible",
    },
  ];

  /**
   * * Contient des informations détaillées sur le proprietaire du véhicule à afficher.
   */
  const vehicleOwner = [
    {
      style: "column",
      label: "Prénom",
      value: personalInformation.owner.name || "non disponible",
    },
    {
      style: "column",
      label: "Nom",
      value: personalInformation.owner.lastName || "non disponible",
    },
    {
      style: "column",
      label: "adresse courriel",
      value: personalInformation.owner.email || "non disponible",
    },
    {
      style: "column",
      label: "Numéro de téléphone",
      value: personalInformation.owner.phone || "non disponible",
    },
    {
      style: "column",
      label: "Numéro et rue de l'adresse",
      value: personalInformation.owner.address || "non disponible",
    },
    {
      style: "row",
      firstLabel: "Ville",
      valueFirstLabel: personalInformation.owner.city || "non disponible",
      secondLabel: "Code postale",
      valueSecondLabel:
        personalInformation.owner.postalCode || "non disponible",
    },
    {
      style: "row",
      firstLabel: "Pays",
      valueFirstLabel: personalInformation.owner.country || "non disponible",
      secondLabel: "Province",
      valueSecondLabel: personalInformation.owner.province || "non disponible",
    },
  ];

  const handlePressContinue = () => {
    router.navigate(
      "/declarations/twoPersonnes/InfoPersons/myInfo/assuranceInfo",
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
            name="arrowleft"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            Information d'assurance
          </Text>
        </View>
      </View>

      {showVehicleSelector && (
        <View style={styles.fillFromAccountContainer}>
          <Text style={styles.fillFromAccountTitle}>
            Sélectionnez un véhicule de votre compte:
          </Text>
          <SelectDropdown
            data={allVehicles}
            defaultButtonText="Choisir un véhicule"
            onSelect={handleVehicleSelect}
            buttonTextAfterSelection={(selectedItem) =>
              selectedItem?.car?.model
            }
            rowTextForSelection={(item) => item.car.model}
            buttonStyle={styles.dropdownBtnStyle}
            buttonTextStyle={styles.dropdownBtnTxtStyle}
            dropdownStyle={styles.dropdownDropdownStyle}
            rowStyle={styles.dropdownRowStyle}
            rowTextStyle={styles.dropdownRowTxtStyle}
            renderDropdownIcon={() => (
              <AntDesign name="down" size={14} color="gray" />
            )}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowVehicleSelector(false)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.fillButtonContainer}>
          <TouchableOpacity
            style={styles.fillFromAccountButton}
            onPress={handleFillFromAccount}
          >
            <AntDesign name="car" size={20} color="#0B8BA8" />
            <Text style={styles.fillFromAccountText}>
              Remplir a partir du compte
            </Text>
          </TouchableOpacity>
        </View>
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

  fillButtonContainer: {
    marginVertical: 15,
  },

  fillFromAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0B8BA8",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },

  fillFromAccountText: {
    color: "#0B8BA8",
    fontSize: 16,
    fontWeight: "600",
  },

  fillFromAccountContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },

  fillFromAccountTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#19363C",
    marginBottom: 10,
  },

  dropdownBtnStyle: {
    width: "100%",
    height: 49,
    backgroundColor: "#FFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },

  dropdownBtnTxtStyle: {
    color: "#444",
    textAlign: "left",
  },

  dropdownDropdownStyle: {
    backgroundColor: "#EFEFEF",
  },

  dropdownRowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },

  dropdownRowTxtStyle: {
    color: "#444",
    textAlign: "left",
  },

  cancelButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
