import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { router } from "expo-router";
import Stepper from "../../../components/SignUp/stepper";
import { useRecoilState } from "recoil";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import { userDetailsState } from "../../../GlobalState/userDetailState";
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

const phoneAndAddress = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("CA");
  const [province, setProvince] = useState("");
  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 4;
  const [userDetails, setUserDetails] = useRecoilState(userDetailsState);
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const { t } = useTranslation();

  // console.log(userDetails);

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

  const indexOfDefautContry = () => {
    for (var i = 0; i < countries.length; i++) {
      if (countries[i].value == userDetails.country) {
        return i;
      }
    }
  };

  const indexOfDefautCountryProvinces = () => {
    console.log("les provinces");

    for (var i = 0; i < countryProvinces[userDetails.country].length; i++) {
      if (countryProvinces[userDetails.country][i] == userDetails.province) {
        return i;
      }
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: userDetails.phone,
      address: userDetails.address,
      lastName: userDetails.lastName,
      country: userDetails.country,
      city: userDetails.city,
      postalCode: userDetails.postalCode,
      // province: userDetails.province,
    },
    mode: "onChange",
  });

  const onSelectCountry = (selectedItem, index) => {
    const selectedCountry = countries[index].value;
    setCountry(selectedCountry);
    handleInputChange("country", selectedCountry);
    // Set the initial province based on the newly selected country
    const initialProvince = countryProvinces[selectedCountry]?.[0] || "";
    setProvince(initialProvince);
    handleInputChange("province", initialProvince);
  };

  useEffect(() => {
    /*console.log("Selected country: ", country);
        console.log("Provinces available: ", countryProvinces[country]);*/
    setProvince(countryProvinces[country]?.[0] || "");
  }, [country]);

  useEffect(() => {}, [userDetails]);

  const handlePressBack = () => {
    setCurrentStep(currentStep - 1);
    //router.push('./dateOfBirth');
    router.back();
  };

  const handleInputChange = (field, value) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePressContinue = handleSubmit((data) => {
    setCurrentStep(currentStep + 1);
    if (progressData[0].actualstep == 2) {
      const array = progressData.map((item) => {
        if (item.id == 0) {
          return {
            id: 0,
            title: "Information personnelles",
            subtitle: "4 minutes",
            completion: 0,
            actualstep: 3,
            nbstep: 4,
          };
        } else {
          return item;
        }
      });

      setProgressData(array);
    }

    // console.log("okay");

    router.push("/signup/personalInfoSteps/driverLicence");
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stepper
        currentStep={progressData[0].actualstep}
        totalSteps={totalSteps}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{t("phoneAndAddress.phoneTitle")}</Text>
        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="phone"
            rules={{
              required: t("phoneAndAddress.phoneRequired"),
              pattern: {
                value: /^(0|[1-9]\d*)(\.\d+)?$/,
                message: t("phoneAndAddress.phoneonlynumber"),
              },
              minLength: {
                value: 4,
                message: t("phoneAndAddress.fourcarminimum"),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textInput}
                placeholder={t("phoneAndAddress.phonePlaceholder")}
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  setUserDetails({ ...userDetails, phone: text });
                }}
                value={value}
              />
            )}
          />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone.message}</Text>
          )}
        </View>

        <Text style={styles.title}>{t("phoneAndAddress.addressTitle")}</Text>
        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="address"
            rules={{
              required: t("phoneAndAddress.addressRequired"),
              minLength: {
                value: 4,
                message: t("phoneAndAddress.fourcarminimum"),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textInput}
                placeholder={t("phoneAndAddress.addressPlaceholder")}
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  setUserDetails({ ...userDetails, address: text });
                }}
                value={value}
              />
            )}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address.message}</Text>
          )}
        </View>

        <View style={{ flexDirection: "row", marginVertical: 10 }}>
          <View style={{ flex: 3, marginRight: 5 }}>
            <Controller
              control={control}
              name="city"
              rules={{
                required: t("phoneAndAddress.cityRequired"),
                minLength: {
                  value: 4,
                  message: t("phoneAndAddress.fourcarminimum"),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textInput}
                  placeholder={t("phoneAndAddress.cityPlaceholder")}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    setUserDetails({ ...userDetails, city: text });
                  }}
                  value={value}
                />
              )}
            />
            {errors.city && (
              <Text style={styles.errorText}>{errors.city.message}</Text>
            )}
          </View>

          <View style={{ flex: 2, marginLeft: 5 }}>
            <Controller
              control={control}
              name="postalCode"
              rules={{ required: t("phoneAndAddress.postalCodeRequired") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textInput}
                  placeholder={t("phoneAndAddress.postalCodePlaceholder")}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    setUserDetails({ ...userDetails, postalCode: text });
                  }}
                  value={value}
                />
              )}
            />
            {errors.postalCode && (
              <Text style={styles.errorText}>{errors.postalCode.message}</Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row", marginVertical: 10 }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <Controller
              control={control}
              name="country"
              rules={{ required: t("phoneAndAddress.countryRequired") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <SelectDropdown
                    defaultButtonText="Pays"
                    defaultValueByIndex={
                      userDetails.country ? indexOfDefautContry() : null
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
              rules={{ required: t("phoneAndAddress.provinceTitle") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <SelectDropdown
                    defaultButtonText="Province"
                    defaultValueByIndex={
                      userDetails.province
                        ? indexOfDefautCountryProvinces()
                        : null
                    }
                    data={countryProvinces[userDetails.country] || []}
                    onSelect={(selectedItem, index) => {
                      handleInputChange("province", selectedItem);
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      onChange("cc");
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
      </ScrollView>

      <View style={styles.absoluteButtonContainer}>
        <DualOptionButton
          onPressBack={handlePressBack}
          onPressContinue={handlePressContinue}
        />
      </View>
    </SafeAreaView>
  );
};

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

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 20,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    paddingVertical: 3,
    paddingLeft: 5,
  },

  inputSection: {
    marginVertical: 5,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  absoluteButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  inputHalf: {
    width: "50%",
    marginRight: "10%",
  },

  inputSection: {
    marginVertical: 10,
  },

  inputQuarter: {
    width: "40%",
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

  title: {
    fontSize: 22,
    marginVertical: 15,
    marginBottom: 5,
    fontWeight: "bold",
  },
});

export default phoneAndAddress;
