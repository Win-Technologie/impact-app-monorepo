import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Stepper from "../../../components/SignUp/stepper";
import MapView from "react-native-maps";
import { router } from "expo-router";
import * as Location from "expo-location";
import { DeclarationState } from "../../../GlobalState/DeclarationState";
import { useRecoilState } from "recoil";

const placeOfAccident = () => {
  const [selectedType, setSelectedType] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // Example step state
  const totalSteps = 4; // Example total steps
  const [showAdditionalInput, setShowAdditionalInput] = useState(false);
  const [showAccidentTypeInput, setShowAccidentTypeInput] = useState(false);
  const [accidentType, setAccidentType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [location, setLocation] = useState(null);
  const [place, setPlace] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [declaration, setDeclaration] = useRecoilState(DeclarationState);

  console.log(declaration);

  const back = () => {
    router.back();
  };

  const next = () => {
    if (place) {
      setDeclaration({ ...declaration, place: place });
      router.navigate("declarations/onePersonne/hourOfAccident");
    } else {
      Alert.alert(
        "Erreur",
        "Vous devez choisir le lieux de l'accident avant de continuer",
        [
          {
            text: "Ok",
            onPress: () => null,
            style: "cancel",
          },
        ],
      );
    }
  };

  const selectPlace = (data, details) => {
    console.log(data.description);
    setPlace(data.description);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let l = await Location.getCurrentPositionAsync({});

      console.log(l);

      setLocation({
        latitude: l.coords.latitude,
        longitude: l.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  return (
    <SafeAreaView style={styles.outerContainer}>
      <Stepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        style={styles.stepper}
      />

      <View style={styles.container}>
        <Text style={styles.title}> Ou l'accident a t-il eu lieu ? </Text>

        <View style={{ zIndex: 9999, marginTop: 30, height: 400 }}>
          <GooglePlacesAutocomplete
            placeholder="chercher une adresse"
            query={{ key: "AIzaSyCiUgIoknUS8wxdyfWa8PnEHjQYxerNNGY" }}
            fetchDetails={true}
            onPress={(data, details = null) => selectPlace(data, details)}
            onFail={(error) => console.log(error)}
            onNotFound={() => console.log("no results")}
            styles={{
              textInput: {
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "gray",
                height: 50,
              },
            }}
          />
        </View>

        {location && <MapView style={styles.map} initialRegion={location} />}
      </View>

      {/*<View style={{
                position: "absolute",
                bottom: 80,
                left: 0,
                right: 0,
                zIndex: 99999,
                padding: 20,
                alignItems: 'center',

            }}>
                <View style={{
                    backgroundColor: "white",
                    width: "100%",
                    height: 100,
                    padding: 20,
                    borderRadius:5
                }}>
                    <View style={{ flexDirection:'row', } }>
                        <View style={{flex:1} }>
                        </View>

                        <View style={{ flex: 4 }}>

                        </View>

                    </View>
                </View>
            </View>*/}

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
    padding: 20,
  },

  scrollContainer: {
    justifyContent: "center",
  },

  container: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20, // Added top margin for better spacing
    marginBottom: 30,
    textAlign: "left",
  },

  map: {
    position: "absolute",
    width: "120%",
    marginLeft: -20,
    height: 900,
    top: 80,
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

  stepper: {
    width: "50%",
    Padding: 10,
  },

  footContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default placeOfAccident;
