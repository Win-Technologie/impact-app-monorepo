import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { useTranslation } from "react-i18next";
import { AntDesign } from "@expo/vector-icons";
import { useRecoilState } from "recoil";
import { VehicleChoiceState } from "../../../GlobalState/AccidentVehiculeState";
import { DeclarationState } from "../../../GlobalState/DeclarationState";
import { getMyVehicles } from "../../api/users/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const VehicleSelectionPage = () => {
  const { t } = useTranslation();
  const [allVehicles, setAllVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleState, setVehiculeState] = useRecoilState(VehicleChoiceState);
  const [declaration, setDeclaration] = useRecoilState(DeclarationState);
  const router = useRouter();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert(t("common.error"), t("declaration.sessionExpired"));
        return;
      }
      
      const vehiclesResponse = await getMyVehicles(userToken, "vehicles/");
      if (vehiclesResponse && vehiclesResponse.status === 200) {
        const vehicles = vehiclesResponse.data?.carsWithInsurances;
        if (vehicles && Array.isArray(vehicles)) {
          setAllVehicles(vehicles);
        } else {
          console.warn("No vehicles data received");
          setAllVehicles([]);
        }
      } else {
        Alert.alert(t("common.error"), t("declaration.loadVehiclesFailed"));
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
      Alert.alert("Erreur", "Impossible de charger vos véhicules. Veuillez réessayer.");
    }
  };

  const handleVehicleSelect = (selectedItem) => {
    try {
      const vehicleId = selectedItem?.car?._id;
      if (vehicleId) {
        setSelectedVehicleId(vehicleId);
        setVehiculeState(vehicleId);
        // also persist the selected vehicle object into the declaration so it appears in history details
        try {
          setDeclaration({ ...declaration, vehicle: selectedItem.car });
        } catch (err) {
          console.warn("Could not set declaration vehicle", err);
        }
        router.push("./typeOfAccident");
      } else {
        Alert.alert(t("common.error"), t("declaration.selectVehicleInvalid"));
      }
    } catch (error) {
      console.error("Error selecting vehicle:", error);
      Alert.alert(t("common.error"), t("declaration.selectVehicleInvalid"));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AntDesign name="arrow-left" size={20} color="#19363C" />
          <Text style={styles.backText}>{"   "}{t("common.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("declaration.selectVehicleTitle")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.selectContainer}>
          <Text style={styles.titleSelect}>{t("declaration.selectVehiclePrompt")}</Text>
          
          {allVehicles.length <= 8 ? (
            // Show vehicle cards when 8 or fewer vehicles
            <View style={styles.cardsContainer}>
              {allVehicles.map((vehicle, index) => (
                <TouchableOpacity
                  key={vehicle?.car?._id || index}
                  style={[
                    styles.vehicleCard,
                    selectedVehicleId === vehicle?.car?._id && styles.vehicleCardSelected
                  ]}
                  onPress={() => handleVehicleSelect(vehicle)}
                >
                  <View style={styles.vehicleCardContent}>
                    <Text style={styles.vehicleModel}>{vehicle?.car?.model || 'Véhicule'}</Text>
                    <Text style={styles.vehiclePlate}>{vehicle?.car?.license_plate || ''}</Text>
                    {vehicle?.car?.brand && (
                      <Text style={styles.vehicleBrand}>{vehicle.car.brand}</Text>
                    )}
                  </View>
                  {selectedVehicleId === vehicle?.car?._id && (
                    <AntDesign name="checkcircle" size={24} color="#4CAF50" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Show dropdown when more than 6 vehicles
            <SelectDropdown
              data={allVehicles}
              defaultButtonText={t("declaration.chooseCarDefault")}
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
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#19363C",
  },
  headerTitle: {
    fontSize: 18,
    color: "#19363C",
    fontWeight: "bold",
  },
  contentContainer: {
    flexGrow: 1,
  },
  selectContainer: {
    marginTop: 30,
  },
  titleSelect: {
    fontSize: 19,
    marginVertical: 10,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#19363C",
  },
  dropdownBtnStyle: {
    width: "100%",
    height: 49,
    backgroundColor: "#FFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 4,
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
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  vehicleCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    padding: 15,
    marginBottom: 15,
    minHeight: 100,
    justifyContent: "space-between",
  },
  vehicleCardSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8F4",
  },
  vehicleCardContent: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#19363C",
    marginBottom: 5,
  },
  vehiclePlate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  vehicleBrand: {
    fontSize: 12,
    color: "#999",
  },
  checkIcon: {
    alignSelf: "flex-end",
    marginTop: 5,
  },
});

export default VehicleSelectionPage;
