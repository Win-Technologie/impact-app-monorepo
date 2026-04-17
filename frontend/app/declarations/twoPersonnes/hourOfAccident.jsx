import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import Stepper from "../../../components/SignUp/stepper";
import { Ionicons } from "@expo/vector-icons";
import { TimePickerModal } from "react-native-paper-dates";
import { router } from "expo-router";
import { DeclarationState } from "../../../GlobalState/DeclarationState";
import { useRecoilState } from "recoil";

const hourOfAccident = () => {
  const [currentStep, setCurrentStep] = useState(2); // Example step state
  const totalSteps = 4; // Example total steps
  const [visible, setVisible] = React.useState(false);
  const [minute, setMinute] = React.useState(null);
  const [hour, setHour] = React.useState(null);
  const [declaration, setDeclaration] = useRecoilState(DeclarationState);

  useEffect(() => {
    setDeclaration((prev) => ({ ...prev, step: 3 }));
  }, []);

  console.log(declaration);

  const { t } = useTranslation();

  const onDismiss = React.useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onConfirm = React.useCallback(
    ({ hours, minutes }) => {
      setVisible(false);
      setMinute(minutes);
      setHour(hours);
      console.log({ hours, minutes });
    },
    [setVisible],
  );

  const back = () => {
    try {
      router.back();
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Erreur", "Impossible de revenir en arrière");
    }
  };

  const next = () => {
    try {
      if (minute == null || hour == null) {
        Alert.alert(t("error"), t("declaration.selectTimeRequired"), [
          {
            text: t("buttons.ok") || "Ok",
            onPress: () => null,
            style: "cancel",
          },
        ]);
      } else {
        setDeclaration({ ...declaration, hour: hour, minute: minute, step: 3 });
        router.navigate("declarations/twoPersonnes/otherSpecification");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Erreur", "Impossible de continuer. Veuillez réessayer.");
    }
  };

  const generateTestTime = () => {
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    setHour(randomHour);
    setMinute(randomMinute);
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <Stepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        style={styles.stepper}
      />
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>{t("declaration.hourOfAccidentTitle")}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={{
            height: 50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FAFAFA",
            borderRadius: 5,
            borderColor: "#F1F1F1",
            shadowColor: "grey",
            shadowOpacity: 0.5,
            borderWidth: 1,
            shadowOffset: { width: 2, height: 2 },
          }}
        >
          <View style={{ flex: 2, alignItems: "center" }}>
            <Text style={{ color: "#19363C" }}>
              {hour == null ? t("declaration.hourPlaceholder") : hour}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#19363C" }}>:</Text>
          </View>

          <View style={{ flex: 2, alignItems: "center" }}>
            <Text style={{ color: "#19363C" }}>
              {minute == null ? t("declaration.minutePlaceholder") : minute}
            </Text>
          </View>
        </TouchableOpacity>

        <View>
          <TimePickerModal
            visible={visible}
            onDismiss={onDismiss}
            onConfirm={onConfirm}
            hours={0}
            minutes={0}
          />
        </View>

        <TouchableOpacity
          style={styles.currentTimeButton}
          onPress={() => {
            const now = new Date();
            setHour(now.getHours());
            setMinute(now.getMinutes());
          }}
        >
          <Ionicons name="time-outline" size={20} color="#fff" />
          <Text style={styles.currentTimeButtonText}>{t("declaration.takeCurrentTime")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footContainer}>
        <DualOptionButton
          leftButtonTitle={t("buttons.cancel")}
          rightButtonTitle={t("buttons.confirm")}
          onPressBack={() => back()}
          onPressContinue={() => next()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },

  container: {
    justifyContent: "center",
    marginTop: 100,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20, // Added top margin for better spacing
    marginBottom: 30,
    textAlign: "left",
  },

  buttonContainer: {
    width: "100%",
    alignItems: "center",
    fontSize: 14,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  button: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    fontSize: 14,
  },

  buttonText: {
    fontSize: 14.5, // Regular text style
    color: "grey", // Default color
  },

  activeButtonText: {
    fontSize: 14.5, // Keep the same size or adjust as needed
    color: "white", // Color changes to white when active
  },

  activeButton: {
    backgroundColor: "#0B8BA8",
    width: "100%",
    color: "white",
    marginVertical: 10,
  },

  stepper: {
    width: "50%",
    Padding: 10,
  },

  additionalInputContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },

  additionalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  inputWithCounter: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    position: "relative",
  },

  textInput: {
    flex: 1,
    height: 51,
    borderColor: "gray",
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
    paddingRight: 40,
  },

  counter: {
    textAlign: "right",
    fontSize: 14.5,
    position: "absolute",
    right: 13,
  },

  footContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  currentTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B8BA8',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },

  currentTimeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  testButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },

  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default hourOfAccident;
