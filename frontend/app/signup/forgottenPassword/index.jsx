import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";

import { useForm, Controller } from "react-hook-form";
//const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgottenPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  async function saveEmail(email) {
    await SecureStore.setItemAsync("userEmail", email);
  }

  const { t } = useTranslation();

  const onSubmit = async (data) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    try {
      const response = await fetch(`${API_URL}users/user/password/code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });
      console.log(data.email);
      const responseData = await response.json();
      console.log("Code de vérification reçu:", responseData.code);

      if (response.ok) {
        alert(
          t("forgottenPasswordScreen.checkYourEmail"),
          t("forgottenPasswordScreen.emailSuccessMessage"),
        );
        await saveEmail(data.email);
        router.push("signup/resetPassword");
      } else {
        alert(
          "Erreur",
          responseData.message ||
            t("forgottenPasswordScreen.emailErrorMessage"),
        );
        throw new Error(
          responseData.message ||
            t("forgottenPasswordScreen.genericErrorMessage"),
        );
      }
    } catch (error) {
      alert("Erreur", error.toString());
    }
  };
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("signIn")}
        >
          <Ionicons name="arrow-back" size={18} color="#19363C" />
          <Text style={styles.backButtonText}>
            {t("forgottenPasswordScreen.back")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>
          {t("forgottenPasswordScreen.header")}
        </Text>
        <Text style={styles.infoText}>
          {t("forgottenPasswordScreen.instruction")}
        </Text>

        <Controller
          control={control}
          name="email"
          rules={{
            required: t("forgottenPasswordScreen.emailRequired"),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t("forgottenPasswordScreen.emailFormatError"),
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInput}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Adresse courriel"
              placeholderTextColor="grey"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.continueButtonText}>
            {t("forgottenPasswordScreen.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#F1F1F1",
  },
  container: {
    flex: 1,
    marginHorizontal: 23,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 35,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#19363C",
  },
  headerText: {
    color: "#19363C",
    fontSize: 22,
    fontFamily: "bold",
    //fontWeight: 500,
    marginTop: 25,
    marginBottom: 15,
  },
  infoText: {
    color: "#19363C",
    fontSize: 14,
    fontFamily: "regular",
    marginBottom: 30,
  },
  textInput: {
    width: "100%",
    height: 48,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
    paddingLeft: 22,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: "#1B6878",
    borderRadius: 5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    shadowOffset: { height: 4, width: 4 },
    shadowColor: "grey",
    shadowOpacity: 1,
    height: "8%",
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
  },
});
