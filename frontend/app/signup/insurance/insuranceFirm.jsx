import {
  StyleSheet,
  Text,
  View,
  Button,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import SelectDropdown from "react-native-select-dropdown";
import DualOptionButtonStep from "../../../components/SignUp/dualBottomButtonsSteps";
import { useRecoilState } from "recoil";
import { insuranceCompanyState } from "../../../GlobalState/InsuranceState";
import { useForm, Controller } from "react-hook-form";
import Stepper from "../../../components/SignUp/stepper";
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { insuranceState } from "../../../GlobalState/InsuranceState";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InsuranceStageTwo() {
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const [insuranceDetails, setInsuranceDetail] = useRecoilState(insuranceState);
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(2);
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

  const handleInputChange = (field, value) => {
    setInsuranceDetail((prev) => ({ ...prev, [field]: value }));
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      insuranceName: insuranceDetails.insuranceFirmName,
      address: insuranceDetails.insuranceFirmAddress,
      city: insuranceDetails.insuranceFirmCity,
      postalCode: insuranceDetails.insuranceFirmPostalCode,
      country: insuranceDetails.insuranceFirmCountry,
      province: insuranceDetails.insuranceFirmProvince,
    },
  });

  const onSelectCountry = (selectedItem, index) => {
    const selectedCountry = countries[index].value;
    setCountry(selectedCountry);
    handleInputChange("insuranceFirmCountry", selectedCountry);

    // Set the initial province based on the newly selected country
    const initialProvince = countryProvinces[selectedCountry]?.[0] || "";
    setProvince(initialProvince);
    handleInputChange("insuranceFirmProvince", initialProvince);
  };

  const indexOfDefautContry = () => {
    for (var i = 0; i < countries.length; i++) {
      if (countries[i].value == insuranceDetails.insuranceFirmCountry) {
        return i;
      }
    }
  };

  const indexOfDefautCountryProvinces = () => {
    for (
      var i = 0;
      i < countryProvinces[insuranceDetails.insuranceFirmCountry].length;
      i++
    ) {
      if (
        countryProvinces[insuranceDetails.insuranceFirmCountry][i] ==
        insuranceDetails.insuranceFirmProvince
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

  const next = () => {
    router.push("/signup/insurance/insuranceOwner");
  };

  const handlePressContinue = handleSubmit((data) => {
    if (progressData[2].actualstep == 1) {
      const array = progressData.map((item) => {
        if (item.id == 2) {
          return {
            id: 2,
            title: t("insuranceFirm.firmTitle"),
            subtitle: "8 minutes",
            completion: 0,
            actualstep: 2,
            nbstep: 3,
          };
        } else {
          return item;
        }
      });

      setProgressData(array);
    }

    router.push("/signup/insurance/insuranceOwner");
  });

  /*
    const handlePressContinue = ({ insuranceName }) => {
        // Met à jour le nom de l'assurance avec la valeur soumise.
        setInsuranceCompany(insuranceName);
        // Redirige l'utilisateur à l'étape suivante du processus d'inscription.
        router.push('/signup/insurance/insuranceOwner');
    };*/

  return (
    <SafeAreaView style={styles.container}>
      <Stepper
        currentStep={progressData[2].actualstep}
        totalSteps={totalSteps}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{t("insuranceFirm.firmTitle")}</Text>
        <View style={styles.inputSection}>
          <Controller
            name="insuranceName"
            control={control}
            rules={{
              required: t("insuranceFirm.firmNameRequired"),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.textInput]}
                onBlur={onBlur}
                onChangeText={(text) => {
                  handleInputChange("insuranceFirmName", text);
                  onChange(text);
                }}
                value={value}
                placeholder={t("insuranceFirm.firmNamePlaceholder")}
              />
            )}
          />
          {errors.insuranceName && (
            <Text style={styles.errorText}>{errors.insuranceName.message}</Text>
          )}
        </View>

        <Text style={styles.title}>{t("insuranceFirm.firmAddressTitle")}</Text>

        <View style={styles.inputSection}>
          <Controller
            control={control}
            rules={{
              required: t("insuranceFirm.firmAddressRequired"),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textInput}
                onBlur={onBlur}
                onChangeText={(text) => {
                  handleInputChange("insuranceFirmAddress", text);
                  onChange(text);
                }}
                value={value}
                placeholder={t("insuranceFirm.firmAddressPlaceholder")}
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
                rules={{ required: t("insuranceFirm.firmCityRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("insuranceFirmCity", text);
                      onChange(text);
                    }}
                    value={value}
                    placeholder={t("insuranceFirm.firmCityPlaceholder")}
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
                  required: t("insuranceFirm.firmPostalCodeRequired"),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      handleInputChange("insuranceFirmPostalCode", text);
                      onChange(text);
                    }}
                    value={value}
                    placeholder={t("insuranceFirm.firmPostalCodePlaceholder")}
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
                rules={{ required: t("insuranceFirm.firmCountryRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <SelectDropdown
                      defaultButtonText={t(
                        "insuranceFirm.firmCountryPlaceholder",
                      )}
                      defaultValueByIndex={
                        insuranceDetails.insuranceFirmCountry
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
                rules={{ required: t("insuranceFirm.firmProvinceRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <SelectDropdown
                      defaultButtonText={t(
                        "insuranceFirm.firmProvincePlaceholder",
                      )}
                      defaultValueByIndex={
                        insuranceDetails.insuranceFirmProvince
                          ? indexOfDefautCountryProvinces()
                          : null
                      }
                      data={countryProvinces[country] || []}
                      onSelect={(selectedItem, index) => {
                        handleInputChange(
                          " insuranceFirmProvince",
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

        {/*<TouchableOpacity onPress={next} style={{ marginTop: 30 }}>
                    <Text>{t('insuranceFirm.nextButton')}</Text>
                </TouchableOpacity>*/}
      </ScrollView>

      <View style={styles.absoluteButtonContainer}>
        <DualOptionButtonStep
          onPressBack={handlePressBack}
          onPressContinue={handleSubmit(handlePressContinue)}
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

  dropdown2BtnStyle: {
    width: "100%",
    height: 51,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 0,
  },

  dropdown2BtnTxtStyle: {
    color: "#444",
    textAlign: "left",
    fontSize: 16,
  },

  dropdown2DropdownStyle: {
    backgroundColor: "#EFEFEF",
  },

  dropdown2RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },

  dropdown2RowTxtStyle: {
    color: "#444",
    textAlign: "left",
  },

  errorText: {
    color: "red",
    fontSize: 12,
  },

  /*   scrollviewContainer: {
        flexGrow: 1
    },
    safeAreaContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 40 : 0
    },
    contentContainer: {
        marginTop: 15,
        flex: .85,
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 23,
        marginBottom: 30,
        fontWeight: 'bold',
        color: '#19363C',
        marginHorizontal: 20
    },
    inputContainer: {
        marginHorizontal: 20,
        marginBottom: 20
    },
    inputInsuranceName: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 7
    },
    errorText: {
        color: 'red',
        fontSize: 12,
    },
    inputInsurance: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 20,
        marginHorizontal: 20,
    },
    inputCodePostal: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 20,
    },
    inputVille: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 20,
    },
    inputHalf: {
        width: '60%',
        marginRight: '5%',
    },
    inputQuarter: {
        width: '35%',
        marginRight: '5%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
    },
    dropdown1BtnStyle: {
        width: '60%',
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
    },
    dropdown2BtnStyle: {
        width: '35%',
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
    },
    dropdown1BtnTxtStyle: {
        color: '#444',
        textAlign: 'left'
    },
    dropdown1DropdownStyle: {
        backgroundColor: '#EFEFEF'
    },
    dropdown1RowStyle: {
        backgroundColor: '#EFEFEF',
        borderBottomColor: '#C5C5C5'
    },
    dropdown1RowTxtStyle: {
        color: '#444',
        textAlign: 'left'
    },*/
});
