import React, { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import Stepper from "../../../components/SignUp/stepper";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import { useRecoilState } from "recoil";
import { vehicleDetailsState } from "../../../GlobalState/vehiculeState";
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { useTranslation } from "react-i18next";
import { DatePickerInput } from "react-native-paper-dates";

import { SafeAreaView } from "react-native-safe-area-context";

function LicencePlate() {

  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const [vehicleDetails, setVehicleDetails] = useRecoilState(vehicleDetailsState);
  // KeyboardAvoidingView will handle keyboard avoidance
  const totalSteps = 3;
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      plaque: vehicleDetails.vehiclePlateNumber,
      certificat: vehicleDetails.vehicleNumeroCertificat,
      numeroDossier: vehicleDetails.vehicleDossierNumber,
      masseNette: vehicleDetails.vehicleNetWeight,
      cylindre: vehicleDetails.vehicleCylinder,
      dateDelivrance: vehicleDetails.vehicleCerticateDeliveryDate,
      dateExpiration: vehicleDetails.vehicleCerticateExpirationDate,
      categorieUsage: vehicleDetails.vehiclecategorieUsage,
      numeroEssieux: vehicleDetails.vehicleEssieux,
    },
  });

  const handlePressBack = () => {
    // Always decrement actualstep (min 0)
    const array = progressData.map((item) => {
      if (item.id === 1) {
        return {
          ...item,
          actualstep: Math.max(0, item.actualstep - 1),
        };
      } else {
        return item;
      }
    });
    setProgressData(array);
    router.back();
  };

  const handlePressContinue = handleSubmit((data) => {
    // Always increment actualstep (max 2)
    const array = progressData.map((item) => {
      if (item.id === 1) {
        return {
          ...item,
          actualstep: Math.min(2, item.actualstep + 1),
        };
      } else {
        return item;
      }
    });
    setProgressData(array);
    router.push("/signup/vehiculesSteps/ownerPage");
  });

  const handleInputChange = (field, value) => {
    setVehicleDetails((prev) => ({ ...prev, [field]: value }));
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
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>
            {t("vehicleRegistration.plateNumberTitle")}
          </Text>
          <View style={styles.inputSection}>
            <Controller
            control={control}
            name="plaque"
            rules={{
              required: t("vehicleRegistration.plateNumberRequired"),
              maxLength: {
                value: 7,
                message: t("vehicleRegistration.plateNumberMaxLength"),
              },
              minLength: {
                value: 7,
                message: t("vehicleRegistration.plateNumberExactLength"),
              },
              validate: (value) =>
                value.length === 7 ||
                t("vehicleRegistration.plateNumberExactLength"),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={styles.dualtextInput}>
                  <TextInput
                    placeholder={t(
                      "vehicleRegistration.plateNumberPlaceholder",
                    )}
                    style={[styles.textInputOfDual]}
                    onBlur={onBlur}
                    value={value} // Utiliser 'value' du contrôleur ici
                    onChangeText={(text) => {
                      if (text.length <= 7) {
                        handleInputChange("vehiclePlateNumber", text);
                        onChange(text); // Mettre à jour la valeur dans 'react-hook-form'
                      }
                    }}
                  />
                  <Text style={{ padding: 10 }}>{`${value?.length}/7`}</Text>
                </View>
              </View>
            )}
          />

          {errors.plaque && (
            <Text style={styles.errorText}>{errors.plaque.message}</Text>
          )}
        </View>

        <Text style={styles.title}>
          {t("vehicleRegistration.certificateInfoTitle")}
        </Text>

        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="certificat"
            rules={{
              required: t("vehicleRegistration.certificateRequired"),
              maxLength: {
                value: 13,
                message: t("vehicleRegistration.certificateMaxLength"),
              },
              minLength: {
                value: 13,
                message: t("vehicleRegistration.certificateExactLength"),
              },
              validate: (value) =>
                value.length === 13 ||
                t("vehicleRegistration.certificateExactLength"),
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={styles.dualtextInput}>
                  <TextInput
                    placeholder={t(
                      "vehicleRegistration.certificatePlaceholder",
                    )}
                    style={[styles.textInputOfDual]}
                    onBlur={onBlur}
                    value={value} // Utiliser 'value' du contrôleur ici
                    onChangeText={(text) => {
                      if (text.length <= 13) {
                        handleInputChange("vehicleNumeroCertificat", text);
                        onChange(text); // Mettre à jour la valeur dans 'react-hook-form'
                      }
                    }}
                  />
                  <Text style={{ padding: 10 }}>{`${value?.length}/13`}</Text>
                </View>
              </View>
            )}
          />
          {errors.certificat && (
            <Text style={styles.errorText}>{errors.certificat.message}</Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="numeroDossier"
            rules={{
              required: t("vehicleRegistration.dossierNumberRequired"),
              maxLength: {
                value: 20,
                message: t("vehicleRegistration.dossierNumberMaxLength"),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  placeholder={t(
                    "vehicleRegistration.dossierNumberPlaceholder",
                  )}
                  style={styles.textInput}
                  onBlur={onBlur}
                  value={value}
                  onChangeText={(text) => {
                    handleInputChange("vehicleDossierNumber", text);
                    onChange(text);
                  }}
                />
              </>
            )}
          />
          {errors.numeroDossier && (
            <Text style={styles.errorText}>{errors.numeroDossier.message}</Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.inputSection}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="dateDelivrance"
                  rules={{
                    required: t("vehicleRegistration.deliveryDateRequired"),
                  }}
                  render={({ field: { onChange, value } }) => (
                    <DatePickerInput
                      locale="en"
                      mode="outlined"
                      label={t("vehicleRegistration.deliveryDatePlaceholder")}
                      style={styles.datePicker}
                      value={value ? new Date(value) : null}
                      onChange={(date) => {
                        onChange(date);
                        handleInputChange(
                          "vehicleCerticateDeliveryDate",
                          date ? date.toISOString().split("T")[0] : null,
                        );
                      }}
                      inputMode="start"
                      maxDate={new Date()}
                    />
                  )}
                />
                {errors.dateDelivrance && (
                  <Text style={styles.errorText}>
                    {errors.dateDelivrance.message}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="dateExpiration"
                rules={{
                  required: t("vehicleRegistration.expirationDateRequired"),
                }}
                render={({ field: { onChange, value } }) => (
                  <DatePickerInput
                    locale="en"
                    mode="outlined"
                    label={t("vehicleRegistration.expirationDatePlaceholder")}
                    style={styles.datePicker}
                    value={value ? new Date(value) : null}
                    onChange={(date) => {
                      onChange(date);
                      handleInputChange(
                        "vehicleCerticateExpirationDate",
                        date.toISOString().split("T")[0],
                      );
                    }}
                    inputMode="start"
                  />
                )}
              />
              {errors.dateExpiration && (
                <Text style={styles.errorText}>
                  {errors.dateExpiration.message}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Controller
                control={control}
                name="masseNette"
                rules={{
                  required: t("vehicleRegistration.netWeightRequired"),
                  pattern: {
                    value: /^[0-9]+$/,
                    message: t("vehicleRegistration.netWeightNumber"),
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      placeholder={t(
                        "vehicleRegistration.netWeightPlaceholder",
                      )}
                      style={styles.textInput}
                      onBlur={onBlur}
                      value={value}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        handleInputChange("vehicleNetWeight", text);
                        onChange(text);
                      }}
                    />
                  </>
                )}
              />
              {errors.masseNette && (
                <Text style={styles.errorText}>
                  {errors.masseNette.message}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="cylindre"
                rules={{
                  required: t("vehicleRegistration.cylinderRequired"),
                  pattern: {
                    value: /^[0-9]+$/,
                    message: t("vehicleRegistration.cylinderNumber"),
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      placeholder={t("vehicleRegistration.cylinderPlaceholder")}
                      style={styles.textInput}
                      onBlur={onBlur}
                      value={value}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        handleInputChange("vehicleCylinder", text);
                        onChange(text);
                      }}
                    />
                    {errors.cylindre && (
                      <Text style={styles.errorText}>
                        {errors.cylindre.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Controller
                control={control}
                name="categorieUsage"
                rules={{
                  required: t("vehicleRegistration.usageCategoryRequired"),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t(
                        "vehicleRegistration.usageCategoryPlaceholder",
                      )}
                      onBlur={onBlur}
                      value={value}
                      onChangeText={(text) => {
                        handleInputChange("vehiclecategorieUsage", text);
                        onChange(text);
                      }}
                    />
                  </>
                )}
              />
              {errors.categorieUsage && (
                <Text style={styles.errorText}>
                  {errors.categorieUsage.message}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="numeroEssieux"
                rules={{
                  required: t("vehicleRegistration.axleNumberRequired"),
                  pattern: {
                    value: /^[0-9]+$/,
                    message: t("vehicleRegistration.axleNumberNumeric"),
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t(
                        "vehicleRegistration.axleNumberPlaceholder",
                      )}
                      onBlur={onBlur}
                      value={value}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        // Only allow numbers
                        const numeric = text.replace(/[^0-9]/g, "");
                        handleInputChange("vehicleEssieux", numeric);
                        onChange(numeric);
                      }}
                    />
                    {errors.numeroEssieux && (
                      <Text style={styles.errorText}>
                        {errors.numeroEssieux.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </View>
        </View>

        {/*<TouchableOpacity onPress={nextPage}>
                    <Text>next</Text>
                </TouchableOpacity>*/}
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

export default LicencePlate;

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

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },

  dualtextInput: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
  },

  textInputOfDual: {
    flex: 1,
    height: 51,
    padding: 10,
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

  counter: {
    position: "absolute",
    right: 15,
    backgroundColor: "transparent",
    padding: 10,
  },

  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 12,
  },

  buttonContainer: {
    backgroundColor: "#FFFFFF",
    Bottom: 0,
    left: 0,
    right: 0,
  },

  stepper: {
    marginHorizontal: 15,
  },

  datePicker: {
    backgroundColor: "white",
  },
});
