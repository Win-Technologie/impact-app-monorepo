import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticateUser } from "../api/users/userApi";
import SingleBottomButton from "../../components/SignUp/SingleBottomButton";
import HeaderComponent from "../../components/headerComponent";
import { useTranslation } from "react-i18next";
import LoadingModal from "../../components/LoadingModal";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from "expo-router";
import { signInWithGoogle } from "../../utils/googleAuth";

export default function SignIn() {
  const [isPasswordShown, setPasswordShown] = useState(false);
  const [isSignInPage, setIsSignInPage] = useState(true);
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = React.useState(false);
  const navigation = useNavigation();
  const endPoint = "users/user/login";
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const HOST_URL = API_URL.replace("api/", "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const showToastErrorToast = () => {
    ToastAndroid.showWithGravityAndOffset(
      t("signInPage.invalidemailorpassword"),
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      //console.log('onback');
      // Do your stuff here
      // navigation.dispatch(e.data.action);
    });
  }, []);

  const onSubmit = async (data) => {
    const { email, password } = data;
    setModalVisible(true);
    const response = await authenticateUser({ email, password }, endPoint);

    if (response.data && response.status === 200) {
      setTimeout(() => {
        setModalVisible(false);
      }, 1000);

      try {
        await AsyncStorage.setItem("userToken", response.data.A7);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.user.user.profileImagePath) {
          const selfieUrl = `${HOST_URL}Backend/${response.data.user.user.profileImagePath}`;
          const payload = JSON.stringify({ url: selfieUrl, ts: Date.now() });
          await AsyncStorage.setItem("selfie", payload);
        }

        if (response.data.A7) {
          router.push("/(tabs)");
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du token :", error);
      }
    } else {
      if (response.status == 403) {
        router.push("/signup/signUpLanding");
      } else {
        console.log("Erreur d'authentification");
        setTimeout(() => {
          setModalVisible(false);
          showToastErrorToast();
        }, 1000);
      }

      setModalVisible(false);
    }
  };

  const goToSignInPage = () => {
    setIsSignInPage(false);
    router.push("/signIn");
  };

  const goToSignUpPage = () => {
    setIsSignInPage(true);
    router.push("signup");
  };

  const goToForgottenPasswordPage = () => {
    router.push("signup/forgottenPassword");
  };

  React.useEffect(() => {
    register("email", {
      required: "L'adresse email est obligatoire",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        message: "L'adresse email doit etre de type **@**.*",
      },
    });

    register("password", { required: "Le mot de passe est obligatoire" });
  }, [register]);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        goToSignUpPage={() => router.push("signup")}
        isSignInPage={true}
      />

      <ScrollView>
        <KeyboardAvoidingView enabled={true}>
          <Text style={styles.welcomeText}>
            {t("signInPage.welcome")} <Text style={styles.appName}>Impact</Text>
            .
          </Text>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder={t("signInPage.emailplaceholder")}
              keyboardType="email-address"
              onChangeText={(text) =>
                setValue("email", text, { shouldValidate: true })
              }
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("signInPage.passwordplaceholder")}
                secureTextEntry={!isPasswordShown}
                onChangeText={(text) =>
                  setValue("password", text, { shouldValidate: true })
                }
              />
              <TouchableOpacity
                onPress={() => setPasswordShown(!isPasswordShown)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={isPasswordShown ? "eye-off" : "eye"}
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={goToForgottenPasswordPage}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              {t("signInPage.passwordforget")}
            </Text>
          </TouchableOpacity>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require("../../assets/facebook.png")}
                style={styles.socialIcon}
              />
              <Text>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={signInWithGoogle}>
              <Image
                source={require("../../assets/google.png")}
                style={styles.socialIcon}
              />
              <Text>Google</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <SingleBottomButton onPress={handleSubmit(onSubmit)}>
          {t("signInPage.signin")}
        </SingleBottomButton>
      </View>
      <LoadingModal
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
      />
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
    marginVertical: 10,
  },

  welcomeText: {
    color: "#19363C",
    fontSize: 32,
    fontFamily: "bold",
    // fontWeight: 500,
    marginTop: 25,
    marginBottom: 30,
  },

  appName: {
    color: "#CF8C58",
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

  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 20,
  },

  forgotPasswordText: {
    fontSize: 13,
    color: "#19363C",
    textDecorationLine: "underline",
  },

  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  socialButton: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    height: 52,
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    borderRadius: 5,
    marginRight: 4,
    backgroundColor: "white",
    marginTop: 70,
  },

  socialIcon: {
    height: 36,
    width: 36,
    marginRight: 8,
  },

  buttonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#19363C",
  },

  label: {
    marginBottom: 5,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    paddingVertical: 3,
    paddingLeft: 2,
  },

  inputSection: {
    marginVertical: 15,
  },
});
