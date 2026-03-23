import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import Stepper from "../../../components/SignUp/stepper";
import { router } from "expo-router";
import { DeclarationState } from "../../../GlobalState/DeclarationState";
import { useRecoilState } from "recoil";
import { SafeAreaView } from "react-native-safe-area-context";

const typeOfAccident = () => {
  const [selectedType, setSelectedType] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // Example step state
  const totalSteps = 4; // Example total steps
  const [showAdditionalInput, setShowAdditionalInput] = useState(false);
  const [showAccidentTypeInput, setShowAccidentTypeInput] = useState(false);
  const [accidentType, setAccidentType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [declaration, setDeclaration] = useRecoilState(DeclarationState);

  const formatPlateNumber = (text) => {
    // Remove all spaces and special characters, keep only alphanumeric
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Limit to 7 characters
    const limited = cleaned.substring(0, 7);
    // Add space after 3rd character if length > 3
    if (limited.length > 3) {
      return limited.substring(0, 3) + ' ' + limited.substring(3);
    }
    return limited;
  };

  const generateTestPlate = () => {
    // Generate random French license plate format: ABC1234
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let plate = '';
    // 3 letters
    for (let i = 0; i < 3; i++) {
      plate += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // 4 numbers
    for (let i = 0; i < 4; i++) {
      plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    setPlateNumber(formatPlateNumber(plate));
  };

  //console.log(declaration);

  const handlePress = (type) => {
    setSelectedType(type);
    setShowAdditionalInput(type === "Accrochage avec un véhicule vide");
    setShowAccidentTypeInput(type === "Autre");
    setDeclaration({ ...declaration, type: type });
  };

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
      // type d'accident choisie
      if (!!selectedType) {
        if (selectedType === "Autre") {
          // Accident choisi
          if (!!accidentType) {
            setDeclaration({ ...declaration, type: accidentType });

            router.navigate("declarations/onePersonne/placeOfAccident");
          } else {
            Alert.alert(
              "Erreur",
              "Vous devez inscrire le type d'accident avant de continuer",
              [
                {
                  text: "Ok",
                  onPress: () => null,
                  style: "cancel",
                },
              ],
            );
          }
        } else if (selectedType === "Accrochage avec un véhicule vide") {
          // numéro de la carte inscrit
          if (!!plateNumber) {
            // Remove spaces before saving
            const cleanedPlate = plateNumber.replace(/\s/g, '');
            setDeclaration({ ...declaration, plaque: cleanedPlate });
            router.navigate("declarations/onePersonne/placeOfAccident");
            //alert("okay accident choisi");
            //console.log(declaration);
          } else {
            Alert.alert(
              "Erreur",
              "Vous devez inscrire le numéro de la carte d'immatriculation du vehicule touché",
              [
                {
                  text: "Ok",
                  onPress: () => null,
                  style: "cancel",
                },
              ],
            );
          }
        } else {
          router.navigate("declarations/onePersonne/placeOfAccident");
        }
      } else {
        Alert.alert(
          "Erreur",
          "Vous devez choisir  le type d'accident avant de continuer",
          [
            {
              text: "Ok",
              onPress: () => null,
              style: "cancel",
            },
          ],
        );
      }

      console.log(declaration);
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Erreur", "Impossible de continuer. Veuillez réessayer.");
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <Stepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        style={styles.stepper}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>
              De quel type d'accident est-il question?
            </Text>

          <View style={styles.buttonContainer}>
            <AnimatedButton
              title="Accrochage avec un véhicule vide"
              onPress={() => handlePress("Accrochage avec un véhicule vide")}
              customStyle={
                selectedType === "Accrochage avec un véhicule vide"
                  ? styles.activeButton
                  : styles.button
              }
              textStyle={
                selectedType === "Accrochage avec un véhicule vide"
                  ? styles.activeButtonText
                  : styles.buttonText
              }
            />

            <AnimatedButton
              title="Accrochage d'un item public avec dommage"
              onPress={() =>
                handlePress("Accrochage d'un item public avec dommage")
              }
              customStyle={
                selectedType === "Accrochage d'un item public avec dommage"
                  ? styles.activeButton
                  : styles.button
              }
              textStyle={
                selectedType === "Accrochage d'un item public avec dommage"
                  ? styles.activeButtonText
                  : styles.buttonText
              }
            />

            <AnimatedButton
              title="Accrochage d'un item public sans dommage"
              onPress={() =>
                handlePress("Accrochage d\'un item public sans dommage")
              }
              customStyle={
                selectedType === "Accrochage d'un item public sans dommage"
                  ? styles.activeButton
                  : styles.button
              }
              textStyle={
                selectedType === "Accrochage d'un item public sans dommage"
                  ? styles.activeButtonText
                  : styles.buttonText
              }
            />

            <AnimatedButton
              title="Accrochage d'un item privé"
              onPress={() => handlePress("Accrochage d'un item privé")}
              customStyle={
                selectedType === "Accrochage d'un item privé"
                  ? styles.activeButton
                  : styles.button
              }
              textStyle={
                selectedType === "Accrochage d'un item privé"
                  ? styles.activeButtonText
                  : styles.buttonText
              }
            />

            <AnimatedButton
              title="Autre"
              onPress={() => handlePress("Autre")}
              customStyle={
                selectedType === "Autre" ? styles.activeButton : styles.button
              }
              textStyle={
                selectedType === "Autre"
                  ? styles.activeButtonText
                  : styles.buttonText
              }
            />
          </View>

          {showAdditionalInput && (
            <View>
              <Text style={styles.title}>
                Information sur le véhicule touché
              </Text>
              <View style={styles.inputWithCounter}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Plaque d'immatriculation"
                  value={plateNumber}
                  onChangeText={(text) => setPlateNumber(formatPlateNumber(text))}
                  autoCapitalize="characters"
                  maxLength={8}
                />
                <Text style={styles.counter}>{`${plateNumber.replace(' ', '').length}/7`}</Text>
              </View>
              <TouchableOpacity
                style={styles.testButton}
                onPress={generateTestPlate}
              >
                <Text style={styles.testButtonText}>Générer plaque test</Text>
              </TouchableOpacity>
            </View>
          )}

          {showAccidentTypeInput && (
            <View>
              <Text style={styles.title}>
                Informations sur le type d'accident
              </Text>
              <View style={styles.inputWithCounter}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type d'accident"
                  value={accidentType}
                  onChangeText={setAccidentType}
                />
              </View>
            </View>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footContainer}>
        <DualOptionButton
          leftButtonTitle="Annuler"
          rightButtonTitle="Confirmer"
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
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },

  container: {
    flex: 1,
    justifyContent: "flex-start",
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

  testButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },

  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default typeOfAccident;
