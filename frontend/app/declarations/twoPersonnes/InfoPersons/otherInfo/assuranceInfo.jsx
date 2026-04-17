import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilState } from "recoil";
import { DeclarationState } from "../../../../../GlobalState/DeclarationState";
import SingleBottomButton from "../../../../../components/SignUp/SingleBottomButton";

export default function assuranceInfo() {
  const { t } = useTranslation();
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

  const [declaration, setDeclaration] = useRecoilState(DeclarationState);
  const params = useLocalSearchParams();
  const personIndex = Number(params.person ?? 1);

  useEffect(() => {
    const saved = declaration?.people?.[personIndex];
    if (!saved) return;
    if (saved.insurance) {
      setInsuranceCompany(saved.insurance.insuranceCompany || "");
      setPolicyNumber(saved.insurance.policyNumber || "");
      setExpirationDate(saved.insurance.expirationDate || "");
    }
    if (saved.owner) {
      setName(saved.owner.name || "");
      setLastName(saved.owner.lastName || "");
      setEmail(saved.owner.email || "");
      setPhone(saved.owner.phone || "");
      setAddress(saved.owner.address || "");
      setCity(saved.owner.city || "");
      setPostalCode(saved.owner.postalCode || "");
      setCountry(saved.owner.country || "");
      setProvince(saved.owner.province || "");
    }
  }, [declaration, personIndex]);

  const handleSave = () => {
    const people = declaration?.people ? [...declaration.people] : [];
    const idx = personIndex;
    while (people.length <= idx) people.push({});
    people[idx] = {
      ...(people[idx] || {}),
      insurance: {
        insuranceCompany,
        policyNumber,
        expirationDate,
      },
      owner: {
        name,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        country,
        province,
      },
    };
    // set display name
    people[idx].name = `${name || ""} ${lastName || ""}`.trim() || `Personne ${idx + 1}`;
    setDeclaration((prev) => ({ ...prev, people }));
    Alert.alert(t("common.success", { defaultValue: "Succès" }), t("common.informationSaved", { defaultValue: "Information saved" }));
  };

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
          <Text style={{ color: "#19363C" }}>{"   "}{t("common.back")}</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            {t("insuranceInfo.title")}
          </Text>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.contentContainer}>
          <Text style={styles.fieldLabel}>{t("insuranceInfo.companyName")}</Text>
          <TextInput style={styles.input} value={insuranceCompany} onChangeText={setInsuranceCompany} />
          <Text style={styles.fieldLabel}>{t("insuranceInfo.policyNumber")}</Text>
          <TextInput style={styles.input} value={policyNumber} onChangeText={setPolicyNumber} keyboardType="numeric" />
          <Text style={styles.fieldLabel}>{t("insuranceInfo.expirationDate")}</Text>
          <TextInput style={styles.input} value={expirationDate} onChangeText={setExpirationDate} placeholder="YYYY-MM-DD" />

          <Text style={[styles.headerTitle, styles.marginSpace, styles.centerText]}>
            {t("insuranceInfo.ownerInfo")}
          </Text>

          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerFirstName")}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerLastName")}</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
          <Text style={styles.fieldLabel}>{t("insuranceInfo.ownerEmail", { defaultValue: "Adresse courriel" })}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Text style={styles.fieldLabel}>{t("insuranceInfo.ownerPhone", { defaultValue: "Numéro de téléphone" })}</Text>
          <Text style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerAddress", { defaultValue: "Numéro et rue de l'adresse" })}</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerCity")}</Text>
          <Text style={styles.input} value={city} onChangeText={setCity} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerPostalCode")}</Text>
          <Text style={styles.input} value={postalCode} onChangeText={setPostalCode} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerCountry")}</Text>
          <Text style={styles.input} value={country} onChangeText={setCountry} />
          <Text style={styles.fieldLabel}>{t("vehicleInfo.ownerProvince")}</Text>
          <Text style={styles.input} value={province} onChangeText={setProvince} />
        </View>
      </ScrollView>

      <View style={styles.footContainer}>
        <SingleBottomButton onPress={handleSave}>{t("common.save")}</SingleBottomButton>
      </View>
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
