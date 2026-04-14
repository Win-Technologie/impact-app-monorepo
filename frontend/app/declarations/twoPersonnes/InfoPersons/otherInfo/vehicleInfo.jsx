import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserInfoAndVehicle, getMyVehicles } from "../../../../api/users/userApi";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";
import { useRecoilState } from "recoil";
import { DeclarationState } from "../../../../../GlobalState/DeclarationState";
import SingleBottomButton from "../../../../../components/SignUp/SingleBottomButton";

export default function VehicleInfo() {
  const ENDPOINT = "users/user/vehicle/info/";
  const [allVehicles, setAllVehicles] = useState([]);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);

  // Vehicle fields - blank by default
  const [serialNumber, setSerialNumber] = useState("");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");

  // Owner fields - blank by default
  const [ownerName, setOwnerName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerCity, setOwnerCity] = useState("");
  const [ownerPostalCode, setOwnerPostalCode] = useState("");
  const [ownerCountry, setOwnerCountry] = useState("");
  const [ownerProvince, setOwnerProvince] = useState("");

  const [declaration, setDeclaration] = useRecoilState(DeclarationState);
  const params = useLocalSearchParams();
  const personIndex = Number(params.person ?? 1);

  useEffect(() => {
    const saved = declaration?.people?.[personIndex];
    if (!saved) return;
    if (saved.vehicle) {
      setSerialNumber(saved.vehicle.serialNumber || "");
      setPlate(saved.vehicle.plate || "");
      setModel(saved.vehicle.model || "");
      setYear(saved.vehicle.year ? String(saved.vehicle.year) : "");
      setColor(saved.vehicle.color || "");
    }
    if (saved.owner) {
      setOwnerName(saved.owner.name || "");
      setOwnerLastName(saved.owner.lastName || "");
      setOwnerEmail(saved.owner.email || "");
      setOwnerPhone(saved.owner.phone || "");
      setOwnerAddress(saved.owner.address || "");
      setOwnerCity(saved.owner.city || "");
      setOwnerPostalCode(saved.owner.postalCode || "");
      setOwnerCountry(saved.owner.country || "");
      setOwnerProvince(saved.owner.province || "");
    }
  }, [declaration, personIndex]);

  useEffect(() => {
    loadMyVehicles();
  }, []);

  const loadMyVehicles = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    const vehiclesResponse = await getMyVehicles(userToken, "vehicles/");
    if (vehiclesResponse && vehiclesResponse.status === 200) {
      setAllVehicles(vehiclesResponse.data.carsWithInsurances || []);
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
    const vehicleId = selectedItem?.car?._id || selectedItem?._id;
    if (!vehicleId) {
      Alert.alert("Erreur", "Véhicule invalide");
      return;
    }

    const userToken = await AsyncStorage.getItem("userToken");
    try {
      const result = await fetchUserInfoAndVehicle(vehicleId, userToken, ENDPOINT);
      if (result.error) throw new Error(`Failed to fetch data: ${result.status}`);
      const data = result.data;
      setSerialNumber(data.vehicle?.serialNumber || "");
      setPlate(data.vehicle?.plate || "");
      setModel(data.vehicle?.model || "");
      setYear(data.vehicle?.year?.toString() || "");
      setColor(data.vehicle?.color || "");
      setOwnerName(data.owner?.name || "");
      setOwnerLastName(data.owner?.lastName || "");
      setOwnerEmail(data.owner?.email || "");
      setOwnerPhone(data.owner?.phone || "");
      setOwnerAddress(data.owner?.address || "");
      setOwnerCity(data.owner?.city || "");
      setOwnerPostalCode(data.owner?.postalCode || "");
      setOwnerCountry(data.owner?.country || "");
      setOwnerProvince(data.owner?.province || "");
      setShowVehicleSelector(false);
      Alert.alert("Succès", "Informations remplies depuis votre compte");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les informations");
    }
  };

  const handleSave = () => {
    const people = declaration?.people ? [...declaration.people] : [];
    const idx = personIndex;
    while (people.length <= idx) people.push({});
    people[idx] = {
      ...(people[idx] || {}),
      vehicle: {
        serialNumber,
        plate,
        model,
        year,
        color,
      },
      owner: {
        name: ownerName,
        lastName: ownerLastName,
        email: ownerEmail,
        phone: ownerPhone,
        address: ownerAddress,
        city: ownerCity,
        postalCode: ownerPostalCode,
        country: ownerCountry,
        province: ownerProvince,
      },
    };
    people[idx].name = `${ownerName || ""} ${ownerLastName || ""}`.trim() || (model ? model : `Personne ${idx + 1}`);
    setDeclaration((prev) => ({ ...prev, people }));
    Alert.alert("Succès", "Informations enregistrées");
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
            name="arrow-left"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            Informations du véhicule
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
              selectedItem?.car?.model || selectedItem?.model
            }
            rowTextForSelection={(item) => item.car?.model || item.model}
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
        <View style={styles.contentContainer}>
          <Text style={styles.fieldLabel}>Numéro du certificat d'immatriculation</Text>
          <TextInput style={styles.input} value={serialNumber} onChangeText={setSerialNumber} />
          <Text style={styles.fieldLabel}>Numéro de plaque</Text>
          <TextInput style={styles.input} value={plate} onChangeText={setPlate} />
          <Text style={styles.fieldLabel}>Modèle du véhicule</Text>
          <TextInput style={styles.input} value={model} onChangeText={setModel} />
          <Text style={styles.fieldLabel}>Année</Text>
          <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" />
          <Text style={styles.fieldLabel}>Couleur du véhicule</Text>
          <TextInput style={styles.input} value={color} onChangeText={setColor} />

          <Text style={[styles.headerTitle, styles.marginSpace, styles.centerText]}>
            Informations du propriétaire
          </Text>

          <Text style={styles.fieldLabel}>Prénom</Text>
          <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} />
          <Text style={styles.fieldLabel}>Nom</Text>
          <TextInput style={styles.input} value={ownerLastName} onChangeText={setOwnerLastName} />
          <Text style={styles.fieldLabel}>Adresse courriel</Text>
          <TextInput style={styles.input} value={ownerEmail} onChangeText={setOwnerEmail} keyboardType="email-address" />
          <Text style={styles.fieldLabel}>Numéro de téléphone</Text>
          <TextInput style={styles.input} value={ownerPhone} onChangeText={setOwnerPhone} keyboardType="phone-pad" />
          <Text style={styles.fieldLabel}>Numéro et rue de l'adresse</Text>
          <TextInput style={styles.input} value={ownerAddress} onChangeText={setOwnerAddress} />
          <Text style={styles.fieldLabel}>Ville</Text>
          <TextInput style={styles.input} value={ownerCity} onChangeText={setOwnerCity} />
          <Text style={styles.fieldLabel}>Code postal</Text>
          <TextInput style={styles.input} value={ownerPostalCode} onChangeText={setOwnerPostalCode} />
          <Text style={styles.fieldLabel}>Pays</Text>
          <TextInput style={styles.input} value={ownerCountry} onChangeText={setOwnerCountry} />
          <Text style={styles.fieldLabel}>Province</Text>
          <TextInput style={styles.input} value={ownerProvince} onChangeText={setOwnerProvince} />
        </View>
      </ScrollView>

      <View style={styles.footContainer}>
        <SingleBottomButton onPress={handleSave}>Enregistrer</SingleBottomButton>
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

  fieldLabel: {
    color: "#b4b4b5",
    marginBottom: 5,
    fontSize: 12,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 7,
    backgroundColor: "#fafafa",
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
