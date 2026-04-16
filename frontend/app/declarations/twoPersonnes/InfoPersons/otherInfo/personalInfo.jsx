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
import { useRecoilState } from "recoil";
import { DeclarationState } from "../../../../../GlobalState/DeclarationState";
import SingleBottomButton from "../../../../../components/SignUp/SingleBottomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { fetchUserInfoAndVehicle, getMyVehicles } from "../../../../api/users/userApi";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import SelectDropdown from "react-native-select-dropdown";

export default function PersonanalInformation() {
  const ENDPOINT = "users/user/vehicle/info/";
  const [allVehicles, setAllVehicles] = useState([]);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);

  // Form fields - blank by default
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [dlExpires, setDlExpires] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    loadMyVehicles();
  }, []);

  const { t } = useTranslation();

  const loadMyVehicles = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    const vehiclesResponse = await getMyVehicles(userToken, "vehicles/");
    if (vehiclesResponse.status === 200) {
      setAllVehicles(vehiclesResponse.data.carsWithInsurances);
    }
  };

  const handleFillFromAccount = () => {
    if (allVehicles.length === 0) {
      Alert.alert(t("common.error"), t("declaration.noInformationAvailable"));
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
      const result = await fetchUserInfoAndVehicle(vehicleId, userToken, ENDPOINT);
      if (result.error) throw new Error(`Failed to fetch data: ${result.status}`);
      const data = result.data;
      setName(data.owner?.name || "");
      setLastName(data.owner?.lastName || "");
      setDlNumber(data.driverLicense?.number || "");
      setDlExpires(data.driverLicense?.expires || "");
      setEmail(data.owner?.email || "");
      setPhone(data.owner?.phone || "");
      setAddress(data.owner?.address || "");
      setCity(data.owner?.city || "");
      setPostalCode(data.owner?.postalCode || "");
      setCountry(data.owner?.country || "");
      setProvince(data.owner?.province || "");
      setShowVehicleSelector(false);
      Alert.alert(t("common.success"), t("declaration.fillFromAccountSuccess"));
    } catch (error) {
      Alert.alert(t("common.error"), t("declaration.fillFromAccountError"));
    }
  };

  const [declaration, setDeclaration] = useRecoilState(DeclarationState);
  const params = useLocalSearchParams();
  const personIndex = Number(params.person ?? 1);

  useEffect(() => {
    const saved = declaration?.people?.[personIndex];
    if (saved?.owner) {
      setName(saved.owner.name || "");
      setLastName(saved.owner.lastName || "");
      setEmail(saved.owner.email || "");
      setPhone(saved.owner.phone || "");
      setAddress(saved.owner.address || "");
      setCity(saved.owner.city || "");
      setPostalCode(saved.owner.postalCode || "");
      setCountry(saved.owner.country || "");
      setProvince(saved.owner.province || "");
    }
    if (saved?.driverLicense) {
      setDlNumber(saved.driverLicense.number || "");
      setDlExpires(saved.driverLicense.expires || "");
    }
  }, [declaration, personIndex]);

  const handleSave = () => {
    const people = declaration?.people ? [...declaration.people] : [];
    const idx = personIndex;
    while (people.length <= idx) people.push({});
    people[idx] = {
      ...(people[idx] || {}),
      owner: {
        name,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        country,
        province,
      },
      driverLicense: {
        number: dlNumber,
        expires: dlExpires,
      },
    };
    // set a display name for the person
    people[idx].name = `${name || ""} ${lastName || ""}`.trim() || `Personne ${idx + 1}`;
    setDeclaration((prev) => ({ ...prev, people }));
    Alert.alert(t("common.success", { defaultValue: "Succès" }), t("common.informationSaved", { defaultValue: "Information saved" }));
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
        <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => router.back()}>
          <AntDesign name="arrow-left" size={20} color="#19363C" style={{ fontWeight: "200" }} />
          <Text style={{ color: "#19363C" }}>{"   "}{t("common.back")}</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>{t("declaration.personalInformation")}</Text>
        </View>
      </View>

      {showVehicleSelector && (
        <View style={styles.fillFromAccountContainer}>
          <Text style={styles.fillFromAccountTitle}>{t("declaration.selectVehiclePrompt")}</Text>
          <SelectDropdown
            data={allVehicles}
            defaultButtonText={t("declaration.selectVehiclePrompt")}
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
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowVehicleSelector(false)}>
            <Text style={styles.cancelButtonText}>{t("buttons.cancel")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.contentContainer}>
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerFirstName")}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerLastName")}</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
          <Text style={styles.fieldLabel}>{t("insuranceScreen.licenseNumberPlaceholder")}</Text>
          <TextInput style={styles.input} value={dlNumber} onChangeText={setDlNumber} />
          <Text style={styles.fieldLabel}>{t("licenseDetails.licenseCategoryPlaceholder") || t("driverLicense")}</Text>
          <TextInput style={styles.input} value={dlExpires} onChangeText={setDlExpires} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerEmail")}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerPhone")}</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerAddress")}</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerCity")}</Text>
          <Text style={styles.input} value={city} onChangeText={setCity} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerPostalCode")}</Text>
          <Text style={styles.input} value={postalCode} onChangeText={setPostalCode} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerCountry")}</Text>
          <Text style={styles.input} value={country} onChangeText={setCountry} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerProvince")}</Text>
          <Text style={styles.input} value={province} onChangeText={setProvince} />
        </View>
      </ScrollView>

      <View style={styles.footContainer}>
        <SingleBottomButton onPress={handleSave}>{t("common.save")}</SingleBottomButton>
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
