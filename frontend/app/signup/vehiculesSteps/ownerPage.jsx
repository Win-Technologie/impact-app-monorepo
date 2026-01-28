import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
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
  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 3;
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const [vehicleDetails, setVehicleDetails] =
    useRecoilState(vehicleDetailsState);
  const [isOwner, setIsOwner] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [country, setCountry] = useState("CA");
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
    setCurrentStep(currentStep - 1);
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

    // Set the initial province based on the newly selected country
    const initialProvince = countryProvinces[selectedCountry]?.[0] || "";
    setProvince(initialProvince);
    handleInputChange("vehicleOwnerProvince", initialProvince);
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
    /*console.log("Selected country: ", country);
        console.log("Provinces available: ", countryProvinces[country]);*/
    setProvince(countryProvinces[country]?.[0] || "");
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
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      console.error("No token provided");
      return false; // Indicate failure
    }

    try {
      // Make sure the property names match those in the Recoil state

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
      };

      console.log(formattedDetails);

      // console.log(formattedDetails);
      /* vehicleOwnerFirstname: '',
                        vehicleOwnerName: '',
                            vehicleOwnerPhone: '',
                                vehicleOwnerAddress: '',
                                    vehicleOwnerCity: '',
                                        vehicleOwnerPostalCode: '',
                                            vehicleOwnerCountry: '',
                                                vehicleOwnerProvince: '',*/
      // console.log("Sending to backend:", formattedDetails);

      const response = await fetch(`${API_URL}vehicles/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedDetails),
      });

      console.log(response);
      const data = await response.json();

      console.log(data);
      if (response.status != 201) {
        if (
          data.message ==
          "Une voiture avec cette plaque d'immatriculation existe déjà."
        ) {
          //alert("Une voiture avec cette plaque d'immatriculation existe déjà.");

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
          alert();
        }
      } else {
        setLastVehicle(data.car);
        if (progressData[1].actualstep == 2) {
          const array = progressData.map((item) => {
            if (item.id == 1) {
              return {
                id: 1,
                title: "Information du vehicules",
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

        router.push("/signup/signUpLanding");
      }
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
    <SafeAreaView style={styles.container}>
      <Stepper
        currentStep={progressData[1].actualstep}
        totalSteps={totalSteps}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{t("vehicleOwnership.ownerTitle")}</Text>

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
              {t("vehicleOwnership.ownerOption1")}
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
              {t("vehicleOwnership.ownerOption2")}
            </Text>
          </TouchableOpacity>
        </View>

        {!isOwner && (
          <>
            <Text style={styles.title}>
              {t("vehicleOwnership.ownerInfoTitle")}
            </Text>

            <View style={styles.inputSection}>
              <Controller
                control={control}
                rules={{ required: t("vehicleOwnership.firstNameRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("vehicleOwnerFirstname", text);
                      onChange(text);
                    }}
                    value={value}
                    placeholder={t("vehicleOwnership.firstNamePlaceholder")}
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
                  /*pattern: {
                                        value: /^\d{10}$/,
                                        message: "Entrez un numero valide",
                                    },*/
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("vehicleOwnerPhone", text);
                      onChange(text);
                    }}
                    value={value}
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
                rules={{
                  required: t("vehicleOwnership.addressRequired"),
                }}
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
                      // pattern: /^[A-Za-z0-9]{3,6}$/
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          handleInputChange("vehicleOwnerPostalCode", text);
                          onChange(text);
                        }}
                        value={value}
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
                          defaultButtonText={t(
                            "vehicleOwnership.countryPlaceholder",
                          )}
                          defaultValueByIndex={
                            vehicleDetails.vehicleOwnerCountry
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
                    rules={{ required: t("vehicleOwnership.provinceRequired") }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <SelectDropdown
                          defaultButtonText={t(
                            "vehicleOwnership.provincePlaceholder",
                          )}
                          defaultValueByIndex={
                            vehicleDetails.vehicleOwnerProvince
                              ? indexOfDefautCountryProvinces()
                              : null
                          }
                          data={countryProvinces[country] || []}
                          onSelect={(selectedItem, index) => {
                            handleInputChange(
                              "vehicleOwnerProvince",
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
