import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import SelectDropdown from "react-native-select-dropdown";
import Stepper from "../../../components/SignUp/stepper";
import { useRecoilValue } from "recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilState } from "recoil";
import { vehicleDetailsState } from "../../../GlobalState/vehiculeState";
import {
  userInfoGatherState,
  lastVehicleState,
} from "../../../GlobalState/userDetailState";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VehicleOwnership() {
  // console.log(vehicleDetails);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const totalSteps = 3;
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const [vehicleDetails, setVehicleDetails] =
    useRecoilState(vehicleDetailsState);
  // null: nothing selected, true: owner, false: not owner
  const [isOwner, setIsOwner] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [lastVehicle, setLastVehicle] = useRecoilState(lastVehicleState);
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

  const handlePressBack = () => {
    // Always decrement actualstep (min 1)
    const array = progressData.map((item) => {
      if (item.id === 1) {
        return {
          ...item,
          actualstep: Math.max(1, item.actualstep - 1),
        };
      } else {
        return item;
      }
    });
    setProgressData(array);
    router.back();
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

    // Province should be empty when country changes
    setProvince("");
    handleInputChange("vehicleOwnerProvince", "");
  };

  const indexOfDefautContry = () => {
    for (var i = 0; i < countries.length; i++) {
      if (countries[i].value == vehicleDetails.vehicleOwnerCountry) {
        return i;
      }
    }
  };

  const indexOfDefautCountryProvinces = () => {
    for (
      var i = 0;
      i < countryProvinces[vehicleDetails.vehicleOwnerCountry].length;
      i++
    ) {
      if (
        countryProvinces[vehicleDetails.vehicleOwnerCountry][i] ==
        vehicleDetails.vehicleOwnerProvince
      ) {
        //  alert(i)
        return i;
      }
    }
  };

  useEffect(() => {
    // Do not auto-select province when country changes
    // setProvince(countryProvinces[country]?.[0] || "");
  }, [country]);

  const handleInputChange = (field, value) => {
    setVehicleDetails((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = handleSubmit((data) => {
    createVehicleDetails();
  });

  const handlePressContinue = () => {
    if (!isOwner) {
      validateForm();
    } else {
      createVehicleDetails();
    }
  };

  const nextPage = () => {
    router.push("/signup/vehiculesSteps/ownerPage");
  };

  const chooseOption = (option) => {
    if (option == 1) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  };

  const createVehicleDetails = async () => {
    // Always save owner info to Recoil state for reuse
    // (fields are already set via handleInputChange, so nothing extra needed)

    // Try to send to backend as before
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      console.error("No token provided");
      return false; // Indicate failure
    }

    try {
      const formattedDetails = {
        brand: vehicleDetails.vehicleBrand,
        model: vehicleDetails.vehicleModel,
        year: vehicleDetails.vehicleYear,
        color: vehicleDetails.vehicleColor,
        plate: vehicleDetails.vehiclePlateNumber,
        serialNumber: vehicleDetails.vehicleSerialNumber,
        immatriculation: {
          numeroCertificatImmatriculation:
            vehicleDetails.vehicleNumeroCertificat,
          dateDelivrance: vehicleDetails.vehicleCerticateDeliveryDate,
          dateExpiration: vehicleDetails.vehicleCerticateExpirationDate,
          numeroEssieux: vehicleDetails.vehicleEssieux,
          masseNette: vehicleDetails.vehicleNetWeight,
          cylindree: vehicleDetails.vehicleCylinder,
          numeroDossier: vehicleDetails.vehicleDossierNumber,
          categorieUsage: vehicleDetails.vehiclecategorieUsage,
        },
        // Add all owner info for guaranteed persistence
        vehicleOwnerFirstname: vehicleDetails.vehicleOwnerFirstname,
        vehicleOwnerName: vehicleDetails.vehicleOwnerName,
        vehicleOwnerPhone: vehicleDetails.vehicleOwnerPhone,
        vehicleOwnerAddress: vehicleDetails.vehicleOwnerAddress,
        vehicleOwnerCity: vehicleDetails.vehicleOwnerCity,
        vehicleOwnerPostalCode: vehicleDetails.vehicleOwnerPostalCode,
        vehicleOwnerCountry: vehicleDetails.vehicleOwnerCountry,
        vehicleOwnerProvince: vehicleDetails.vehicleOwnerProvince,
      };

      console.log(formattedDetails);

      // Save to Recoil state (redundant if handleInputChange is always used, but ensures persistence)
      setVehicleDetails((prev) => ({ ...prev, ...formattedDetails }));

      // If user already created a vehicle during this signup, UPDATE it instead of creating a new one
      let response;
      if (lastVehicle) {
        response = await fetch(`${API_URL}vehicles/${lastVehicle}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedDetails),
        });
      } else {
        response = await fetch(`${API_URL}vehicles/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedDetails),
        });
      }

      console.log(response);
      const data = await response.json();

      console.log(data);
      if (response.ok) {
        // Store the vehicle ID so we can update it if user goes back
        const vehicleId = data.car?._id;
        if (vehicleId) {
          setLastVehicle(vehicleId);
        }
      } else {
        if (
          data.message ==
          "Une voiture avec cette plaque d'immatriculation existe déjà."
        ) {
          Alert.alert(
            t("error"),
            t("vehicleOwnership.acarwiththislicenseplatealreadyexists"),
            [
              {
                text: "Ok",
                onPress: () => {
                  return;
                },
                style: "cancel",
              },
            ],
          );
        } else {
          // Show backend error message if available, else a default error
          Alert.alert(
            t("error"),
            data.message || data.error || t("vehicleOwnership.unknownError"),
            [
              {
                text: "Ok",
                style: "cancel",
              },
            ],
          );
        }
      }
      // Always set progress to 100% after last step, regardless of backend response
      const array = progressData.map((item) => {
        if (item.id === 1) {
          return {
            ...item,
            actualstep: 3,
            completion: 1,
          };
        } else {
          return item;
        }
      });
      setProgressData(array);
      router.push("/signup/signUpLanding");
    } catch (error) {
      console.error("Error creating vehicle details:", error);
      return false; // Indicate failure
    }
  };

  const onPressOwner = async () => {
    const success = await createVehicleDetails();
    if (success) {
      setCurrentStep(4);
      router.push("signup/signUpLanding");
    }
  };

  const onPressNotOwner = () => {
    setIsOwner(false);
  };

  const namePattern = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;

  /*const openCamera = () => {
        if (hasPermission) {
            console.log("Ouverture de la caméra...");
        } else {
            Alert.alert(
                "Permission requise",
                "L'application a besoin de l'accès à la caméra"
            );
        }
    };*/

  const OnPressBack = () => {
    router.push("./vehiculesDetails");
  };

  const onSubmit = async (data) => {
    if (isOwner) {
      await onPressOwner();
    } else {
      onPressNotOwner();
    }
    console.log(data);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={styles.container}>
        <Stepper
          currentStep={(progressData[1]?.actualstep ?? 0) + 1}
          totalSteps={totalSteps}
        />
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 80 }}>
          <Text style={styles.title}>{t("vehicleOwnership.ownerTitle")}</Text>
          <View style={styles.inputSection}>
            <TouchableOpacity
            onPress={() => chooseOption(1)}
            style={isOwner === true ? styles.selectedButton : styles.unSelectedButton}
          >
            <Text style={isOwner === true ? styles.selectedButtonText : styles.unSelectedButtonText}>
              {t("vehicleOwnership.ownerOption1")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => chooseOption(2)}
            style={isOwner === false ? styles.selectedButton : styles.unSelectedButton}
          >
            <Text style={isOwner === false ? styles.selectedButtonText : styles.unSelectedButtonText}>
              {t("vehicleOwnership.ownerOption2")}
            </Text>
          </TouchableOpacity>

          {/* Only show fields if 'Je ne suis pas le propriétaire du véhicule' is selected */}
          {isOwner === false && (
            <>
              <View style={styles.inputSection}>
                <Controller
                  control={control}
                  rules={{ required: t("vehicleOwnership.lastNameRequired") }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        handleInputChange("vehicleOwnerName", text);
                        onChange(text);
                      }}
                      value={value}
                      placeholder={t("vehicleOwnership.lastNamePlaceholder")}
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
                  rules={{
                    required: t("vehicleOwnership.phoneRequired"),
                    maxLength: {
                      value: 10,
                      message: t("vehicleOwnership.phoneTenDigits"),
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        // Only allow numbers and max 10 digits
                        const filtered = text.replace(/[^0-9]/g, '').slice(0, 10);
                        handleInputChange("vehicleOwnerPhone", filtered);
                        onChange(filtered);
                      }}
                      value={value}
                      keyboardType="numeric"
                      maxLength={10}
                      placeholder={t("vehicleOwnership.phonePlaceholder")}
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
                  rules={{ required: t("vehicleOwnership.addressRequired") }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        handleInputChange("vehicleOwnerAddress", text);
                        onChange(text);
                      }}
                      value={value}
                      placeholder={t("vehicleOwnership.addressPlaceholder")}
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
                      rules={{ required: t("vehicleOwnership.cityRequired") }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.textInput}
                          onBlur={onBlur}
                          onChangeText={(text) => {
                            handleInputChange("vehicleOwnerCity", text);
                            onChange(text);
                          }}
                          value={value}
                          placeholder={t("vehicleOwnership.cityPlaceholder")}
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
                      rules={{
                        required: t("vehicleOwnership.postalCodeRequired"),
                        maxLength: {
                          value: 6,
                          message: t("vehicleOwnership.postalCodeSixChars"),
                        },
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.textInput}
                          onBlur={onBlur}
                          onChangeText={(text) => {
                            // Only allow max 6 chars
                            const filtered = text.slice(0, 6);
                            handleInputChange("vehicleOwnerPostalCode", filtered);
                            onChange(filtered);
                          }}
                          value={value}
                          maxLength={6}
                          placeholder={t(
                            "vehicleOwnership.postalCodePlaceholder",
                          )}
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
                      rules={{ required: t("vehicleOwnership.countryRequired") }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                          <SelectDropdown
                            defaultButtonText="Pays"
                            defaultValueByIndex={
                              vehicleDetails.vehicleOwnerCountry
                                ? indexOfDefautContry()
                                : null
                            }
                            data={countries.map((country) => country.label)}
                            onSelect={(selectedItem, index) => {
                              onChange(countries[index].label);
                              onSelectCountry(selectedItem, index);
                            }}
                            buttonTextAfterSelection={(selectedItem) => selectedItem}
                            rowTextForSelection={(item) => item}
                            buttonStyle={styles.dropdown1BtnStyle}
                            buttonTextStyle={styles.dropdown1BtnTxtStyle}
                            renderDropdownIcon={() => <Text>▼</Text>}
                            dropdownIconPosition={"right"}
                            dropdownStyle={styles.dropdown1DropdownStyle}
                            rowStyle={styles.dropdown1RowStyle}
                            rowTextStyle={styles.dropdown1RowTxtStyle}
                          />
                        </View>
                      )}
                    />
                  </View>
                  {errors.country && (
                    <Text style={styles.errorText}>{errors.country.message}</Text>
                  )}

                  <View style={{ flex: 1 }}>
                    <Controller
                      control={control}
                      name="province"
                      rules={{ required: t("vehicleOwnership.provinceRequired") }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                          <SelectDropdown
                            defaultButtonText="Province"
                            defaultValueByIndex={
                              vehicleDetails.vehicleOwnerProvince && country
                                ? indexOfDefautCountryProvinces()
                                : null
                            }
                            data={country ? countryProvinces[country] : []}
                            onSelect={(selectedItem, index) => {
                              handleInputChange("vehicleOwnerProvince", selectedItem);
                              onChange(selectedItem);
                            }}
                            buttonTextAfterSelection={(selectedItem) => selectedItem}
                            rowTextForSelection={(item) => item}
                            buttonStyle={styles.dropdown2BtnStyle}
                            buttonTextStyle={styles.dropdown1BtnTxtStyle}
                            renderDropdownIcon={() => <Text>▼</Text>}
                            dropdownIconPosition={"right"}
                            dropdownStyle={styles.dropdown1DropdownStyle}
                            rowStyle={styles.dropdown1RowStyle}
                            rowTextStyle={styles.dropdown1RowTxtStyle}
                            disabled={!country}
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
            </>
          )}
        </View>
        </ScrollView>
        <View style={styles.absoluteButtonContainer}>
          <DualOptionButton
            onPressBack={handlePressBack}
            onPressContinue={handlePressContinue}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 20,
    paddingTop: 0,
    backgroundColor: "white",
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
    marginBottom: 28,
    marginTop: 24,
    textAlign: "center",
    color: "#0B8BA8",
  },

  selectedButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#0B8BA8",
    backgroundColor: "#0B8BA8",
    height: 51,
    marginBottom: 12,
  },

  selectedButtonText: {
    color: "#fff",
  },

  unSelectedButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    backgroundColor: "#fff",
    borderColor: "#B0B0B0",
    height: 51,
    marginBottom: 12,
  },

  unSelectedButtonText: {
    color: "black",
  },

  inputSection: {
    marginBottom: 28,
    paddingHorizontal: 2,
  },

  textInput: {
    height: 51,
    borderColor: "#B0B0B0",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
  },

  inputSection: {
    marginBottom: 20,
  },

  errorText: {
    color: "#D32F2F",
    marginTop: 6,
    fontSize: 13,
    marginLeft: 2,
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
