import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { DatePickerInput } from "react-native-paper-dates";
import { SelectedVehicleState } from "../../GlobalState/SelectedVehiclesState";
import { addNewInsurances } from "../api/users/userApi";
import SingleBottomButton from "../../components/SignUp/SingleBottomButton";
import Icon from "react-native-vector-icons/MaterialIcons";

const AddInsurance = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const selectedVehicleId = useRecoilValue(SelectedVehicleState);
  const [insuranceData, setInsuranceData] = useState({
    insuranceCompany: "",
    policyNumber: "",
    expirationDate: null,
  });

  const handleInputChange = (field, value) => {
    setInsuranceData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  console.log(selectedVehicleId);
  const handleSubmit = async () => {
    console.log("Submit button pressed"); // Debugging log
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert(t("common.error"), t("common.noToken"));
      return;
    }

    if (!selectedVehicleId) {
      Alert.alert(t("common.error"), t("common.noVehicleId"));
      return;
    }

    console.log("Selected Vehicle ID:", selectedVehicleId); // Debugging log
    console.log("Insurance Data:", insuranceData); // Debugging log

    const result = await addNewInsurances(
      insuranceData,
      selectedVehicleId,
      "insurances/add/",
      token,
    );
    console.log("API Call Result:", result); // Debugging log
    if (result.error) {
      Alert.alert(t("common.error"), t("common.networkError"));
    } else if (result.status === 201) {
      Alert.alert(t("common.success"), t("addInsurance.successMessage"));
      router.push("/vehicleOptions/VehicleList");
    } else {
      Alert.alert(
        t("common.error"),
        result.message || t("common.unknownError"),
      );
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 20,
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
            name="arrow-left"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>
            {"   "}
            {t("common.back")}
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            {t("addInsurance.title")}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t("addInsurance.title")}</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addInsurance.companyName")}</Text>
          <TextInput
            style={styles.input}
            value={insuranceData.insuranceCompany}
            onChangeText={(value) =>
              handleInputChange("insuranceCompany", value)
            }
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addInsurance.policyNumber")}</Text>
          <TextInput
            style={styles.input}
            value={insuranceData.policyNumber}
            onChangeText={(value) => handleInputChange("policyNumber", value)}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addInsurance.expirationDate")}</Text>
          <DatePickerInput
            locale="en"
            mode="outlined"
            label={t("addInsurance.expirationDate")}
            value={insuranceData.expirationDate}
            onChange={(date) => handleInputChange("expirationDate", date)}
            inputMode="start"
            style={styles.datePicker}
          />
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <SingleBottomButton onPress={handleSubmit}>
          {t("addInsurance.submit")}
        </SingleBottomButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 35,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  datePicker: {
    width: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default AddInsurance;
