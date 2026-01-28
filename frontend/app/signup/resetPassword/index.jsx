import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useForm, Controller } from "react-hook-form";
import * as SecureStore from 'expo-secure-store';
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PasswordResetVerification() {
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] =
    useState(true);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const newPassword = watch("newPassword");
  const [email, setEmail] = useState('');
  const {t}= useTranslation();

  useEffect(() => {
    async function loadEmail() {
      const storedEmail = await SecureStore.getItemAsync('userEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }

    loadEmail();
  }, []);

  const onSubmit = async (data) => {
    // Vérifier si les mots de passe correspondent
    if (data.newPassword !== data.confirmNewPassword) {
      Alert.alert(t('passwordResetVerification.passwordsDontMatchError'));
      return;
    }
  
    try {
      // Envoi de la demande de réinitialisation du mot de passe
      const response = await fetch(`${API_URL}users/user/password/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email, // Assurez-vous que l'email est récupéré correctement et inclus ici
          verificationCode: data.verificationCode,
          newPassword: data.newPassword,
        }),
      });
      
      const responseData = await response.json();
      console.log("Verification Code:", data.verificationCode);
      console.log("Response Data:", responseData);
  
      if (response.ok) {
        Alert.alert(
          t('passwordResetVerification.passwordResetSuccess'),
          [
            { text: "OK", onPress: () => router.push('signIn') }
          ]
        );
      } else {
        throw new Error(responseData.message || t('passwordResetVerification.passwordResetError'));
      }
    } catch (error) {
      Alert.alert(t('passwordResetVerification.passwordResetError'), error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{t('passwordResetVerification.header')}</Text>

      <Controller
        control={control}
        name='verificationCode'
        rules={{ required: t('passwordResetVerification.verificationCodeRequired') }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={t('passwordResetVerification.verificationCodePlaceholder')}
          />
        )}
      />
      {errors.verificationCode && (
        <Text style={styles.errorText}>{errors.verificationCode.message}</Text>
      )}

      <Controller
        control={control}
        rules={{ required: t('passwordResetVerification.newPasswordRequired') }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={t('passwordResetVerification.newPasswordPlaceholder')}
              secureTextEntry={passwordVisibility}
            />
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setPasswordVisibility(!passwordVisibility)}
            >
              <Ionicons
                name={passwordVisibility ? "eye-off" : "eye"}
                size={24}
                color='black'
              />
            </TouchableOpacity>
          </View>
        )}
        name='newPassword'
      />
      {errors.newPassword && (
        <Text style={styles.errorText}>{errors.newPassword.message}</Text>
      )}

      <Controller
        control={control}
        rules={{
          validate: (value) =>
            value === newPassword || t('passwordResetVerification.passwordMismatch'),
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={t('passwordResetVerification.confirmNewPasswordPlaceholder')}
              secureTextEntry={confirmPasswordVisibility}
            />
            <TouchableOpacity
              style={styles.icon}
              onPress={() =>
                setConfirmPasswordVisibility(!confirmPasswordVisibility)
              }
            >
              <Ionicons
                name={confirmPasswordVisibility ? "eye-off" : "eye"}
                size={24}
                color='black'
              />
            </TouchableOpacity>
          </View>
        )}
        name='confirmNewPassword'
      />
      {errors.confirmNewPassword && (
        <Text style={styles.errorText}>
          {errors.confirmNewPassword.message}
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>{t('passwordResetVerification.confirmButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    backgroundColor: "#F1F1F1",
  },
  headerText: {
    fontSize: 22,
    //fontWeight: "bold",
    marginBottom: "40%",
    marginTop: 45,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  icon: {
    position: "absolute",
    right: 10,
    bottom: 25,
  },
  button: {
    backgroundColor: "#1B6878",
    padding: 10,
    borderRadius: 5,
    position: "absolute",
    right: 20,
    left: 20,
    bottom: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});
