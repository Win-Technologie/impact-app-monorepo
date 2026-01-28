import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  Animated,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import Stepper from "../../../components/SignUp/stepper";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import { SafeAreaView } from "react-native-safe-area-context";

const MainPageListItem = ({ item, slideAnim }) => (
  <>
    <Text
      style={[
        styles.title,
        /* { transform: [{ translateX: slideAnim }] },*/
      ]}
    >
      {item.title}
    </Text>
    <Text
      style={[
        styles.description,
        /* { transform: [{ translateX: slideAnim }] },*/
      ]}
    >
      {item.description}
    </Text>
  </>
);

const submitDeclaration = () => {
  const [currentStep, setCurrentStep] = useState(4); // Example step state
  const totalSteps = 5; // Example total steps
  const [visible, setVisible] = React.useState(false);
  const [minute, setMinute] = React.useState(null);
  const [hour, setHour] = React.useState(null);

  const info = {
    title: "Vous avez completez l'ensemble de toute votre déclaration",
    description:
      "Il ne vous reste plus qu’a communiquer avec votre société d’assurance. Une fois que vous aurez appuyé sur le bouton confirmer, vous ne pourrez plus revenir en arrière.",
  };

  const slideUpAnim = useRef(new Animated.Value(400)).current;
  const slideAnim = useRef(new Animated.Value(-1000)).current;

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

  const handlePress = (type) => {
    setSelectedType(type);
    setShowAdditionalInput(type === "Accrochage avec un véhicule vide");
    setShowAccidentTypeInput(type === "Autre");
  };

  const back = () => {
    router.back();
  };

  const next = () => {
    router.navigate("(tabs)");
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <ImageBackground
        source={require("../../../assets/fond.png")}
        resizeMode="cover"
        style={{ flex: 1, width: "100%" }}
      >
        <View style={{ padding: 20 }}>
          <Stepper
            currentStep={currentStep}
            totalSteps={totalSteps}
            style={styles.stepper}
          />
        </View>

        <View style={[styles.popupContainer]}>
          <View style={styles.popupContent}>
            <MainPageListItem item={info} slideAnim={slideAnim} />
          </View>
        </View>
        <View style={styles.footContainer}>
          <DualOptionButton
            leftButtonTitle="Retour"
            rightButtonTitle="Confirmer"
            onPressBack={() => back()}
            onPressContinue={() => next()}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "white",
  },

  popupContent: {
    width: "100%",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },

  description: {
    fontSize: 14,
    textAlign: "left",
    marginBottom: 15,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  popupContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    height: "40%",
    borderColor: "#ccc",
    alignItems: "center",
  },

  popupContent: {
    width: "100%",
    alignItems: "center",
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
});

export default submitDeclaration;
