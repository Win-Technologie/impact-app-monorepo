/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SingleBottomButton from "../../components/SignUp/SingleBottomButton";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import HeaderComponent from "../../components/headerComponent";
import SocialButton from "../../components/socialButtons";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import LoadingModal from "../../components/LoadingModal";
import { useNavigation } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SignUp() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      checkbox: false,
    },
    mode: "onChange",
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [modalVisible, setModalVisible] = React.useState(false);

  // Real-time password validation
  const getPasswordErrors = () => {
    if (!password) return [];
    const errors = [];
    if (password.length < 8) errors.push("au moins 8 caractères");
    if (!/\d/.test(password)) errors.push("un chiffre");
    if (!/[a-z]/.test(password)) errors.push("une minuscule");
    if (!/[A-Z]/.test(password)) errors.push("une majuscule");
    return errors;
  };

  const passwordErrors = getPasswordErrors();
  const passwordsMatch = confirmPassword && password !== confirmPassword;

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      //console.log('onback');
      // Do your stuff here
      // navigation.dispatch(e.data.action);
    });
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const showErrorMessage = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
      return;
    }

    Alert.alert("Erreur", message);
  };

  const onSubmit = (data) => {
    const registerUser = async (data) => {
      try {
        if (!API_URL) {
          setModalVisible(false);
          showErrorMessage("Configuration API manquante (EXPO_PUBLIC_API_URL).");
          return;
        }

        const newUser = {
          email: data.email,
          password: data.password,
        };

        setModalVisible(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(`${API_URL}users/user/register/code`, {
          method: "POST",
          body: JSON.stringify(newUser),
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let responseData = {};
        try {
          responseData = await response.json();
        } catch (parseError) {
          setModalVisible(false);
          showErrorMessage("Réponse serveur invalide.");
          return;
        }

        if (responseData.TA7) {
          await AsyncStorage.setItem("userToken", responseData.TA7);
          setModalVisible(false);
          router.push("/signup/signUpLanding");
        } else if (responseData.msg == "Code envoyé avec succès") {
          setModalVisible(false);
          router.push({
            pathname: "/signup/verifyEmail",
            params: { email: data.email },
          });
        } else {
          setTimeout(() => {
            setModalVisible(false);
            // Check for validation errors first
            if (responseData.errors && Array.isArray(responseData.errors)) {
              showErrorMessage(responseData.errors[0].msg || "Erreur de validation");
            } else if (responseData.msg) {
              showErrorMessage(responseData.msg);
            } else {
              showErrorMessage(t("signUpPage.alreadyuseEmail"));
            }
          }, 1000);
        }
      } catch (error) {
        setModalVisible(false);
        if (error?.name === "AbortError") {
          showErrorMessage("Le serveur met trop de temps à répondre.");
          return;
        }

        showErrorMessage("Impossible de joindre le serveur.");
      }
    };

    registerUser(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        goToSignInPage={() => router.push("signIn")}
        isSignInPage={false}
      />

      <ScrollView>
        <KeyboardAvoidingView enabled={true}>
          <Text style={styles.welcomeText}>
            {t("signUpPage.welcome")} <Text style={styles.appName}>Impact</Text>
            .
          </Text>

          <View style={styles.inputSection}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: t("signUpPage.emailrequired"),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("signUpPage.emailerrormessage"),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("signUpPage.emailplaceholder")}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Le mot de passe est requis",
                  validate: () => passwordErrors.length === 0 || "Mot de passe invalide",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={t("signUpPage.passwordplaceholder")}
                    secureTextEntry={passwordVisible}
                  />
                )}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            {password && passwordErrors.length > 0 && (
              <Text style={styles.errorText}>
                Votre mot de passe doit contenir : {passwordErrors.join(", ")}
              </Text>
            )}
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  validate: (value) =>
                    value === password || t("signUpPage.nomatchpassword"),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={t("signUpPage.confirmpasswordplacehorder")}
                    secureTextEntry={confirmPasswordVisible}
                  />
                )}
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={confirmPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            {passwordsMatch && (
              <Text style={styles.errorText}>
                Les mots de passe ne correspondent pas
              </Text>
            )}
            {errorMessage && (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}
          </View>

          <View style={styles.inputSection}>
            <View style={styles.checkboxContainer}>
              <Controller
                control={control}
                name="checkbox"
                rules={{ required: t("signUpPage.mustacceptterm") }}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    value={value}
                    onValueChange={onChange}
                    style={styles.checkbox}
                  />
                )}
              />
              <Text style={styles.checkboxLabel}>
                {t("signUpPage.iaccept")}{" "}
                <Text style={styles.link} onPress={() => router.push("/terms")}>
                  {t("signUpPage.termofuse")}
                </Text>
              </Text>
            </View>
            {errors.checkbox && (
              <Text style={styles.errorText}>{errors.checkbox.message}</Text>
            )}
          </View>

          {/* Boutons sociaux */}
          <View style={styles.socialButtons}>
            <SocialButton
              source={require("../../assets/facebook.png")}
              text="Facebook"
              onPress={() => console.log("Facebook Sign Up")}
            />
            <SocialButton
              source={require("../../assets/google.png")}
              text="Google"
              onPress={() => console.log("Google Sign Up")}
            />
          </View>
        </KeyboardAvoidingView>
        <LoadingModal
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <SingleBottomButton onPress={handleSubmit(onSubmit)}>
          {" "}
          {t("signUpPage.continue")}
        </SingleBottomButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F1F1F1",
  },

  toggleButtonsContainer: {
    flexDirection: "row",
    marginRight: 20,
  },

  welcomeText: {
    color: "#19363C",
    fontSize: 32,
    fontFamily: "bold",
    //fontWeight: 500,
    marginTop: 25,
    marginBottom: 30,
  },

  input: {
    width: "100%",
    height: 48,
    backgroundColor: "white",
    borderColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    paddingLeft: 22,
  },

  inputContainer: {
    position: "relative",
  },

  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },

  buttonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#19363C",
  },

  errorText: {
    color: "red",
    fontSize: 12,
    paddingVertical: 3,
    paddingLeft: 2,
  },

  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 70,
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  checkbox: {
    marginRight: 8,
    // marginBottom:118,
    backgroundColor: "white",
    borderColor: "#19363C",
    marginTop: -15,
  },

  checkboxLabel: {
    fontSize: 13,
    color: "#19363C",
    marginTop: -12,
  },

  link: {
    color: "blue",
    textDecorationLine: "underline",
  },

  textInput: {
    marginRight: 10,
  },

  appName: {
    color: "#CF8C58",
  },

  inputSection: {
    marginVertical: 15,
  },
});
