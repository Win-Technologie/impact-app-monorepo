import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

const AddVehicle = () => {
  const [isOwner, setIsOwner] = useState(true);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Vehicle fields
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  // Owner fields
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerCity, setOwnerCity] = useState("");
  const [ownerPostalCode, setOwnerPostalCode] = useState("");

  // Dropdowns
  const [countryOpen, setCountryOpen] = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [country, setCountry] = useState("Canada");
  const [province, setProvince] = useState("Québec");
  const [countries] = useState([
    { label: "Canada", value: "Canada", icon: () => <Text>🇨🇦</Text> },
  ]);
  const [provinces, setProvinces] = useState([
    { label: "Québec", value: "Québec" },
    { label: "Ontario", value: "Ontario" },
    { label: "Colombie-Britannique", value: "Colombie-Britannique" },
  ]);

  const handleSave = async () => {
    // Validate required fields
    if (!vehicleBrand || !vehicleModel || !vehicleYear || !vehicleColor || !plateNumber || !registrationNumber) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs du véhicule");
      return;
    }

    // Validate year is a number
    const yearNum = parseInt(vehicleYear);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert("Erreur", "L'année doit être valide");
      return;
    }

    // Validate plate number length (must be 7 with space at position 4)
    if (plateNumber.length !== 7) {
      Alert.alert("Erreur", "Le numéro de plaque doit contenir 7 caractères (XXX XXX)");
      return;
    }

    // Validate registration number length
    if (registrationNumber.length !== 13) {
      Alert.alert("Erreur", "Le numéro de certificat doit contenir 13 caractères");
      return;
    }

    // If not owner, validate owner fields
    if (!isOwner) {
      if (!ownerFirstName || !ownerLastName || !ownerPhone || !ownerAddress || !ownerCity || !ownerPostalCode) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs du propriétaire");
        return;
      }
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Erreur", "Session expirée");
        return;
      }

      const vehicleData = {
        brand: vehicleBrand,
        model: vehicleModel,
        year: parseInt(vehicleYear),
        color: vehicleColor,
        plate: plateNumber,
        serialNumber: registrationNumber,
        isOwner: isOwner,
        ...((!isOwner) && {
          ownerInfo: {
            firstName: ownerFirstName,
            lastName: ownerLastName,
            phone: ownerPhone,
            address: ownerAddress,
            city: ownerCity,
            postalCode: ownerPostalCode,
            country: country,
            province: province,
          }
        })
      };

      const response = await fetch(`${API_URL}vehicles/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleData),
      });

      const data = await response.json();
      console.log("Add vehicle response:", data);

      if (response.ok) {
        Alert.alert("Succès", "Véhicule ajouté avec succès", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        console.error("Failed to add vehicle:", data);
        Alert.alert("Erreur", data.error || data.message || "Impossible d'ajouter le véhicule");
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
      Alert.alert("Erreur", "Une erreur est survenue");
    }
  };

  // (Removed test autofill helper for production)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={{ flexDirection: "row", alignItems: "center" }} 
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={20} color="#19363C" />
              <Text style={{ color: "#19363C", marginLeft: 8 }}>Retour</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Ajout d'un véhicule</Text>
            </View>
          </View>

          {/* Test autofill removed for production */}

          {/* Vehicle Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations sur le véhicule</Text>

            {/* Brand and Model Row */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Marque</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleBrand}
                  onChangeText={setVehicleBrand}
                  placeholder="Honda"
                  placeholderTextColor="#B0B0B0"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Modèle</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleModel}
                  onChangeText={setVehicleModel}
                  placeholder="Civic"
                  placeholderTextColor="#B0B0B0"
                />
              </View>
            </View>

            {/* Year and Color Row */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Année</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleYear}
                  onChangeText={setVehicleYear}
                  placeholder="2017"
                  placeholderTextColor="#B0B0B0"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Couleur</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleColor}
                  onChangeText={setVehicleColor}
                  placeholder="Vert forêt"
                  placeholderTextColor="#B0B0B0"
                />
              </View>
            </View>

            {/* Plate Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Numéro de plaque</Text>
              <View style={styles.inputWithCounter}>
                <TextInput
                  style={styles.inputFlex}
                  value={plateNumber}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/[^A-Z0-9]/gi, "").toUpperCase();
                    if (cleaned.length <= 6) {
                      if (cleaned.length > 3) {
                        cleaned = cleaned.slice(0, 3) + " " + cleaned.slice(3);
                      }
                      setPlateNumber(cleaned);
                    }
                  }}
                  placeholder="J7Y 8T8"
                  placeholderTextColor="#B0B0B0"
                  maxLength={7}
                  autoCapitalize="characters"
                />
                <Text style={styles.counter}>{plateNumber.length}/7</Text>
              </View>
            </View>

            {/* Registration Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Numéro ou certificat d'immatriculation</Text>
              <View style={styles.inputWithCounter}>
                <TextInput
                  style={styles.inputFlex}
                  value={registrationNumber}
                  onChangeText={(text) => {
                    if (text.length <= 13) setRegistrationNumber(text);
                  }}
                  placeholder="123123123123"
                  placeholderTextColor="#B0B0B0"
                  keyboardType="numeric"
                  maxLength={13}
                />
                <Text style={styles.counter}>{registrationNumber.length}/13</Text>
              </View>
            </View>
          </View>

          {/* Owner Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propriétaire du véhicule</Text>

            <TouchableOpacity
              style={isOwner ? styles.ownerButtonSelected : styles.ownerButton}
              onPress={() => setIsOwner(true)}
            >
              <Text style={isOwner ? styles.ownerButtonTextSelected : styles.ownerButtonText}>
                Je suis le propriétaire du véhicule.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={!isOwner ? styles.ownerButtonSelected : styles.ownerButton}
              onPress={() => setIsOwner(false)}
            >
              <Text style={!isOwner ? styles.ownerButtonTextSelected : styles.ownerButtonText}>
                Je ne suis pas le propriétaire du véhicule.
              </Text>
            </TouchableOpacity>

            {/* Owner Information Fields */}
            {!isOwner && (
              <View style={styles.ownerFields}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Prénom</Text>
                  <TextInput
                    style={styles.input}
                    value={ownerFirstName}
                    onChangeText={setOwnerFirstName}
                    placeholder="Steve"
                    placeholderTextColor="#B0B0B0"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    value={ownerLastName}
                    onChangeText={setOwnerLastName}
                    placeholder="Blanchard"
                    placeholderTextColor="#B0B0B0"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Numéro de téléphone</Text>
                  <TextInput
                    style={styles.input}
                    value={ownerPhone}
                    onChangeText={setOwnerPhone}
                    placeholder="(514) 388 3900"
                    placeholderTextColor="#B0B0B0"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Numéro et rue de l'adresse</Text>
                  <TextInput
                    style={styles.input}
                    value={ownerAddress}
                    onChangeText={setOwnerAddress}
                    placeholder="1280 Sainte-Marie"
                    placeholderTextColor="#B0B0B0"
                  />
                </View>

                <View style={styles.rowFields}>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>Ville</Text>
                    <TextInput
                      style={styles.input}
                      value={ownerCity}
                      onChangeText={setOwnerCity}
                      placeholder="Montréal"
                      placeholderTextColor="#B0B0B0"
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>Code postale</Text>
                    <TextInput
                      style={styles.input}
                      value={ownerPostalCode}
                      onChangeText={setOwnerPostalCode}
                      placeholder="J4K 1H8"
                      placeholderTextColor="#B0B0B0"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <View style={styles.rowFields}>
                  <View style={[styles.halfField, { zIndex: countryOpen ? 3000 : 1000 }]}>
                    <DropDownPicker
                      open={countryOpen}
                      value={country}
                      items={countries}
                      setOpen={setCountryOpen}
                      setValue={setCountry}
                      listMode="SCROLLVIEW"
                      placeholder="Pays"
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                    />
                  </View>
                  <View style={[styles.halfField, { zIndex: provinceOpen ? 3000 : 1000 }]}>
                    <DropDownPicker
                      open={provinceOpen}
                      value={province}
                      items={provinces}
                      setOpen={setProvinceOpen}
                      setValue={setProvince}
                      setItems={setProvinces}
                      listMode="SCROLLVIEW"
                      placeholder="Province"
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.cameraButton}>
                  <MaterialIcons name="camera-alt" size={28} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#19363C",
  },
  section: {
    backgroundColor: "white",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#19363C",
    marginBottom: 15,
  },
  rowFields: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 15,
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: "#19363C",
    backgroundColor: "#FFFFFF",
  },
  inputWithCounter: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    paddingRight: 12,
  },
  inputFlex: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#19363C",
  },
  counter: {
    fontSize: 14,
    color: "#999",
  },
  ownerButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0B8BA8",
    backgroundColor: "white",
    marginBottom: 10,
    alignItems: "center",
  },
  ownerButtonSelected: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#0B8BA8",
    marginBottom: 10,
    alignItems: "center",
  },
  ownerButtonText: {
    color: "#0B8BA8",
    fontSize: 14,
    fontWeight: "500",
  },
  ownerButtonTextSelected: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  ownerFields: {
    marginTop: 20,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  cameraButton: {
    marginTop: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#CF8C58",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignSelf: "flex-end",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  saveButton: {
    backgroundColor: "#0B8BA8",
    padding: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Test styles removed
});

export default AddVehicle;
