import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function assuranceInfo() {
  // Insurance fields - blank by default
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  // Insured person fields - blank by default
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");


  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 20,
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
            Informations d'assurance
          </Text>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.contentContainer}>
          <Text style={styles.fieldLabel}>Nom de la société d'assurance</Text>
          <TextInput style={styles.input} value={insuranceCompany} onChangeText={setInsuranceCompany} />
          <Text style={styles.fieldLabel}>Numéro d'assurance</Text>
          <TextInput style={styles.input} value={policyNumber} onChangeText={setPolicyNumber} keyboardType="numeric" />
          <Text style={styles.fieldLabel}>Date d'expiration</Text>
          <TextInput style={styles.input} value={expirationDate} onChangeText={setExpirationDate} placeholder="YYYY-MM-DD" />

          <Text style={[styles.headerTitle, styles.marginSpace, styles.centerText]}>
            Informations de l'assuré
          </Text>

          <Text style={styles.fieldLabel}>Prénom</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.fieldLabel}>Nom</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
          <Text style={styles.fieldLabel}>Adresse courriel</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Text style={styles.fieldLabel}>Numéro de téléphone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Text style={styles.fieldLabel}>Numéro et rue de l'adresse</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          <Text style={styles.fieldLabel}>Ville</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} />
          <Text style={styles.fieldLabel}>Code postal</Text>
          <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} />
          <Text style={styles.fieldLabel}>Pays</Text>
          <TextInput style={styles.input} value={country} onChangeText={setCountry} />
          <Text style={styles.fieldLabel}>Province</Text>
          <TextInput style={styles.input} value={province} onChangeText={setProvince} />
        </View>
      </ScrollView>

      {/* Continued navigation removed: user should not auto-advance from this view */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 23,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  safeAreaContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#19363C",
  },

  contentContainer: {
    marginTop: 20,
    justifyContent: "center",
    marginBottom: 50,
  },

  fieldLabel: {
    color: "#b4b4b5",
    marginBottom: 5,
    fontSize: 12,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 7,
    backgroundColor: "#fafafa",
  },

  marginSpace: {
    marginVertical: 20,
  },

  centerText: {
    textAlign: "center",
  },

  footContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
