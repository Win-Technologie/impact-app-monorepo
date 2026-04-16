import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Camera } from "expo-camera";

const StageThree = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleQRCodeRead = ({ data }) => {
    setScannedData(data);
    setIsScannerActive(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>{t("pleasewait")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.qrContainer}>
        {isScannerActive ? (
          <Camera style={styles.camera} />
        ) : (
          <TouchableOpacity onPress={() => setIsScannerActive(true)} style={styles.imagePlaceholder}>
            <Text>{t("home.tapToScan") || "Tap to start scanning"}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.scanResult}>{scannedData ? `${t("scannedData")}: ${scannedData}` : t("noQrScanned")}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{t("declaration.receiveInformation")}</Text>

        <TouchableOpacity style={styles.infoBox} onPress={() => router.push("/personalInfo")}>
          <Icon name="person" size={34} color="#19363C" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTextPerso}>{t("declaration.personalInformation")}</Text>
            <Text style={styles.subInfoTextPerso}>{t("declarationShorts.personalInfoShort")}</Text>
          </View>
          <Icon name="chevron-right" size={30} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBox} onPress={() => router.push("/vehicleInfo")}>
          <FontAwesome5 name="car" size={30} color="#19363C" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTextCar}>{t("declaration.vehicleInformation")}</Text>
            <Text style={styles.subInfoTextCar}>{t("declarationShorts.vehicleInfoShort")}</Text>
          </View>
          <Icon name="chevron-right" size={30} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBox} onPress={() => router.push("/insuranceInfo")}>
          <View style={styles.iconBackground}>
            <MaterialIcons name="checklist" size={30} color="white" />
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>{t("declaration.insuranceInformation")}</Text>
            <Text style={styles.subInfoText}>{t("declarationShorts.insuranceInfoShort")}</Text>
          </View>
          <Icon name="chevron-right" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  contentContainer: { flexGrow: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  qrContainer: { height: 300, justifyContent: "center", alignItems: "center", margin: 20 },
  camera: { width: 300, height: 300 },
  imagePlaceholder: { width: 300, height: 300, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" },
  scanResult: { marginTop: 10 },
  infoSection: { backgroundColor: "#19363C", paddingVertical: 20, paddingHorizontal: 20, width: "100%" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF", marginBottom: 20 },
  infoBox: { flexDirection: "row", alignItems: "center", padding: 20, marginBottom: 20, backgroundColor: "#FFF", borderRadius: 10 },
  infoTextContainer: { flex: 1, marginLeft: 10 },
  infoTextPerso: { fontSize: 16 },
  subInfoTextPerso: { fontSize: 14, color: "#666" },
  infoTextCar: { fontSize: 16 },
  subInfoTextCar: { fontSize: 14, color: "#666" },
  iconBackground: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1B6878", justifyContent: "center", alignItems: "center" }
});

export default StageThree;
