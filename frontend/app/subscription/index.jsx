import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const handleSubscribe = () => {
    router.push({
      pathname: "subscription/payment",
      params: { plan: selectedPlan },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#19363C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("subscription.headerTitle")}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Title */}
        <Text style={styles.mainTitle}>
          {t("subscription.mainTitle")} <Text style={styles.impactText}>{t("subscription.impactName")}</Text>
        </Text>

        {/* Feature Boxes */}
        <View style={styles.featuresContainer}>
          {/* Fonction Sentinelle */}
          <View style={styles.featureBox}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="videocam" size={32} color="#19363C" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t("subscription.feature1.title")}</Text>
              <Text style={styles.featureDescription}>
                {t("subscription.feature1.description")}
              </Text>
            </View>
          </View>

          {/* Plus aucune publicités */}
          <View style={styles.featureBox}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="card-text-outline" size={32} color="#19363C" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t("subscription.feature2.title")}</Text>
              <Text style={styles.featureDescription}>
                {t("subscription.feature2.description")}
              </Text>
            </View>
          </View>

          {/* Annulation sans pénalité */}
          <View style={styles.featureBox}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="block" size={32} color="#19363C" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t("subscription.feature3.title")}</Text>
              <Text style={styles.featureDescription}>
                {t("subscription.feature3.description")}
              </Text>
            </View>
          </View>
        </View>

        {/* Plan Selection */}
        <Text style={styles.sectionTitle}>{t("subscription.sectionTitle")}</Text>

        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === "monthly" && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan("monthly")}
          >
            <View style={styles.planContent}>
              <View style={styles.radioButton}>
                {selectedPlan === "monthly" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{t("subscription.plan.monthly")}</Text>
                <Text style={styles.planPrice}>{t("subscription.plan.monthlyPrice")}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === "annual" && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan("annual")}
          >
            <View style={styles.planContent}>
              <View style={styles.radioButton}>
                {selectedPlan === "annual" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{t("subscription.plan.annual")}</Text>
                <Text style={styles.planPrice}>{t("subscription.plan.annualPrice")}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>{t("subscription.terms.line1")}</Text>
          <Text style={styles.termsText}>{t("subscription.terms.line2")}</Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>
            Passer à un abonnement premium
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#19363C",
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#19363C",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    lineHeight: 30,
  },
  impactText: {
    color: "#CF8C58",
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  featureBox: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 5,
  },
  featureContent: {
    flex: 1,
    marginLeft: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#19363C",
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#19363C",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  planOption: {
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "white",
  },
  selectedPlan: {
    borderColor: "#0B8BA8",
    backgroundColor: "#F0F9FB",
  },
  planContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#0B8BA8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0B8BA8",
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#19363C",
    marginBottom: 3,
  },
  planPrice: {
    fontSize: 14,
    color: "#666",
  },
  termsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  termsText: {
    fontSize: 11,
    color: "#999",
    lineHeight: 16,
    marginBottom: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  subscribeButton: {
    backgroundColor: "#CF8C58",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
