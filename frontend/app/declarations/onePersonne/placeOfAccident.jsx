import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, FlatList } from "react-native";
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Stepper from "../../../components/SignUp/stepper";
import MapView, { Marker } from "react-native-maps";
import { router } from "expo-router";
import * as Location from "expo-location";
import { DeclarationState } from "../../../GlobalState/DeclarationState";
import { useRecoilState } from "recoil";
import { SafeAreaView } from "react-native-safe-area-context";

const placeOfAccident = () => {
  const [selectedType, setSelectedType] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // Example step state
  const totalSteps = 4; // Example total steps
  const [showAdditionalInput, setShowAdditionalInput] = useState(false);
  const [showAccidentTypeInput, setShowAccidentTypeInput] = useState(false);
  const [accidentType, setAccidentType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [location, setLocation] = useState(null);
  const [place, setPlace] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [declaration, setDeclaration] = useRecoilState(DeclarationState);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const googlePlacesRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

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
      if (place) {
        setDeclaration({ ...declaration, place: place, step: 2 });
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
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Erreur", "Impossible de continuer. Veuillez réessayer.");
    }
  };

  const selectPlace = (data, details) => {
    try {
      if (data && data.description) {
        setPlace(data.description);
      } else {
        console.warn("Invalid place data:", data);
      }
    } catch (error) {
      console.error("Error selecting place:", error);
      Alert.alert("Erreur", "Impossible de sélectionner cet endroit");
    }
  };

  const handleMapLongPress = async (event) => {
    try {
      const coords = event.nativeEvent.coordinate;
      setSelectedCoords(coords);
      
      // Reverse geocode the coordinates
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=AIzaSyCiUgIoknUS8wxdyfWa8PnEHjQYxerNNGY&language=fr`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setPlace(address);
        // Set the text in the Google Places input field
        if (googlePlacesRef.current) {
          googlePlacesRef.current.setAddressText(address);
        }
        Alert.alert("Emplacement sélectionné", address);
      } else {
        Alert.alert("Erreur", "Impossible de trouver l'adresse pour cet emplacement");
      }
    } catch (error) {
      console.error("Error handling map long press:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'emplacement");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          console.warn("Location permission denied");
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
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Unable to get location");
      }
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

        <View style={{ zIndex: 9999, marginTop: 20 }}>
          <TextInput
            placeholder="chercher une adresse"
            value={place}
            onChangeText={(text) => {
              setPlace(text);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(async () => {
                if (!text || text.length < 2) {
                  setSuggestions([]);
                  return;
                }
                try {
                  const key = 'AIzaSyCiUgIoknUS8wxdyfWa8PnEHjQYxerNNGY';
                  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                    text,
                  )}&key=${key}&language=fr&components=country:ca`;
                  const res = await fetch(url);
                  const json = await res.json();
                  if (json && json.predictions) setSuggestions(json.predictions);
                  else setSuggestions([]);
                } catch (e) {
                  console.error("Places autocomplete error", e);
                  setSuggestions([]);
                }
              }, 400);
            }}
            style={{
              borderRadius: 5,
              borderWidth: 1,
              borderColor: "gray",
              height: 50,
              paddingHorizontal: 10,
            }}
          />

          {suggestions.length > 0 && (
            <View style={{ backgroundColor: "white", maxHeight: 200 }}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}
                    onPress={() => {
                      setPlace(item.description);
                      setSuggestions([]);
                    }}
                  >
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        <View style={styles.mapContainer}>
          <MapView 
            style={styles.map} 
            initialRegion={location || {
              latitude: 45.5017,
              longitude: -73.5673,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onLongPress={handleMapLongPress}
          >
            {selectedCoords && (
              <Marker
                coordinate={selectedCoords}
                pinColor="red"
                title="Emplacement sélectionné"
              />
            )}
          </MapView>
        </View>
      </View>

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
    justifyContent: "center",
  },

  container: {
    flex: 1,
    padding: 20,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20, // Added top margin for better spacing
    marginBottom: 30,
    textAlign: "left",
  },

  mapContainer: {
    width: '100%',
    height: 400,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },

  map: {
    width: '100%',
    height: '100%',
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
