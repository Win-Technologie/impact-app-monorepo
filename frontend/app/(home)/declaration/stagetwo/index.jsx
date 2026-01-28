import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  SafeAreaView,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Icon from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import { AntDesign } from "@expo/vector-icons";
import { getMyVehicles } from "../../../api/users/userApi";

const QRCodePage = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [qrValue, setQrValue] = useState(""); // Initial QR code value
  const [qrImageUri, setQrImageUri] = useState(null); // URI of the QR code image
  const [allVehicles, setAllVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [errorVehicleState, setErrorVehicleState] = useState("");
  const [textData, setTextData] = useState(""); // State to hold the text data
  const ENDPOINT = "vehicles/";

  useEffect(() => {
    loadVehicles();
  }, []);

  const fetchTokenAndQR = async (vehicleId) => {
    const token = await AsyncStorage.getItem("userToken");
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    if (!API_URL) {
      console.error("API URL is not defined");
      return;
    }
    if (!vehicleId) {
      console.error("No vehicle ID provided for QR code generation");
      return;
    }

    try {
      const response = await fetch(`${API_URL}users/code/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vehicleId }), // Make sure this matches server expectations
      });

      const data = await response.json(); // Adjust according to the server response
      if (response.ok) {
        setQrImageUri(data.qrImage);
        setTextData(data.AlphNumCode);
      } else {
        throw new Error(data.msg || "Failed to fetch QR code");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error.message);
    }
  };

  const loadVehicles = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    const vehiclesResponse = await getMyVehicles(userToken, "vehicles/");
    if (vehiclesResponse.status === 200) {
      setAllVehicles(vehiclesResponse.data.cars);
    } else {
      console.error("Failed to fetch vehicles:", vehiclesResponse.message);
    }
  };

  const handleVehicleSelect = (selectedItem) => {
    // Using selectedItem._id since the object uses _id as shown in your error log
    const vehicleId = selectedItem._id;
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
      fetchTokenAndQR(vehicleId); // Fetch QR Code using the correct vehicle ID
      setErrorVehicleState(""); // Clear any previous errors
    } else {
      console.error("Selected item is invalid:", selectedItem);
      setErrorVehicleState("Invalid vehicle selection. Please try again.");
    }
  };

  const handleButton = () => {
    if (selectedVehicleId === "") {
      setErrorVehicleState("Ce champ est obligatoire");
    } else if (!qrImageUri) {
      setErrorVehicleState(
        "QR code not available. Please select a vehicle again.",
      );
    } else {
      setErrorVehicleState("");
      setVehiculeState(selectedVehicleId); // Assuming this sets some global state or performs further actions
      router.push("/getinformation");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headersContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.headerIcon}>
            <AntDesign name="arrowleft" size={24} color="black" />
            <Text>Retour</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fournir mes informations</Text>
      </View>
      <View style={styles.selectContainer}>
        <Text style={styles.titleSelect}>
          Veuillez sélectionner le véhicule impliqué dans l'accident:
        </Text>
        <SelectDropdown
          data={allVehicles}
          onSelect={(selectedItem) => handleVehicleSelect(selectedItem)} // Pass the full selected item
          buttonTextAfterSelection={(selectedItem) => selectedItem.model}
          rowTextForSelection={(item) => item.model}
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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.qrContainer}>
          {qrImageUri ? (
            <Image source={{ uri: qrImageUri }} style={styles.qrImage} />
          ) : (
            <Text>Chargement du QR Code...</Text>
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
            onPress={() => router.push("/personalInfo")}
          >
            <Icon name="person" size={34} color="#19363C" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTextPerso}>
                Informations personnelles
              </Text>
              <Text style={styles.subInfoTextPerso}>Nom,âge,adresse...</Text>
            </View>
            <Icon name="chevron-right" size={30} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBox}
            onPress={() => router.push("/vehicleInfo")}
          >
            <FontAwesome5 name="car" size={30} color="#19363C" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTextCar}>Informations du véhicule</Text>
              <Text style={styles.subInfoTextCar}>
                Modèle,numéro de plaque...
              </Text>
            </View>
            <Icon name="chevron-right" size={30} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBox}
            onPress={() => router.push("/insuranceInfo")}
          >
            <View style={styles.iconBackground}>
              <MaterialIcons name="checklist" size={30} color="white" />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>Informations d'assurance</Text>
              <Text style={styles.subInfoText}>
                Numéro d'assurance, nom de société...
              </Text>
            </View>
            <Icon name="chevron-right" size={30} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    //width: 350,
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
    marginHorizontal: 30,
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
    flexGrow: 1,
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
    marginHorizontal: 55,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Assure l'espacement entre les éléments
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#FFF",
  },

  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  infoTextCar: {
    marginLeft: -57,
    fontSize: 16,
  },
  infoTextPerso: {
    marginLeft: -48,
    fontSize: 16,
  },
  subInfoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  subInfoTextPerso: {
    marginLeft: -48,
    fontSize: 14,
    color: "#666",
  },
  subInfoTextCar: {
    marginLeft: -57,
    fontSize: 14,
    color: "#666",
  },
  iconBackground: {
    backgroundColor: "#19363C",
    padding: 1,
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
    width: 180, // Largeur fixe du bouton
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
    // marginBottom: 30,
    fontWeight: "bold",
    color: "#19363C",
    // marginHorizontal: 20
  },
  headerIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectContainer: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  dropdown1BtnStyle: {
    width: "100%",
    height: 40,
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
});

export default QRCodePage;
