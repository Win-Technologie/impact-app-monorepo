import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const ConditionsPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleBackPress = () => {
    router.back();
  };

  const handleConditionPress = () => {
    router.push("./ServicesTerms");
  };

  const handlePolicyPress = () => {
    router.push("./PrivacyPolicy");
  };

  const handleLearnMorePress = () => {
    router.push("aboutPage/AboutPage");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
          <Text style={styles.backText}>{t("common.back")}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{t("termsAndConditions.title")}</Text>
        <TouchableOpacity style={styles.card} onPress={handleConditionPress}>
          <MaterialIcons
            name="notes"
            size={30}
            color="black"
            style={styles.iconContainer}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {t("termsAndConditions.serviceTermsTitle")}
            </Text>
            <Text style={styles.cardSubtitle}>
              {t("termsAndConditions.serviceTermsSubtitle")}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={handlePolicyPress}>
          <FontAwesome5
            name="lock"
            size={40}
            color="black"
            style={styles.icon}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {t("termsAndConditions.privacyPolicyTitle")}
            </Text>
            <Text style={styles.cardSubtitle}>
              {t("termsAndConditions.privacyPolicySubtitle")}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#000" />
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleLearnMorePress}
        >
          <Text style={styles.footerButtonText}>
            {t("termsAndConditions.learnMoreButton")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  footerButton: {
    backgroundColor: "#1B6878",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  footerButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 5,
    paddingVertical: 5,
    marginRight: 10,
  },
});

export default ConditionsPage;
