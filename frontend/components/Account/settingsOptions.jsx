import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  AntDesign,
  MaterialIcons,
  FontAwesome,
  Ionicons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { signout } from "../../app/api/users/userApi";

export default function SettingsOptions({ currentLanguage, appVersion }) {
  const [filePath, setFilePath] = React.useState(null);
  const { t } = useTranslation();

  const router = useRouter();

  const handlePressAbonnement = () => {
    //router.push('/abonnement');
  };

  const handlePressVehicules = () => {
    router.push("vehicleOptions/VehicleList");
  };

  const handlePressLangue = () => {
    router.push("settings/language");
  };

  const handlePressNotifications = () => {
    //router.push('/notifications');
  };

  const handlePressAide = () => {
    router.push("faq/Faq");
  };

  const handlePressAPropos = () => {
    router.push("aboutPage/AboutPage");
  };

  const handlePressConditions = () => {
    router.push("conditions/ConditionsPage");
  };

  const handlePressMisesAJour = () => {
    //router.push('/misesajour');
  };

  const handleLogout = async () => {
    await signout();
  };

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>{t("account.settings")}</Text>
        </View>
        {renderSettingOption(
          t("account.subscription"),
          "award",
          FontAwesome5,
          () => handlePressAbonnement(),
        )}
        {renderSettingOption(
          t("account.vehicles"),
          "car-alt",
          FontAwesome5,
          () => handlePressVehicules(),
        )}
        {renderSettingOptionWithDetail(
          t("account.language"),
          "language",
          MaterialIcons,
          currentLanguage == "en" ? "English" : "Français",
          () => handlePressLangue(),
        )}
        {renderSettingOption(
          t("account.notification"),
          "notifications",
          Ionicons,
          () => handlePressNotifications(),
        )}
        {renderSettingOption(
          t("account.Login"),
          "logout",
          MaterialIcons,
          () => handleLogout(),
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>
            {t("account.informationandother")}
          </Text>
        </View>
        {renderSettingOption(
          t("account.helpandfaq"),
          "help-with-circle",
          Entypo,
          () => handlePressAide(),
        )}
        {renderSettingOption(
          t("account.about"),
          "info-circle",
          FontAwesome,
          () => handlePressAPropos(),
        )}
        {renderSettingOption(
          t("account.conditionandregulation"),
          "balance-scale-left",
          FontAwesome5,
          () => handlePressConditions(),
        )}
        {renderSettingOptionWithDetail(
          t("account.updateandreinstallation"),
          "cycle",
          Entypo,
          appVersion,
          () => handlePressMisesAJour(),
        )}
      </View>
    </>
  );
}

const renderSettingOption = (title, iconName, IconComponent, onPress) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={styles.iconContainer}>
      <IconComponent name={iconName} size={21} style={styles.icon} />
    </View>
    <Text style={styles.optionText}>{title}</Text>
    <Entypo name="chevron-right" size={16} style={styles.arrowIcon} />
  </TouchableOpacity>
);

const renderSettingOptionWithDetail = (
  title,
  iconName,
  IconComponent,
  detail,
  onPress,
) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={styles.iconContainer}>
      <IconComponent name={iconName} size={24} style={styles.icon} />
    </View>
    <Text style={styles.optionText}>{title}</Text>
    <Text style={styles.detailText}>{detail}</Text>
    <Entypo name="chevron-right" size={16} style={styles.arrowIcon} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  section: {
    width: 334,
    paddingVertical: 20,
  },

  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    height: 50,
    width: 334,
    borderColor: "white",
    backgroundColor: "#F1F1F1",
    padding: 13,
  },

  sectionTitleText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1D3C42",
  },

  iconContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 15,
  },

  icon: {
    marginRight: 10,
    color: "#19363C",
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#19363C",
  },

  detailText: {
    color: "grey",
    fontSize: 12,
    marginRight: 5,
  },

  arrowIcon: {
    color: "#19363C",
  },
});
