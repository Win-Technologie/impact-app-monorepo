import React, { useState, useTransition } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import Stepper from "../../../components/SignUp/stepper";
import { router } from "expo-router";
import { useRecoilState } from "recoil";
import { vehicleDetailsState } from "../../../GlobalState/vehiculeState";
import { userInfoGatherState } from "../../../GlobalState/userDetailState";
import { DatePickerInput } from "react-native-paper-dates";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

function VehicleDetails() {
  // KeyboardAvoidingView will handle keyboard avoidance
  const actuaYear = "2024";
  const [vehicleDetails, setVehicleDetails] = useRecoilState(vehicleDetailsState);
  const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
  const totalSteps = 3;
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      marque: vehicleDetails.vehicleBrand,
      modele: vehicleDetails.vehicleModel,
      annee: vehicleDetails.vehicleYear,
      couleur: vehicleDetails.vehicleColor,
      serialNumber: vehicleDetails.vehicleSerialNumber,
    },
    mode: "onChange",
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

  const handleInputChange = (field, value) => {
    setVehicleDetails((prev) => ({ ...prev, [field]: value }));
  };

  const nextPage = () => {
    router.push("/signup/vehiculesSteps/licensePlate");
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
    router.push("/signup/vehiculesSteps/licensePlate");
  });

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
          <Text style={styles.title}>{t("vehicleDetails.modelTitle")}</Text>
          <View style={styles.inputSection}>
            <Controller
            control={control}
            rules={{ required: t("vehicleDetails.brandRequired") }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={t("vehicleDetails.brandPlaceholder")}
                style={styles.textInput}
                onBlur={onBlur}
                value={value} // Utiliser 'value' du contrôleur ici
                onChangeText={(text) => {
                  handleInputChange("vehicleBrand", text);
                  onChange(text); // Mettre à jour la valeur dans 'react-hook-form'
                }}
              />
            )}
            name="marque"
          />

          {errors.marque && (
            <Text style={styles.errorText}>{errors.marque.message}</Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1.5, marginRight: 10 }}>
              <Controller
                control={control}
                rules={{ required: t("vehicleDetails.modelRequired") }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={t("vehicleDetails.modelPlaceholder")}
                    style={styles.textInput}
                    onBlur={onBlur}
                    value={value} // Utiliser 'value' du contrôleur ici
                    onChangeText={(text) => {
                      handleInputChange("vehicleModel", text);
                      onChange(text); // Mettre à jour la valeur dans 'react-hook-form'
                    }}
                  />
                )}
                name="modele"
              />

              {errors.modele && (
                <Text style={styles.errorText}>{errors.modele.message}</Text>
              )}
            </View>

            <View style={{ flex: 1.5 }}>
              <Controller
                control={control}
                name="annee"
                rules={{
                  required: t("vehicleDetails.yearRequired"),
                  maxLength: {
                    value: 4,
                    message: t("vehicleDetails.yearRequired") + " (4 chiffres)",
                  },
                  minLength: {
                    value: 4,
                    message: t("vehicleDetails.yearRequired") + " (4 chiffres)",
                  },
                  pattern: {
                    value: /^\d{4}$/,
                    message: t("vehicleDetails.yearRequired") + " (4 chiffres)",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={t("vehicleDetails.yearPlaceholder")}
                    style={styles.textInput}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    value={value}
                    maxLength={4}
                    onChangeText={(text) => {
                      // Only allow up to 4 digits
                      const numeric = text.replace(/[^0-9]/g, "").slice(0, 4);
                      handleInputChange("vehicleYear", numeric);
                      onChange(numeric);
                    }}
                  />
                )}
              />

              {errors.annee && (
                <Text style={styles.errorText}>{errors.annee.message}</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.title}>{t("vehicleDetails.colorTitle")}</Text>

        <View style={styles.inputSection}>
          <Controller
            control={control}
            rules={{ required: t("vehicleDetails.colorRequired") }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={t("vehicleDetails.colorPlaceholder")}
                style={[styles.textInput]}
                onBlur={onBlur}
                value={value} // Utiliser 'value' du contrôleur ici
                onChangeText={(text) => {
                  handleInputChange("vehicleColor", text);
                  onChange(text); // Mettre à jour la valeur dans 'react-hook-form'
                }}
              />
            )}
            name="couleur"
          />

          {errors.couleur && (
            <Text style={styles.errorText}>{errors.couleur.message}</Text>
          )}
        </View>

        <Text style={styles.title}>
          {t("vehicleDetails.serialNumberTitle")}
        </Text>

        <View style={styles.inputSection}>
          <Controller
            control={control}
            name="serialNumber"
            rules={{
              required: t("vehicleDetails.serialNumberRequired"),
              minLength: {
                value: 5,
                message:
                  t("vehicleDetails.serialNumberRequired") +
                  " - " +
                  t("vehicleDetails.serialNumberMinLength"),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={t("vehicleDetails.serialNumberPlaceholder")}
                style={[styles.textInput]}
                onBlur={onBlur}
                value={value} // Utiliser 'value' du contrôleur ici
                onChangeText={(text) => {
                  handleInputChange("vehicleSerialNumber", text);
                  onChange(text);
                }}
              />
            )}
          />

          {errors.serialNumber && (
            <Text style={styles.errorText}>{errors.serialNumber.message}</Text>
          )}
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

export default VehicleDetails;

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

  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 12,
  },

  buttonContainer: {
    bottom: 0,
    left: 0,
    right: 0,
    position: "absolute",
  },

  stepper: {
    marginHorizontal: 15,
  },
});
