import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
//import { getMyVehicles } from "../../../../api/users/userApi";
// QR scanner removed — using manual entry only
import { AntDesign } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Octicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const OtherInfo = () => {
  const [scannedData, setLocalScannedData] = useState(null);

  const params = useLocalSearchParams();
  const person = Number(params.person ?? 1);

  const consultInformation = (type) => {
    if (type == 1) {
      router.push({ pathname: "/declarations/twoPersonnes/InfoPersons/otherInfo/personalInfo", params: { person } });
    } else if (type == 2) {
      router.push({ pathname: "/declarations/twoPersonnes/InfoPersons/otherInfo/vehicleInfo", params: { person } });
    } else if (type == 3) {
      router.push({ pathname: "/declarations/twoPersonnes/InfoPersons/otherInfo/assuranceInfo", params: { person } });
    }
  };

  // Camera scanner removed; manual entry available below.

  // QR scanning logic removed.


  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: 20,
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row" }}
          onPress={() => {
            router.back();
          }}
        >
          <AntDesign
            name="arrow-left"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            Reception des informations
          </Text>
        </View>
      </View>

      <ScrollView>
        {/* QR feature removed — nothing to show here */}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>
            Saisir les informations manuellement
          </Text>

          <TouchableOpacity
            style={styles.infoBox}
            onPress={() => consultInformation(1)}
          >
            <View style={{ flex: 2 }}>
              <Icon name="person" size={30} color="#19363C" />
            </View>

            <View style={{ flex: 9 }}>
              <Text style={styles.infoTextPerso}>
                Informations personnelles
              </Text>
              <Text style={styles.subInfoText}>Nom,âge,adresse...</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Icon name="chevron-right" size={30} color="#000" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBox}
            onPress={() => consultInformation(2)}
          >
            <View style={{ flex: 2 }}>
              <FontAwesome5 name="car" size={25} color="#19363C" />
            </View>

            <View style={{ flex: 9 }}>
              <Text style={styles.infoTextCar}>Informations du véhicule</Text>
              <Text style={styles.subInfoText}>Modèle,numéro de plaque...</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Icon name="chevron-right" size={30} color="#000" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBox}
            onPress={() => consultInformation(3)}
          >
            <View style={{ flex: 2 }}>
              <Octicons name="checklist" size={28} color="#000" />
            </View>

            <View style={{ flex: 9 }}>
              <Text style={styles.infoText}>Informations d'assurance</Text>
              <Text style={styles.subInfoText}>
                Numéro d'assurance, nom de société...
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Icon name="chevron-right" size={30} color="#000" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#FFF",
  },

  infoSection: {
    backgroundColor: "#19363C",
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
  },

  infoText: {
    fontSize: 16,
  },

  subInfoText: {
    fontSize: 14,
    color: "#666",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 40,
    textAlign: "center",
  },

  qrContainer: {
    height: 350,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    marginHorizontal: 30,
    marginBottom: 40,
    marginVertical: 40,
  },

  camera: {
    width: 300,
    height: 300,
  },

  scanButton: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
  },

  cameraView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cameraText: {
    color: "#fff",
  },

  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  noQrNotice: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  iconBackground: {
    backgroundColor: "#19363C",
    padding: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default OtherInfo;
