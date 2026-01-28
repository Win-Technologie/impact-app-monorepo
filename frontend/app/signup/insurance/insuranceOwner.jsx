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
} from "react-native";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import { useRecoilState, useRecoilValue } from "recoil";
import SelectDropdown from "react-native-select-dropdown";
import {
  expirationDateState,
  insuranceCompanyState,
  policyNumberState,
  insuranceInfoState,
  userVehicleState,
} from "../../../GlobalState/InsuranceState";
import { addNewInsurances } from "../../api/users/userApi";
import Stepper from "../../../components/SignUp/stepper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  userInfoGatherState,
  lastVehicleState,
} from "../../../GlobalState/userDetailState";
import { useForm, Controller } from "react-hook-form";
import { insuranceState } from "../../../GlobalState/InsuranceState";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InsuranceStageThree() {
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const [insuranceDetails, setInsuranceDetail] = useRecoilState(insuranceState);
  const [lastVehicle, setlastVehicle] = useRecoilState(lastVehicleState);
  const [isOwner, setIsOwner] = useState(true);
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(3);
  const ENDPOINT = "insurances/add/";
  const [country, setCountry] = useState("CA");
  const [province, setProvince] = useState("");
  const { t } = useTranslation();

  const countries = [
    { label: "🇨🇦 Canada", value: "CA" },
    { label: "🇫🇷 France", value: "FR" },
    { label: "🇺🇸 États-Unis", value: "US" },
  ];

  const countryProvinces = {
    CA: ["Ontario", "Québec", "Colombie-Britannique"],
    FR: ["Île-de-France", "Nouvelle-Aquitaine", "Occitanie"],
    US: ["Californie", "Texas", "New York"],
  };

  const chooseOption = (option) => {
    if (option == 1) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
    },
  });

  const onSelectCountry = (selectedItem, index) => {
    const selectedCountry = countries[index].value;
    setCountry(selectedCountry);
    handleInputChange("vehicleOwnerCountry", selectedCountry);

    // Set the initial province based on the newly selected country
    const initialProvince = countryProvinces[selectedCountry]?.[0] || "";
    setProvince(initialProvince);
    handleInputChange("vehicleOwnerProvince", initialProvince);
  };

  const indexOfDefautContry = () => {
    for (var i = 0; i < countries.length; i++) {
      if (countries[i].value == insuranceDetails.vehicleOwnerCountry) {
        return i;
      }
    }
  };

  const indexOfDefautCountryProvinces = () => {
    for (
      var i = 0;
      i < countryProvinces[insuranceDetails.vehicleOwnerCountry].length;
      i++
    ) {
      if (
        countryProvinces[insuranceDetails.vehicleOwnerCountry][i] ==
        insuranceDetails.vehicleOwnerProvince
      ) {
        //  alert(i)
        return i;
      }
    }
  };

  const handlePressBack = () => {
    router.back();
  };

  useEffect(() => {
    setProvince(countryProvinces[country]?.[0] || "");
  }, [country]);

  const handlePressContinue = () => {
    // console.log(insuranceDetails);

    if (!isOwner) {
      validateForm();
    } else {
      addInsurance();
    }
  };

  const validateForm = handleSubmit((data) => {
    //addInsurance();
  });

  const handleInputChange = (field, value) => {
    setInsuranceDetail((prev) => ({ ...prev, [field]: value }));
  };

  const addInsurance = async () => {
    const insuranceInfo = {
      policyNumber: insuranceDetails.insuranceNumber,
      expirationDate: insuranceDetails.insuranceExpirationDate,
      insuranceCompany: insuranceDetails.insuranceFirmName,
    };

    const userToken = await AsyncStorage.getItem("userToken");
    const vehiculeUser = insuranceDetails.idCar;

    try {
      const result = await addNewInsurances(
        insuranceInfo,
        vehiculeUser,
        ENDPOINT,
        userToken,
      );
      console.log(result);

      if (result.status === 201) {
        // setInfoInsurance(result.data.insurance)

        if (progressData[2].actualstep == 2) {
          const array = progressData.map((item) => {
            if (item.id == 2) {
              return {
                id: 2,
                title: "Informations d'assurances",
                subtitle: "8 minutes",
                completion: 1,
                actualstep: 3,
                nbstep: 3,
              };
            } else {
              return item;
            }
          });

          setProgressData(array);
        }

        setlastVehicle(null);
        router.push("/signup/signUpLanding/");
      }
      if (result.status === 400) {
        result.data.error
          ? setMessageErrorServer(result.data.error)
          : setMessageErrorServer(result.data.message);
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stepper
        currentStep={progressData[2].actualstep}
        totalSteps={totalSteps}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{t("insurance.ownerTitle")}</Text>

        <View style={styles.inputSection}>
          <TouchableOpacity
            onPress={() => {
              chooseOption(1);
            }}
            style={isOwner ? styles.selectedButton : styles.unSelectedButton}
          >
            <Text
              style={
                isOwner
                  ? styles.selectedButtonText
                  : styles.unSelectedButtonText
              }
            >
              {t("insurance.ownerOption")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <TouchableOpacity
            onPress={() => {
              chooseOption(2);
            }}
            style={!isOwner ? styles.selectedButton : styles.unSelectedButton}
          >
            <Text
              style={
                !isOwner
                  ? styles.selectedButtonText
                  : styles.unSelectedButtonText
              }
            >
              {t("insurance.notOwnerOption")}
            </Text>
          </TouchableOpacity>
        </View>

        {!isOwner && (
          <>
            <Text style={styles.title}>{t("insurance.subscriberInfo")}</Text>

            <View style={styles.inputSection}>
              <Controller
                control={control}
                rules={{ required: t("insurance.firstNameRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("insuranceOwnerFirstname", text);
                      onChange(text);
                    }}
                    value={value}
                    placeholder={t("insurance.firstNamePlaceholder")}
                  />
                )}
                name="firstName"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName.message}</Text>
              )}
            </View>

            <View style={styles.inputSection}>
              <Controller
                control={control}
                rules={{ required: t("insurance.lastNameRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("insuranceOwnerName", text);
                      onChange(text);
                    }}
                    value={value}
                    placeholder={t("insurance.lastNamePlaceholder")}
                  />
                )}
                name="lastName"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
              )}
            </View>

            <View style={styles.inputSection}>
              <Controller
                control={control}
                rules={{ required: t("insurance.phoneRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("insuranceOwnerPhone", text);
                      onChange(text);
                    }}
                    value={value}
                    placeholder={t("insurance.phonePlaceholder")}
                  />
                )}
                name="phone"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone.message}</Text>
              )}
            </View>

            <View style={styles.inputSection}>
              <Controller
                control={control}
                rules={{ required: t("insurance.phoneRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("insuranceOwnerAddress", text);
                      onChange(text);
                    }}
                    value={value}
                    placeholder={t("insurance.phonePlaceholder")}
                  />
                )}
                name="address"
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address.message}</Text>
              )}
            </View>

            <View style={styles.inputSection}>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Controller
                    control={control}
                    name="city"
                    rules={{ required: t("insurance.cityRequired") }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          handleInputChange("insuranceOwnerCity", text);
                          onChange(text);
                        }}
                        value={value}
                        placeholder={t("insurance.cityPlaceholder")}
                      />
                    )}
                  />
                  {errors.city && (
                    <Text style={styles.errorText}>{errors.city.message}</Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="postalCode"
                    rules={{ required: t("insurance.postalCodeRequired") }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          handleInputChange("insuranceOwnerPostalCode", text);
                          onChange(text);
                        }}
                        value={value}
                        placeholder={t("insurance.postalCodePlaceholder")}
                      />
                    )}
                  />
                  {errors.postalCode && (
                    <Text style={styles.errorText}>
                      {errors.postalCode.message}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.inputSection}>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, marginRight: 5 }}>
                  <Controller
                    control={control}
                    name="country"
                    rules={{ required: t("insurance.countryRequired") }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <SelectDropdown
                          defaultButtonText={t("insurance.countryPlaceholder")}
                          defaultValueByIndex={
                            insuranceDetails.insuranceOwnerCountry
                              ? indexOfDefautContry()
                              : null
                          }
                          data={countries.map((country) => country.label)}
                          onSelect={onSelectCountry}
                          buttonTextAfterSelection={(selectedItem, index) => {
                            onChange(countries[index].label);
                            return selectedItem;
                          }}
                          rowTextForSelection={(item, index) => {
                            return item;
                          }}
                          buttonStyle={styles.dropdown1BtnStyle}
                          buttonTextStyle={styles.dropdown1BtnTxtStyle}
                          renderDropdownIcon={() => {
                            return <Text>▼</Text>;
                          }}
                          dropdownIconPosition={"right"}
                          dropdownStyle={styles.dropdown1DropdownStyle}
                          // rowStyle={styles.dropdown1RowStyle}
                          rowTextStyle={styles.dropdown1RowTxtStyle}
                          onBlur={() => {
                            onBlur();
                          }}
                          value="CA"
                        />
                        {errors.country && (
                          <Text style={styles.errorText}>
                            {errors.country.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="province"
                    rules={{ required: t("insurance.provinceRequired") }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <SelectDropdown
                          defaultButtonText={t("insurance.provincePlaceholder")}
                          defaultValueByIndex={
                            insuranceDetails.insuranceOwnerProvince
                              ? indexOfDefautCountryProvinces()
                              : null
                          }
                          data={countryProvinces[country] || []}
                          onSelect={(selectedItem, index) => {
                            handleInputChange(
                              "insuranceOwnerProvince",
                              selectedItem,
                            );
                          }}
                          buttonTextAfterSelection={(selectedItem, index) => {
                            onChange(countries[index].label);
                            return selectedItem;
                          }}
                          rowTextForSelection={(item, index) => {
                            return item;
                          }}
                          buttonStyle={styles.dropdown2BtnStyle}
                          buttonTextStyle={styles.dropdown1BtnTxtStyle}
                          renderDropdownIcon={() => {
                            return <Text>▼</Text>;
                          }}
                          dropdownIconPosition={"right"}
                          dropdownStyle={styles.dropdown1DropdownStyle}
                          rowStyle={styles.dropdown1RowStyle}
                          rowTextStyle={styles.dropdown1RowTxtStyle}
                          onBlur={() => {
                            onBlur();
                          }}
                          value={value}
                        />
                        {errors.province && (
                          <Text style={styles.errorText}>
                            {errors.province.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>
              </View>
            </View>

            {/*<TouchableOpacity style={styles.cameraIcon} onPress={openCamera}>
                            <Ionicons name='camera' size={40} color='wh' />
                        </TouchableOpacity>*/}
          </>
        )}
      </ScrollView>

      <View style={styles.absoluteButtonContainer}>
        <DualOptionButton
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

  stepper: {
    marginHorizontal: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },

  selectedButton: {
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0B8BA8",
    backgroundColor: "#0B8BA8",
    height: 51,
  },

  selectedButtonText: {
    color: "#fff",
  },

  unSelectedButton: {
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
    borderColor: "#ccc",
    height: 51,
  },

  unSelectedButtonText: {
    color: "black",
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

  inputSection: {
    marginBottom: 20,
  },

  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 12,
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

  dropdown2BtnStyle: {
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

  outerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },

  stepper: {
    marginHorizontal: 15,
    marginTop: 10,
    marginLeft: 15,
  },
});
