import {
  StyleSheet,
  Text,
  View,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Pressable,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import DualOptionButtonStep from "../../../components/SignUp/dualBottomButtonsSteps";
import { useRecoilState } from "recoil";
import SelectDropdown from "react-native-select-dropdown";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMyVehicles } from "../../api/users/userApi";
import Stepper from "../../../components/SignUp/stepper";
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { insuranceState } from "../../../GlobalState/InsuranceState";
import { useTranslation } from "react-i18next";
import { DatePickerInput } from "react-native-paper-dates";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Insurance() {
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const [insuranceDetails, setInsuranceDetail] = useRecoilState(insuranceState);
  const [submit, setSubmit] = useState(false);
  const [allVehicles, setAllVehicles] = useState([]);
  const [inputDate, setInputDate] = useState(new Date());
  const totalSteps = 3;
  const ENDPOINT = "vehicles/";
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      number: insuranceDetails.insuranceNumber,
      dateExpiration: insuranceDetails.insuranceExpirationDate,
    },
  });

  const handleInputChange = (field, value) => {
    setInsuranceDetail((prev) => ({ ...prev, [field]: value }));
  };

  const handlePressContinue = () => {
    setSubmit(true);

    if (!!insuranceDetails.idCar) {
      validateForm();
    } else {
    }
  };

  const validateForm = handleSubmit((data) => {
    if (progressData[2].actualstep == 0) {
      const array = progressData.map((item) => {
        if (item.id == 2) {
          return {
            id: 2,
            title: "Informations d'assurances",
            subtitle: "8 minutes",
            completion: 0,
            actualstep: 1,
            nbstep: 3,
          };
        } else {
          return item;
        }
      });

      setProgressData(array);
    }

    router.push("/signup/insurance/insuranceFirm");
  });

  async function requestUserVehicles() {
    const userToken = await AsyncStorage.getItem("userToken");
    try {
      const response = await getMyVehicles(userToken, ENDPOINT);

      console.log(response.data.carsWithInsurances[0].car);

      //console.log(response.data);

      if (response.status === 200) {
        const vehicles = response.data.carsWithInsurances.map((asset) => ({
          id: asset.car._id,
          model: asset.car.model,
        }));
        setAllVehicles(vehicles);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    requestUserVehicles();
  }, []);

  //Retour à la page d'accueil.
  const handlePressBack = () => {
    router.back();
  };

  const next = () => {
    router.push("/signup/insurance/insuranceFirm");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stepper
        currentStep={progressData[2].actualstep}
        totalSteps={totalSteps}
      />

      <ScrollView style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.title}>{t("insurance.selectVehicle")}</Text>
          <SelectDropdown
            defaultButtonText={t("insurance.chooseVehicle")}
            data={allVehicles.map((vehicles) => vehicles.model)}
            onSelect={(selectedItem, index) => {
              handleInputChange("idCar", allVehicles[index].id);
              setSubmit(false);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              return item;
            }}
            buttonStyle={[
              styles.dropdown1BtnStyle /*{ borderColor: errorVehicleState ? 'red' : '#ccc' }*/,
            ]}
            buttonTextStyle={styles.dropdown1BtnTxtStyle}
            renderDropdownIcon={() => {
              return <Text>▼</Text>;
            }}
            dropdownIconPosition={"right"}
            dropdownStyle={styles.dropdown1DropdownStyle}
            rowStyle={styles.dropdown1RowStyle}
            rowTextStyle={styles.dropdown1RowTxtStyle}
          />

          {!insuranceDetails.idCar && submit && (
            <Text style={styles.errorText}>
              {t("insurance.vehicleRequired")}
            </Text>
          )}
        </View>

        <Text style={styles.title}>{t("insurance.policyTitle")}</Text>

        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <View style={styles.inputSection}>
              <Controller
                control={control}
                name="number"
                rules={{
                  required: t("insurance.policyNumberRequired"),
                  pattern: {
                    value: /^\d+$/,
                    message: t("insurance.policyNumberNumeric"),
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("insuranceNumber", text);
                      onChange(text);
                    }}
                    value={value}
                    placeholder={t("insurance.policyNumberPlaceholder")}
                  />
                )}
              />
              {errors.number && (
                <Text style={styles.errorText}>{errors.number.message}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="dateExpiration"
            rules={{
              required: t("insurance.expirationDateRequired"),
              pattern: {
                value: /^\d{4}-\d{2}-\d{2}$/,
                message: t("insurance.dateFormat"),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <DatePickerInput
                  label={t("vehicleRegistration.expirationDatePlaceholder")}
                  locale="en"
                  underlineColor="transparent"
                  mode="outlined"
                  activeOutlineColor="gray"
                  style={styles.dateinput}
                  date={value ? new Date(value) : new Date()}
                  onChange={(d) => {
                    onChange(d);
                    setInputDate(d);
                    handleInputChange(
                      "insuranceExpirationDate",
                      d.toISOString().split("T")[0],
                    );
                  }}
                  inputMode="start"
                  value={value ? new Date(value) : null}
                />
              </>
            )}
          />
          {errors.dateExpiration && (
            <Text style={styles.errorText}>
              {errors.dateExpiration.message}
            </Text>
          )}
        </View>

        {/*<TouchableOpacity onPress={next} style={{marginTop:30} }>
                    <Text>Next</Text>
                </TouchableOpacity>*/}
      </ScrollView>

      <View style={styles.absoluteButtonContainer}>
        <DualOptionButtonStep
          onPressBack={handlePressBack}
          onPressContinue={handlePressContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 20,
    paddingTop: 0,
  },

  content: {
    paddingTop: 20,
  },

  absoluteButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  inputSection: {
    marginBottom: 20,
  },

  textInput: {
    height: 51,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },

  dropdown1BtnStyle: {
    width: "100%",
    height: 51,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 0,
  },

  dropdown1BtnTxtStyle: {
    color: "#444",
    textAlign: "left",
    fontSize: 16,
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

  scrollviewContainer: {
    flexGrow: 1,
  },

  safeAreaContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },

  contentContainer: {
    marginTop: 15,
    flex: 1,
    justifyContent: "center",
  },

  titleText: {
    fontSize: 23,
    marginHorizontal: 20,
    marginVertical: 10,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#19363C",
  },
  titleSelect: {
    fontSize: 23,
    marginVertical: 10,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#19363C",
  },

  inputInsurance: {
    width: "60%",
    marginRight: "5%",
  },

  inputDate: {
    width: "35%",
    marginRight: "5%",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 3,
  },

  dateinput: {
    backgroundColor: "white",
  },

  errorText: {
    color: "red",
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 10,
  },

  selectContainer: {
    marginHorizontal: 20,
  },
});
