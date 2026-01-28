import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import InputsShowGroup from "../../components/Utils/Inputs/InputsShowGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilValue } from "recoil";
import { UserInfoState } from "../../GlobalState/UserInfoState";
import { SelectedVehicleState } from "../../GlobalState/SelectedVehiclesState";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const formatDate = (dateString, format = "year/mm/dd") => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (format === "year/mm/dd") {
    return `${year}/${month}/${day}`;
  } else if (format === "mm/dd/year") {
    return `${month}/${day}/${year}`;
  } else {
    return dateString; // Retourne la date non formatée si le format n'est pas reconnu
  }
};

const InsuranceInfo = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [insuranceDetails, setInsuranceDetails] = useState(null);
  const selectedVehicleId = useRecoilValue(SelectedVehicleState);
  const ownerDetails = useRecoilValue(UserInfoState);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  if (!ownerDetails) {
    return <Text>Loading...</Text>;
  }

  const insuranceInfo = [
    {
      style: "column",
      label: t("insuranceInfo.companyName"),
      value: ownerDetails?.insurance?.insuranceCompany || "N/A",
    },
    {
      style: "row",
      firstLabel: t("insuranceInfo.policyNumber"),
      valueFirstLabel: ownerDetails?.insurance?.policyNumber || "N/A",
      secondLabel: t("insuranceInfo.expirationDate"),
      valueSecondLabel: ownerDetails?.insurance?.expirationDate
        ? formatDate(ownerDetails?.insurance?.expirationDate, "year/mm/dd")
        : "N/A",
    },
  ];

  const ownerInfo = [
    {
      style: "column",
      label: t("insuranceInfo.ownerFirstName"),
      value: ownerDetails?.owner?.name || "N/A",
    },
    {
      style: "column",
      label: t("insuranceInfo.ownerLastName"),
      value: ownerDetails?.owner?.lastName || "N/A",
    },
    {
      style: "column",
      label: t("insuranceInfo.ownerEmail"),
      value: ownerDetails?.owner?.email || "N/A",
    },
    {
      style: "column",
      label: t("insuranceInfo.ownerPhone"),
      value: ownerDetails?.owner?.phone || "N/A",
    },
    {
      style: "column",
      label: t("insuranceInfo.ownerAddress"),
      value: ownerDetails?.owner?.address || "N/A",
    },
    {
      style: "row",
      firstLabel: t("insuranceInfo.ownerCity"),
      valueFirstLabel: ownerDetails?.owner?.city || "N/A",
      secondLabel: t("insuranceInfo.ownerPostalCode"),
      valueSecondLabel: ownerDetails?.owner?.postalCode || "N/A",
    },
    {
      style: "row",
      firstLabel: t("insuranceInfo.ownerCountry"),
      valueFirstLabel: ownerDetails?.owner?.country || "N/A",
      secondLabel: t("insuranceInfo.ownerProvince"),
      valueSecondLabel: ownerDetails?.owner?.province || "N/A",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: 20,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row" }}
          onPress={() => {
            router.back();
          }}
        >
          <AntDesign
            name="arrowleft"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            {t("insuranceInfo.title")}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t("insuranceInfo.title")}</Text>
            <InputsShowGroup dataToShow={insuranceInfo} editable={false} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>
              {t("insuranceInfo.ownerInfo")}
            </Text>
            <InputsShowGroup dataToShow={ownerInfo} editable={false} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 23,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
  },
  content: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
  },
});

export default InsuranceInfo;

//
