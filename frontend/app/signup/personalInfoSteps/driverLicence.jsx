import {
  StyleSheet,
  Text,
  View,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import UploadButton from "../../../components/Utils/Buttons/UploadButton";
import Stepper from "../../../components/SignUp/stepper";
import { useRecoilState } from "recoil";
import { userDetailsState } from "../../../GlobalState/userDetailState";
import Checkbox from "expo-checkbox";
import jwtDecode from "jwt-decode";
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { Controller, useForm } from "react-hook-form";
import { DatePickerInput } from "react-native-paper-dates";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { randomDriverLicense } from "../../../utils/testData";

export default function Insurance() {
  // console.log(userDetails);

  const [userDetails, setUserDetails] = useRecoilState(userDetailsState);
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const [differentAddress, setDifferentAddress] = useState(false);
  const [currentStep, setCurrentStep] = useState(4);
  const totalSteps = 4;
  const [inputDateDe, setInputDateDe] = React.useState(undefined);
  const [inputDateEx, setInputDateEx] = React.useState(undefined);
  const { t } = useTranslation();
  const today = new Date();

  const handleInputChange = (field, value) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePressBack = () => {
    setCurrentStep(currentStep - 1);
    //router.push("./phoneAndAdress");
    router.back();
  };

  const formatDate = (val) => {
    if (Number(val) > 9) {
      return val;
    } else {
      return "0" + val;
    }
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      licenseExpiration: null, // userDetails.licenseExpiration,
      licenseDelivery: null, //userDetails.licenseDelivery,
      licenseMention: userDetails.licenseMention,
      licenseNumber: userDetails.licenseNumber,
      licenseCategory: userDetails.licenseNumber,
    },
    mode: "onChange",
  });

  const lauchrequest = async (overrides = {}) => {
    const nextUserDetails = { ...userDetails, ...overrides };

    try {
      const token = await AsyncStorage.getItem("userToken");
      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      if (!token) {
        console.error("No token found for saving personal info");
        Alert.alert("Erreur", "Session expirée. Veuillez vous reconnecter.");
        return;
      }

      // 1. PATCH user personal info to backend
      const userDetailsPayload = {
        name: nextUserDetails.name,
        lastName: nextUserDetails.lastName,
        phone: nextUserDetails.phone,
        address: nextUserDetails.address,
        postalCode: nextUserDetails.postalCode,
        city: nextUserDetails.city,
        province: nextUserDetails.province,
        country: nextUserDetails.country,
        gender: nextUserDetails.gender,
        birthdate: nextUserDetails.birthDay,
        typeAccount: "free",
      };

      console.log("[driverLicence] PATCH user payload:", userDetailsPayload);

      const userResponse = await fetch(`${API_URL}users/user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userDetailsPayload),
      });

      if (!userResponse.ok) {
        const errText = await userResponse.text();
        console.error("[driverLicence] Failed to PATCH user:", errText);
      } else {
        console.log("[driverLicence] User details saved to backend");
      }

      // 2. POST driver license info to backend
      const licenseDetailsPayload = {
        number: nextUserDetails.licenseNumber,
        birthdate: nextUserDetails.birthDay,
        address: differentAddress ? nextUserDetails.alternateAddress : nextUserDetails.address,
        country: differentAddress ? nextUserDetails.alternateCountry : nextUserDetails.country,
        province: differentAddress ? nextUserDetails.alternateProvince : nextUserDetails.province,
        postalCode: differentAddress ? nextUserDetails.alternatePostalCode : nextUserDetails.postalCode,
        licenseClass: nextUserDetails.licenseCategory,
        expires: nextUserDetails.licenseExpiration,
        mention: nextUserDetails.licenseMention,
        sex: nextUserDetails.gender,
        city: differentAddress ? nextUserDetails.alternateCity : nextUserDetails.city,
      };

      console.log("[driverLicence] POST license payload:", licenseDetailsPayload);

      const licenseResponse = await fetch(`${API_URL}dl/user/license`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(licenseDetailsPayload),
      });

      if (!licenseResponse.ok) {
        const errText = await licenseResponse.text();
        console.error("[driverLicence] Failed to POST license:", errText);
      } else {
        console.log("[driverLicence] License details saved to backend");
      }

      // 3. Also update AsyncStorage for immediate UI display
      await AsyncStorage.setItem(
        "signupUserDetailsDraft",
        JSON.stringify(nextUserDetails),
      );

      const storedUserRaw = await AsyncStorage.getItem("user");

      if (storedUserRaw) {
        const storedUserData = JSON.parse(storedUserRaw);
        const userNode = storedUserData?.user ?? storedUserData;

        if (userNode && typeof userNode === "object") {
          const updatedUserNode = {
            ...userNode,
            name: nextUserDetails.name || userNode.name,
            lastName: nextUserDetails.lastName || userNode.lastName,
            phone: nextUserDetails.phone || userNode.phone,
            address: nextUserDetails.address || userNode.address,
            postalCode: nextUserDetails.postalCode || userNode.postalCode,
            city: nextUserDetails.city || userNode.city,
            province: nextUserDetails.province || userNode.province,
            country: nextUserDetails.country || userNode.country,
            gender: nextUserDetails.gender || userNode.gender,
            birthdate: nextUserDetails.birthDay || userNode.birthdate,
          };

          const updatedStoredUser = storedUserData?.user
            ? { ...storedUserData, user: updatedUserNode }
            : updatedUserNode;

          await AsyncStorage.setItem("user", JSON.stringify(updatedStoredUser));
        }
      }

      setUserDetails(nextUserDetails);

      const array = progressData.map((item) => {
        if (item.id == 0) {
          return {
            id: 0,
            title: "Information personnelles",
            subtitle: "4 minutes",
            completion: 1,
            actualstep: 4,
            nbstep: 4,
          };
        } else {
          return item;
        }
      });

      setProgressData(array);

      router.push("/signup/signUpLanding");
    } catch (error) {
      console.error("Error saving personal information:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'enregistrement des données. Veuillez réessayer.",
      );
    }
  };

  const handlePressContinue = handleSubmit((data) => {
    let datExp =
      data.dateEx.getFullYear() +
      "-" +
      formatDate(data.dateEx.getMonth() + 1) +
      "-" +
      formatDate(data.dateEx.getDate());
    let datDe =
      data.dateDe.getFullYear() +
      "-" +
      formatDate(data.dateDe.getMonth() + 1) +
      "-" +
      formatDate(data.dateDe.getDate());
    setUserDetails((prev) => ({ ...prev, licenseExpiration: datExp, licenseDelivery: datDe }));
    lauchrequest({ licenseExpiration: datExp, licenseDelivery: datDe });
  });

  // try {
  //     const decoded = jwtDecode(token);
  //     console.log(decoded); // Assurez-vous que le token est correct et peut être décodé
  // } catch (error) {
  //     console.error("Failed to decode token:", error);
  // }

  /*
    const {
      name,
      lastName,
      gender,
      phone,
      address,
      city,
      postalCode,
      country,
      birthDay,
      province,
      licenseNumber,
      licenseCategory,
      licenseExpiration,
      licenseMention,
      alternateAddress,
      alternateCity,
      alternatePostalCode,
      alternateCountry,
      alternateProvince,
      typeAccount
    } = userDetails;

    const userDetailsPayload = {
      name,
      lastName,
      phone,
      address,
      postalCode,
      city,
      province,
      country,
      gender,
      typeAccount:'free',
    };

    const licenseDetailsPayload = {
      number:licenseNumber,
      birthdate:birthDay,
      address: differentAddress ? alternateAddress : address,
      country: differentAddress? alternateCountry : country,
      province:differentAddress? alternateProvince : province,
      postalCode: differentAddress ? alternatePostalCode : postalCode,
      licenseClass:licenseCategory,
      expires:licenseExpiration,
      mention:licenseMention,
      sex:gender,
      city: differentAddress ? alternateCity : city,
    };
 
    const userDetailsUrl = `${API_URL}users/user/`;
    const licenseDetailsUrl = `${API_URL}users/user/license`;

    console.log(userDetailsPayload)
    console.log(licenseDetailsPayload)


    try {
      // Send user details
      const userResponse = await fetch(userDetailsUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userDetailsPayload)
      });
 
      if (!userResponse.ok) {
        console.error("Failed to submit user details", await userResponse.text());
        throw new Error('Failed to submit user details');
      }
 
      const userData = await userResponse.json();
      console.log('User data submission successful:', userData);
 
      // Send license details
      const licenseResponse = await fetch(licenseDetailsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(licenseDetailsPayload)
      });
 
      if (!licenseResponse.ok) {
        console.error("Failed to submit license details", await licenseResponse.text());
        throw new Error('Failed to submit license details');
      }
 
      const licenseData = await licenseResponse.json();
      console.log('License data submission successful:', licenseData);
 
      // Navigate to next screen on successful submission
      router.push("/signup/signUpLanding");
    } catch (error) {
      console.error('Error submitting data:', error);
      // Handle errors, possibly with alert messages
    }*/

  // };

  return (
    <SafeAreaView style={styles.container}>
      <Stepper currentStep={4} totalSteps={totalSteps} displayStep={4} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps='handled'
        style={styles.content}
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity
            onPress={() => {
              const d = randomDriverLicense();
              setValue("licenseNumber", d.licenseNumber, { shouldValidate: true });
              setValue("dateDe", d.issueDate, { shouldValidate: true });
              setValue("dateEx", d.expiryDate, { shouldValidate: true });
              setValue("category", d.category, { shouldValidate: true });
              setValue("mention", d.mention, { shouldValidate: true });
              setInputDateDe(d.issueDate);
              setInputDateEx(d.expiryDate);
              setUserDetails((prev) => ({ ...prev, licenseNumber: d.licenseNumber, licenseCategory: d.category, licenseMention: d.mention }));
            }}
            style={{ backgroundColor: "#f0ad4e", padding: 8, borderRadius: 5, marginBottom: 10, alignSelf: "flex-start" }}
          >
            <Text style={{ fontSize: 12, color: "#333" }}>🧪 Fill test data</Text>
          </TouchableOpacity>
          <Text style={styles.titleText}>{t("insuranceScreen.pageTitle")}</Text>

          <View style={styles.inputSection}>
            <Controller
              control={control}
              name="licenseNumber"
              rules={{ required: t("insuranceScreen.licenseNumberRequired") }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textInput}
                  placeholder={t("insuranceScreen.licenseNumberPlaceholder")}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    setUserDetails({ ...userDetails, licenseNumber: text });
                  }}
                  value={value}
                />
              )}
            />
            {errors.licenseNumber && (
              <Text style={styles.errorText}>
                {errors.licenseNumber.message}
              </Text>
            )}
          </View>

          <View style={styles.inputSection}>
            <Controller
              control={control}
              name="dateDe"
              rules={{
                required: t("licenseDetails.issueDateRequired"),
                minLength: {
                  value: 10,
                  message: t("licenseDetails.invalidFormat"),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <DatePickerInput
                  label={t("licenseDetails.issueDateLabel")}
                  locale="en"
                  underlineColor="transparent"
                  mode="outlined"
                  activeOutlineColor="gray"
                  style={styles.inputDate}
                  keyboardType="default"
                  validRange={{ endDate: today }}
                  onChangeText={(text) => {
                    onChange(text);
                  }}
                  onChange={(d) => {
                    if (!d) {
                      return;
                    }

                    onChange(d);
                    setInputDateDe(d);
                    Keyboard.dismiss();
                  }}
                  onFocus={() => Keyboard.dismiss()}
                  inputMode="start"
                  value={inputDateDe}
                />
              )}
            />
            {errors.dateDe && (
              <Text style={styles.errorText}>{errors.dateDe.message}</Text>
            )}
          </View>

          <View style={styles.inputSection}>
            <Controller
              control={control}
              name="dateEx"
              rules={{
                required: t("licenseDetails.expiryDateRequired"),
                minLength: {
                  value: 10,
                  message: t("licenseDetails.invalidFormat"),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <DatePickerInput
                  label={t("licenseDetails.expiryDateLabel")}
                  locale="en"
                  underlineColor="transparent"
                  mode="outlined"
                  activeOutlineColor="gray"
                  style={styles.inputDate}
                  keyboardType="default"
                  validRange={{ startDate: inputDateDe || today }}
                  onChangeText={(text) => {
                    onChange(text);
                  }}
                  onChange={(d) => {
                    if (!d) {
                      return;
                    }

                    onChange(d);
                    setInputDateEx(d);
                    Keyboard.dismiss();
                  }}
                  onFocus={() => Keyboard.dismiss()}
                  inputMode="start"
                  value={inputDateEx}
                />
              )}
            />
            {errors.dateEx && (
              <Text style={styles.errorText}>{errors.dateEx.message}</Text>
            )}
          </View>

          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <View style={styles.inputSection}>
                <Controller
                  control={control}
                  name="category"
                  rules={{
                    required: t("licenseDetails.licenseCategoryRequired"),
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder={t(
                        "licenseDetails.licenseCategoryPlaceholder",
                      )}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        setUserDetails({
                          ...userDetails,
                          licenseCategory: text,
                        });
                      }}
                      value={value}
                    />
                  )}
                />
                {errors.category && (
                  <Text style={styles.errorText}>
                    {errors.category.message}
                  </Text>
                )}
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.inputSection}>
                <Controller
                  control={control}
                  name="mention"
                  rules={{
                    required: t("licenseDetails.licenseMentionRequired"),
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.textInput, { marginLeft: 5 }]}
                      placeholder={t(
                        "licenseDetails.licenseMentionPlaceholder",
                      )}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        setUserDetails({
                          ...userDetails,
                          licenseMention: text,
                        });
                      }}
                      value={value}
                    />
                  )}
                />
                {errors.mention && (
                  <Text style={styles.errorText}>{errors.mention.message}</Text>
                )}
              </View>
            </View>
          </View>

          {/*<View style={styles.checkboxContainer}>
                        <Checkbox
                            value={differentAddress}
                            onValueChange={setDifferentAddress}
                            style={styles.checkbox}
                        />
                        <Text style={styles.label}>Utiliser une adresse différente?</Text>
                    </View>*/}

          {differentAddress && (
            <>
              <TextInput
                style={styles.input2}
                placeholder={t("licenseDetails.addressPlaceholder")}
                value={userDetails.alternateAddress}
                onChangeText={(text) =>
                  handleInputChange("alternateAddress", text)
                }
              />

              <TextInput
                style={styles.input2}
                placeholder={t("licenseDetails.cityPlaceholder")}
                value={userDetails.alternateCity}
                onChangeText={(text) =>
                  handleInputChange("alternateCity", text)
                }
              />

              <TextInput
                style={styles.input2}
                placeholder={t("licenseDetails.postalCodePlaceholder")}
                value={userDetails.alternatePostalCode}
                onChangeText={(text) =>
                  handleInputChange("alternatePostalCode", text)
                }
              />

              <TextInput
                style={[styles.input, styles.input2]}
                placeholder={t("licenseDetails.countryPlaceholder")}
                value={userDetails.alternateCountry}
                onChangeText={(text) =>
                  handleInputChange("alternateCountry", text)
                }
              />

              <TextInput
                style={[styles.input, styles.input2]}
                placeholder={t("licenseDetails.provincePlaceholder")}
                value={userDetails.alternateProvince}
                onChangeText={(text) =>
                  handleInputChange("alternateProvince", text)
                }
              />
            </>
          )}

          {/*<View style={{  }}>
                        <UploadButton text='de votre permis de conduire' />
                    </View>*/}
        </View>
      </ScrollView>

      <View style={styles.absoluteButtonContainer}>
        <DualOptionButton
          onPressBack={handlePressBack}
          onPressContinue={handlePressContinue}
          continueLabel="Compléter"
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

  scrollviewContainer: {},

  safeAreaContainer: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
  },

  titleText: {
    fontSize: 23,
    // marginHorizontal: 20,
    marginVertical: 10,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#19363C",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    height: 60,
  },

  inputDate: {
    backgroundColor: "#fff",
    height: 51,
    fontSize: 16,
  },

  inputHalf: {
    width: "60%",
    marginRight: "5%",
  },

  inputQuarter: {
    width: "35%",
    marginRight: "5%",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 10,
  },

  stepper: {
    marginHorizontal: 20,
  },

  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },

  checkbox: {
    marginRight: 8,
  },

  input2: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 50,
    marginLeft: "5%",
    marginRight: "5%",
  },

  inputSection: {
    marginVertical: 15,
  },

  absoluteButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    paddingLeft: 5,
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
});
