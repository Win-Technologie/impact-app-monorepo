import React, { useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilState } from "recoil";
import { notificationsPrefState } from "../../../GlobalState/NotificationsPrefState";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "notificationsPrefs";

function NotificationRow({ icon, title, subtitle, value, onToggle }) {
  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.left}>
        <View style={rowStyles.iconBox}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <View style={rowStyles.text}>
          <Text style={rowStyles.title}>{title}</Text>
          {subtitle ? <Text style={rowStyles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
}

export default function NotificationSettings() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useRecoilState(notificationsPrefState);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json);
          setPrefs((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.warn("Failed to load notification preferences", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleKey = async (key) => {
    try {
      const next = { ...prefs, [key]: !prefs[key] };
      setPrefs(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!next[key]) {
        Alert.alert(t("notifications.disabledTitle"), t("notifications.disabledMessage"));
      }
    } catch (e) {
      console.warn("Failed to save notification preference", e);
    }
  };

  if (loading)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#19363C" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t("notifications.title")}</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        <Text style={styles.header}>{t("notifications.header")}</Text>

        <Text style={styles.sectionTitle}>{t("notifications.categories")}</Text>

        <NotificationRow
          icon="notifications-outline"
          title={t("notifications.generalTitle")}
          subtitle={t("notifications.generalSubtitle")}
          value={!!prefs.general}
          onToggle={() => toggleKey("general")}
        />

        <NotificationRow
          icon="cloud-download-outline"
          title={t("notifications.updatesTitle")}
          subtitle={t("notifications.updatesSubtitle")}
          value={!!prefs.updates}
          onToggle={() => toggleKey("updates")}
        />

        <NotificationRow
          icon="pricetag-outline"
          title={t("notifications.promotionsTitle")}
          subtitle={t("notifications.promotionsSubtitle")}
          value={!!prefs.promotions}
          onToggle={() => toggleKey("promotions")}
        />

        <NotificationRow
          icon="shield-checkmark-outline"
          title={t("notifications.securityTitle")}
          subtitle={t("notifications.securitySubtitle")}
          value={!!prefs.security}
          onToggle={() => toggleKey("security")}
        />

        <Text style={styles.help}>{t("notifications.helpText")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#CF8C58",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  text: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 2 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F8" },
  container: { flex: 1 },
  nav: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#F6F7F8",
  },
  backButton: { padding: 6, marginRight: 8 },
  navTitle: { fontSize: 18, fontWeight: "600", color: "#19363C" },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 8, color: "#19363C" },
  sectionTitle: { fontSize: 14, color: "#666", marginBottom: 8 },
  help: { color: "#666", marginTop: 8, fontSize: 13 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
