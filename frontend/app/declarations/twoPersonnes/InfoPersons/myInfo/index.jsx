import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import Icon from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import { AntDesign } from "@expo/vector-icons";
import { getMyVehicles } from "../../../../api/users/userApi";
import { useRecoilState } from "recoil";
import { accidentVehicleState } from "../../../../../GlobalState/AccidentVehiculeState";
import { fetchUserInfoAndVehicle } from "../../../../api/users/userApi";
import { globalPersonalInfo } from "../../../../../GlobalState/PersonalInfoState";

const MyInfo = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [qrValue, setQrValue] = useState(""); // Initial QR code value
  const [qrImageUri, setQrImageUri] = useState(null); // URI of the QR code image
  const [allVehicles, setAllVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [errorVehicleState, setErrorVehicleState] = useState("");
  const [vehicleState, setVehiculeState] = useRecoilState(accidentVehicleState);
  const [textData, setTextData] = useState(""); // State to hold the text data
  const ENDPOINT = "vehicles/";
  const ENDPOINT2 = "users/user/vehicle/info/";
  const [, setPersonalInfoState] = useRecoilState(globalPersonalInfo);

  useEffect(() => {
    loadVehicles();
  }, []);

  const fetchTokenAndQR = async (vehicleId) => {
    const token = await AsyncStorage.getItem("userToken");
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    if (!API_URL) {
      return;
    }
    if (!vehicleId) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}users/code/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vehicleId }),
      });

      const data = await response.json();
      if (response.ok) {
        setQrImageUri(data.qrImage);
        setTextData(data.AlphNumCode);
      } else {
        throw new Error(data.msg || "Failed to fetch QR code");
      }
    } catch (error) {
      // console.error("Error fetching QR code:", error.message);
    }
  };

  const loadVehicles = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    const vehiclesResponse = await getMyVehicles(userToken, "vehicles/");
    if (vehiclesResponse.status === 200) {
      setAllVehicles(vehiclesResponse.data.carsWithInsurances);
    } else {
    }
  };

  const handleVehicleSelect = (selectedItem) => {
    // Using selectedItem._id since the object uses _id as shown in your error log
    const vehicleId = selectedItem._id;
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
      setVehiculeState(vehicleId);
      fetchTokenAndQR(vehicleId); // Fetch QR Code using the correct vehicle ID
      userInformation(vehicleId);
      setErrorVehicleState(""); // Clear any previous errors
    } else {
      //console.error("Selected item is invalid:", selectedItem);
      setErrorVehicleState("Invalid vehicle selection. Please try again.");
    }
  };

  /**
   * Récupère les informations de l'utilisateur et de son véhicule à partir du backend
   */
  async function userInformation(idVehicule) {
    const userToken = await AsyncStorage.getItem("userToken");

    try {
      // Fetching user and vehicle information
      const result = await fetchUserInfoAndVehicle(
        idVehicule,
        userToken,
        ENDPOINT2,
      );

      if (result.error) {
        // If there's an error returned from the fetch function, handle it accordingly
        throw new Error(
          `Failed to fetch data: ${result.status} ${result.message}`,
        );
      }

      setPersonalInfoState(result.data);
      // console.log(result.data);  // Log data to debug and confirm it's being received
    } catch (error) {
      // Error handling if the try block fails
      console.error("Error fetching user information:", error);
      // alert(`Failed to fetch user information: ${error.message}`);
    }
  }

  const consultInformation = (type) => {
    if (selectedVehicleId != null) {
      if (type == 1) {
        router.navigate(
          "/declarations/twoPersonnes/InfoPersons/myInfo/personalInfo",
        );
      } else if (type == 2) {
        router.navigate(
          "/declarations/twoPersonnes/InfoPersons/myInfo/vehicleInfo",
        );
      } else if (type == 3) {
        router.navigate(
          "/declarations/twoPersonnes/InfoPersons/myInfo/vehicleInfo",
        );
      }
    } else {
      Alert.alert("Erreur", "Veuillez choisir une voiture avant de continuer", [
        {
          text: "Ok",
          // onPress: () => console.log('Cancel Pressed'),
          style: "cancel",
        },
      ]);
    }
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
            Fournir mes informations
          </Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.selectContainer}>
          <Text style={styles.titleSelect}>
            Veuillez sélectionner le véhicule impliqué dans l'accident:
          </Text>
          <SelectDropdown
            data={allVehicles}
            defaultButtonText="Choisir une voiture"
            onSelect={(selectedItem) => handleVehicleSelect(selectedItem.car)} // Pass the full selected item
            buttonTextAfterSelection={(selectedItem) => selectedItem.car.model}
            rowTextForSelection={(item) => item.car.model}
            buttonStyle={styles.dropdown1BtnStyle}
            buttonTextStyle={styles.dropdown1BtnTxtStyle}
            dropdownStyle={styles.dropdown1DropdownStyle}
            rowStyle={styles.dropdown1RowStyle}
            rowTextStyle={styles.dropdown1RowTxtStyle}
            renderDropdownIcon={() => (
              <AntDesign name="down" size={14} color="gray" />
            )}
          />
        </View>

        <View style={styles.qrContainer}>
          {qrImageUri ? (
            <Image source={{ uri: qrImageUri }} style={styles.qrImage} />
          ) : (
            <Text style={{ color: "gray", fontSize: 12 }}>
              Chargement du QR Code...
            </Text>
          )}
          <View style={styles.inputContainer}>
            <View style={styles.rowContainer}>
              <TouchableOpacity
                onPress={() => console.log("clicked")}
                style={styles.iconButton}
              >
                <Icon name="content-copy" size={36} color="#FFF" />
                <Text style={styles.textStyle}>
                  {textData.toUpperCase() || "Some Text"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Consulter mes informations</Text>

          <TouchableOpacity
            style={styles.infoBox}
            onPress={() => consultInformation(1)}
          >
            <View style={{ flex: 2 }}>
              <Icon name="person" size={30} color="#19363C" />
            </View>

            <View style={{ flex: 9 }}>
              <Text style={styles.infoTextPerso}>
                Informations personnelles
              </Text>
              <Text style={styles.subInfoText}>Nom,âge,adresse...</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Icon name="chevron-right" size={30} color="#000" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBox}
            onPress={() => consultInformation(2)}
          >
            <View style={{ flex: 2 }}>
              <FontAwesome5 name="car" size={25} color="#19363C" />
            </View>

            <View style={{ flex: 9 }}>
              <Text style={styles.infoTextCar}>Informations du véhicule</Text>
              <Text style={styles.subInfoText}>Modèle,numéro de plaque...</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Icon name="chevron-right" size={30} color="#000" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBox}
            onPress={() => consultInformation(3)}
          >
            <View style={{ flex: 2 }}>
              <Octicons name="checklist" size={28} color="#000" />
            </View>

            <View style={{ flex: 9 }}>
              <Text style={styles.infoText}>Informations d'assurance</Text>
              <Text style={styles.subInfoText}>
                Numéro d'assurance, nom de société...
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Icon name="chevron-right" size={30} color="#000" />
            </View>
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

  contentContainer: {
    flexGrow: 1,
  },

  qrImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },

  qrContainer: {
    height: 450,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 3,
    marginBottom: 40,
    marginVertical: 40,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#FFF",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },

  infoSection: {
    backgroundColor: "#19363C",
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 40,
    textAlign: "center",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#FFF",
  },

  infoText: {
    fontSize: 14,
    fontWeight: "600",
  },

  infoTextCar: {
    fontSize: 14,
    fontWeight: "600",
  },

  infoTextPerso: {
    fontSize: 14,
    fontWeight: "600",
  },

  subInfoText: {
    fontSize: 12,
    color: "#666",
  },

  subInfoTextPerso: {
    fontSize: 12,
    color: "#666",
  },

  subInfoTextCar: {
    fontSize: 12,
    color: "#666",
  },

  iconBackground: {
    backgroundColor: "#19363C",

    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  rowContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CF8C58",
    padding: 10,
    borderRadius: 5,
    width: 180,
    height: 55,
  },

  textStyle: {
    marginLeft: 10,
    color: "white",
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

  selectContainer: {
    marginTop: 30,
  },

  dropdown1BtnStyle: {
    width: "100%",
    height: 49,
    backgroundColor: "#FFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 4,
  },

  dropdown1BtnTxtStyle: {
    color: "#444",
    textAlign: "left",
  },

  dropdown1DropdownStyle: {
    backgroundColor: "#EFEFEF",
  },

  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },

  dropdown1RowTxtStyle: {
    color: "#444",
    textAlign: "left",
  },

  titleSelect: {
    fontSize: 19,
    marginVertical: 10,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#19363C",
  },

  infoTextContainer: {},
});

export default MyInfo;
