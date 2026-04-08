import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import Stepper from "../../../components/SignUp/stepper";
import TextInputLarge from "../../../components/SignUp/textInputLarge";
import { SimpleLineIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import ImagePickerModal from "../../../components/ImagePickerModal";
import { DeclarationState } from "../../../GlobalState/DeclarationState";
import { useRecoilState } from "recoil";
import { SafeAreaView } from "react-native-safe-area-context";

const otherspecification = () => {
  const [currentStep, setCurrentStep] = useState(3); // Example step state
  const totalSteps = 4; // Example total steps
  const [visible, setVisible] = React.useState(false);
  const [minute, setMinute] = React.useState(null);
  const [hour, setHour] = React.useState(null);
  const [image, setImage] = React.useState(null);
  const [images, setImages] = React.useState([]);
  const [declaration, setDeclaration] = useRecoilState(DeclarationState);
  const [otherSpec, setOtherSpec] = useState(null);

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
      setDeclaration({
        ...declaration,
        otherSpecification: otherSpec || "",
        images: images || [],
        step: 4,
      });

      console.log(declaration);

      router.navigate("declarations/onePersonne/submitDeclaration");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Erreur", "Impossible de continuer. Veuillez réessayer.");
    }
  };

  const generateTestSpecifications = () => {
    const testSpecs = [
      "Le véhicule a percuté un poteau d'éclairage public sur le côté droit. Dommages importants à l'avant du véhicule.",
      "Accident causé par une perte de contrôle sur chaussée glissante. Aucun autre véhicule impliqué. Dommages légers.",
      "Le rétroviseur latéral a été endommagé lors d'une manoeuvre de stationnement. Rayures sur la porte conducteur.",
      "Impact avec un véhicule stationné sans surveillance. Pare-choc avant endommagé. Pas de blessés.",
      "Accrochage mineur dans un stationnement. Éraflures sur le pare-choc arrière. L'autre véhicule était vide.",
    ];
    const randomSpec = testSpecs[Math.floor(Math.random() * testSpecs.length)];
    setOtherSpec(randomSpec);
  };

  const openPickupImage = () => {
    try {
      setVisible(true);
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Erreur", "Impossible d'ouvrir le sélecteur d'images");
    }
  };

  const removeImage = (obj) => {
    try {
      if (!obj || !images) {
        console.warn("Invalid image object or images array");
        return;
      }
      const updatedImages = images.filter((item) => item !== obj);
      setImages([...updatedImages]);
    } catch (error) {
      console.error("Error removing image:", error);
      Alert.alert("Erreur", "Impossible de supprimer l'image");
    }
  };

  useEffect(() => {
    try {
      if (!visible && image != null && image.uri) {
        const newImage = { id: images.length, image: image.uri };
        setImages([...images, newImage]);
        setImage(null);
      }
    } catch (error) {
      console.error("Error adding image:", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'image");
    }
  }, [visible]);

  return (
    <SafeAreaView style={styles.outerContainer}>
      <Stepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        style={styles.stepper}
      />

      <ScrollView style={styles.container}>
        <Text style={styles.title}>
          Avez-vous d'autre spécifications à ajouter ?
        </Text>

        

        <View style={styles.inputSection}>
          <TextInput
            multiline={true}
            numberOfLines={10}
            style={styles.textInput}
            placeholder="Redigez toute autres information"
            value={otherSpec}
            onChangeText={setOtherSpec}
          />
        </View>

        <Text style={styles.title}>Avez-vous des photos à ajouter ?</Text>
        <View style={styles.inputSection}>
          <View
            style={{
              padding: 2,
              alignItems: "center",
              marginVertical: 0,
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={styles.UploadButton}
              onPress={() => {
                openPickupImage();
              }}
            >
              <SimpleLineIcons name="cloud-upload" size={24} color="#1B6878" />

              <Text style={{ textAlign: "center" }}>
                Telecharger une photo de{" "}
                <Text style={{ color: "#0B7BA8" }}>l'accident </Text> ou du
                <Text style={{ color: "#0B7BA8" }}> véhicule </Text> au moment
                de l'accident'
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {images.map((image) => (
          <View
            key={image.id}
            style={{
              backgroundColor: "#19363C",
              height: 40,
              borderRadius: 5,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
              marginBottom: 5,
            }}
          >
            <View>
              <Text style={{ color: "white" }}>Photo {image.id + 1}</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                removeImage(image);
              }}
            >
              <Text style={{ color: "white" }}>
                {" "}
                <Ionicons
                  name="close-circle-sharp"
                  size={18}
                  color="white"
                />{" "}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <ImagePickerModal
        isVisible={visible}
        onClose={() => setVisible(false)}
        setImage={setImage}
      />

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

  container: {
    marginBottom: 40,
    padding: 20,
  },

  textInput: {
    backgroundColor: "white",
    borderColor: "#ccc",
    borderRadius: 5,
    borderRadius: 5,
    borderWidth: 1,
    padding: 15,
    height: 200,
    textAlignVertical: "top",
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
    fontSize: 14.5,
    color: "grey",
  },

  activeButtonText: {
    fontSize: 14.5,
    color: "white",
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
    marginBottom: 10,
  },

  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  UploadButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 25,
    width: "100%",
    gap: 10,
    borderStyle: "dashed",
    borderColor: "#0B8BA8",
    alignItems: "center",
  },

  inputSection: {
    marginVertical: 10,
  },
});

export default otherspecification;
