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
import { AntDesign } from "@expo/vector-icons";
import { useRecoilState } from "recoil";
import { VehicleChoiceState } from "../../../GlobalState/AccidentVehiculeState";
import { getMyVehicles } from "../../api/users/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';


const VehicleSelectionPage = () => {
  const [allVehicles, setAllVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleState, setVehiculeState] = useRecoilState(VehicleChoiceState);
  const router = useRouter();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    const vehiclesResponse = await getMyVehicles(userToken, "vehicles/");
    if (vehiclesResponse.status === 200) {
        //console.log(vehiclesResponse.data.carsWithInsurances)
      setAllVehicles(vehiclesResponse.data.carsWithInsurances);
    } else {
      Alert.alert("Erreur", "Échec du chargement des véhicules.");
    }
  };

  

  const handleVehicleSelect = (selectedItem) => {
    const vehicleId = selectedItem?.car?._id;
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
      setVehiculeState(vehicleId);
      //Alert.alert("Succès", `Véhicule ${selectedItem?.car?.model} sélectionné.`);
      router.push("./typeOfAccident")
    } else {
      //Alert.alert("Erreur", "Sélection de véhicule invalide. Veuillez réessayer.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name='arrowleft' size={20} color="#19363C" />
          <Text style={styles.backText}>{"   "}Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sélectionner un véhicule</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.selectContainer}>
          <Text style={styles.titleSelect}>Veuillez sélectionner un véhicule:</Text>
          <SelectDropdown
            data={allVehicles}
            defaultButtonText="Choisir une voiture"
            onSelect={handleVehicleSelect}
            buttonTextAfterSelection={(selectedItem) => selectedItem?.car?.model}
            rowTextForSelection={(item) => item.car.model}
            buttonStyle={styles.dropdownBtnStyle}
            buttonTextStyle={styles.dropdownBtnTxtStyle}
            dropdownStyle={styles.dropdownDropdownStyle}
            rowStyle={styles.dropdownRowStyle}
            rowTextStyle={styles.dropdownRowTxtStyle}
            renderDropdownIcon={() => <AntDesign name="down" size={14} color="gray" />}
          />
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
});

export default VehicleSelectionPage;
