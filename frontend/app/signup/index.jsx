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
  Modal,
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
import { signInWithGoogle } from "../../utils/googleAuth";

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
  const [termsModalVisible, setTermsModalVisible] = useState(false);

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
                <Text style={styles.link} onPress={() => setTermsModalVisible(true)}>
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
              onPress={signInWithGoogle}
            />
          </View>
        </KeyboardAvoidingView>
        <LoadingModal
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
        />

        <Modal
          visible={termsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setTermsModalVisible(false)}
        >
          <View style={styles.termsOverlay}>
            <View style={styles.termsContainer}>
              <Text style={styles.termsTitle}>Politiques d'utilisation</Text>
              <ScrollView style={styles.termsScroll} showsVerticalScrollIndicator={true}>

                <Text style={styles.termsSectionTitle}>Acceptation des conditions</Text>
                <Text style={styles.termsText}>
                  En accédant à l'application Impact et en l'utilisant, vous reconnaissez avoir lu, compris et accepté d'être lié par cette politique d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
                </Text>

                <Text style={styles.termsSectionTitle}>Nature de l'application (MVP)</Text>
                <Text style={styles.termsText}>
                  L'application Impact est actuellement en phase de Produit Minimum Viable (MVP). Cela signifie qu'elle est en développement actif et peut contenir des bogues, des erreurs ou des fonctionnalités limitées.{"\n\n"}Nous nous efforçons d'améliorer l'application continuellement, mais son utilisation se fait à vos propres risques.
                </Text>

                <Text style={styles.termsSectionTitle}>Utilisation de l'application</Text>
                <Text style={styles.termsText}>
                  <Text style={styles.termsBold}>But de l'application : </Text>Impact est un outil destiné à vous aider à collecter et organiser les informations nécessaires pour une déclaration d'accident. Elle ne constitue en aucun cas un avis juridique et ne remplace pas une déclaration officielle auprès des autorités compétentes (par exemple, votre assureur, la SAAQ au Québec, ou toute autre entité réglementaire).
                </Text>
                <Text style={styles.termsText}>
                  <Text style={styles.termsBold}>Exactitude des informations : </Text>Vous êtes seul responsable de l'exactitude, de l'exhaustivité et de la véracité des informations que vous soumettez via l'application. Toute fausse déclaration ou omission peut entraîner des conséquences juridiques.
                </Text>
                <Text style={styles.termsText}>
                  <Text style={styles.termsBold}>Non-responsabilité pour les déclarations officielles : </Text>L'application Impact ne soumet pas directement de déclarations officielles d'accident aux assureurs ou aux autorités. Il vous incombe de transmettre les informations recueillies via Impact à votre assureur ou aux organismes pertinents, conformément à leurs procédures.
                </Text>
                <Text style={styles.termsText}>
                  <Text style={styles.termsBold}>Conformité légale : </Text>Vous devez utiliser l'application en conformité avec toutes les lois et réglementations applicables dans votre juridiction, y compris celles relatives à la protection de la vie privée et à la déclaration d'accidents.
                </Text>
                <Text style={styles.termsText}>
                  <Text style={styles.termsBold}>Interdiction d'utilisation illégale : </Text>Vous ne pouvez pas utiliser l'application pour toute activité illégale, frauduleuse ou non autorisée.
                </Text>

                <Text style={styles.termsSectionTitle}>Confidentialité et données personnelles</Text>
                <Text style={styles.termsText}>
                  Nous nous engageons à protéger votre vie privée. Les données que vous entrez dans l'application sont traitées conformément à notre Politique de Confidentialité. En utilisant Impact, vous consentez à la collecte, à l'utilisation et au stockage de vos informations tel que décrit dans cette politique. Étant donné la nature sensible des données d'accident, une attention particulière est portée à leur sécurité.
                </Text>

                <Text style={styles.termsSectionTitle}>Propriété intellectuelle</Text>
                <Text style={styles.termsText}>
                  L'application Impact, y compris son code, sa conception, ses graphiques et son contenu, est la propriété exclusive de ses concédants de licence. Toute reproduction, modification, distribution ou utilisation non autorisée est strictement interdite.
                </Text>

                <Text style={styles.termsSectionTitle}>Limitation de responsabilité</Text>
                <Text style={styles.termsText}>
                  Étant donné la nature MVP de l'application et sa fonction d'outil d'aide à la collecte d'informations, Impact ne peut être tenu responsable des dommages directs, indirects, accessoires, spéciaux ou consécutifs découlant de l'utilisation ou de l'incapacité à utiliser l'application, y compris, mais sans s'y limiter, les erreurs de saisie, les pertes de données ou les retards dans les déclarations officielles d'accident.
                </Text>

                <Text style={styles.termsSectionTitle}>Modifications de la politique</Text>
                <Text style={styles.termsText}>
                  Nous nous réservons le droit de modifier cette politique d'utilisation à tout moment. Toute modification sera effective dès sa publication dans l'application. Il est de votre responsabilité de consulter régulièrement cette politique pour prendre connaissance des mises à jour. L'utilisation continue de l'application après la publication des modifications constitue votre acceptation des nouvelles conditions.
                </Text>

                <Text style={styles.termsSectionTitle}>Résiliation</Text>
                <Text style={styles.termsText}>
                  Nous nous réservons le droit de suspendre ou de résilier votre accès à l'application Impact à notre seule discrétion, sans préavis, pour toute violation de cette politique d'utilisation ou pour toute autre raison jugée nécessaire.
                </Text>

                <Text style={styles.termsSectionTitle}>Droit applicable</Text>
                <Text style={styles.termsText}>
                  Cette politique d'utilisation est régie et interprétée conformément aux lois de la province de Québec, Canada, sans égard aux principes de conflit de lois. Tout litige découlant de cette politique sera soumis à la compétence exclusive des tribunaux du Québec.
                </Text>

                <Text style={styles.termsSectionTitle}>Contact</Text>
                <Text style={styles.termsText}>
                  Si vous avez des questions ou des préoccupations concernant cette politique d'utilisation, veuillez nous contacter à l'adresse suivante : info@impact-technologie.ca
                </Text>

                <Text style={styles.termsText}>
                  <Text style={styles.termsBold}>Avis de non-affiliation : </Text>Cette application n'est pas affiliée à un organisme gouvernemental, y compris la SAAQ, ni à aucun ministère ou autorité officielle. Il s'agit d'un outil tiers visant à faciliter la déclaration d'accidents.
                </Text>

                <Text style={[styles.termsText, { marginBottom: 20 }]}>
                  <Text style={styles.termsBold}>DISCLAIMER : </Text>Cette application n'est pas affiliée au gouvernement du Québec ou à tout autre organisme gouvernemental. Elle est développée de manière indépendante pour aider les utilisateurs à faciliter la déclaration numérique d'accidents.
                </Text>
              </ScrollView>

              <TouchableOpacity
                style={styles.termsCloseButton}
                onPress={() => setTermsModalVisible(false)}
              >
                <Text style={styles.termsCloseButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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

  termsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  termsContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },

  termsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#19363C",
    marginBottom: 16,
    textAlign: "center",
  },

  termsScroll: {
    flexGrow: 0,
  },

  termsSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#19363C",
    marginTop: 14,
    marginBottom: 4,
  },

  termsText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    marginBottom: 4,
  },

  termsBold: {
    fontWeight: "700",
  },

  termsCloseButton: {
    marginTop: 16,
    backgroundColor: "#19363C",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },

  termsCloseButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
