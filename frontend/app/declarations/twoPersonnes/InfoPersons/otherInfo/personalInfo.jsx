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
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { insuranceCompanyState } from '../../GlobalState/InsuranceState';
import { useForm, Controller } from "react-hook-form";
import SingleBottomButton from "../../../../../components/SignUp/SingleBottomButton";
import { AntDesign } from "@expo/vector-icons";
import InputsShowGroup from "../../../../../components/Utils/Inputs/InputsShowGroup";
import { fetchUserInfoAndVehicle, getMyVehicles } from "../../../../api/users/userApi";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { accidentVehicleState } from "../../../../../GlobalState/AccidentVehiculeState";
import { globalPersonalInfo } from "../../../../../GlobalState/PersonalInfoState";
import Loading from "../../../../../components/Utils/Notification/Loading";
import { ScannedQrCodeData } from "../../../../../GlobalState/ScannedQrCodeData";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";

export default function PersonanalInformation() {
  //obtenir la valeur de manière globale
  const VEHICLE_ID = useRecoilValue(accidentVehicleState);
  const ENDPOINT = "users/user/vehicle/info/";
  const [userData, setUserData] = useState(null);
  const [, setPersonalInfoState] = useRecoilState(globalPersonalInfo);
  const [isEditable, setIsEditable] = useState(true);
  const userInfo = useRecoilValue(ScannedQrCodeData);
  const setScannedData = useSetRecoilState(ScannedQrCodeData);
  const [allVehicles, setAllVehicles] = useState([]);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);

  //obtenir les données au moment du rendu du composant
  useEffect(() => {
    //  userInformation()
    createDataUser(userInfo);
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
      createDataUser(result.data);
      setShowVehicleSelector(false);
      Alert.alert("Succès", "Informations remplies depuis votre compte");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les informations");
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
            <AntDesign name="user" size={20} color="#0B8BA8" />
            <Text style={styles.fillFromAccountText}>
              Remplir a partir du compte
            </Text>
          </TouchableOpacity>
        </View>

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
