/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ToastAndroid,
} from "react-native";
import SingleBottomButton from "../../../components/SignUp/SingleBottomButton";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import HeaderComponent from "../../../components/headerComponent";
import SocialButton from "../../../components/socialButtons";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import LoadingModal from "../../../components/LoadingModal";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AntDesign } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function VerifyEmail() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { email = "onanajunior92@gmail.com" } = params;

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: {
      code: "",
    },
    mode: "onChange",
  });

  const password = watch("password");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [modalVisible, setModalVisible] = React.useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const showToastErrorToast = () => {
    ToastAndroid.showWithGravityAndOffset(
      "Code de validation  non valide ou expir�",
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  const onSubmit = (data) => {
    console.log(data);

    const registerUser = async (data) => {
      try {
        const newUser = {
          email: email,
          verificationCode: data.code,
        };

        setModalVisible(true);

        const response = await fetch(`${API_URL}users/user/register/verify`, {
          method: "POST",
          body: JSON.stringify(newUser),
          headers: { "Content-Type": "application/json" },
        });

        const responseData = await response.json();

        setModalVisible(false);

        if (!responseData.TA7) {
          setErrorMessage(responseData.msg);
        }

        if (responseData.TA7) {
          await AsyncStorage.setItem("userToken", responseData.TA7);
          setTimeout(() => {
            setModalVisible(false);
            router.push("/signup/signUpLanding");
          }, 500);
        } else {
          setErrorMessage(responseData.msg);
          setTimeout(() => {
            setModalVisible(false);
            showToastErrorToast();
          }, 500);
        }
      } catch (error) {
        setModalVisible(true);
        // alert();
        console.log(error);
      }
    };

    registerUser(data);
  };

  const resendCode = async () => {
    alert();

    try {
      const data = {
        email: email,
      };

      setModalVisible(true);

      const response = await fetch(`${API_URL}users/code/resend`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      const responseData = await response.json();
      console.log(responseData);
      setModalVisible(false);
    } catch (error) {
      setModalVisible(true);
      // alert();
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={{ flexDirection: "row", marginTop: 30 }}
        onPress={() => {
          router.back();
        }}
      >
        <AntDesign
          name="arrowleft"
          size={20}
          color="#19363C"
          style={{ fontWeight: "200" }}
        />
        <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
      </TouchableOpacity>

      <ScrollView>
        <KeyboardAvoidingView enabled={true}>
          <Text style={styles.welcomeText}>
            {t("verified.verifyyouremail")}
          </Text>

          <Text>{t("verified.validationmessage")}.</Text>

          <View style={styles.inputSection}>
            <Controller
              control={control}
              name="code"
              rules={{
                required: t("verified.coderequired"),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("verified.validationcode")}
                />
              )}
            />
            {errors.code && (
              <Text style={styles.errorText}>{errors.code.message}</Text>
            )}
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
            onPress={resendCode}
          >
            <Text style={styles.othercode}>
              {t("verified.resendanewvalidationcode")}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 23,
    paddingTop: 10,
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

  othercode: {
    fontSize: 13,
    color: "#19363C",
    textDecorationLine: "underline",
  },
});
