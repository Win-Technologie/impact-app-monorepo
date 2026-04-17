import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function HistoryDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const { t } = useTranslation();

  const getHistoryKey = async () => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem("user"));
      const userId = userData?.user?._id || userData?.user?.id || userData?._id;
      return userId ? `local_accidents_${userId}` : "local_accidents";
    } catch (e) {
      return "local_accidents";
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const key = await getHistoryKey();
        const stored = await AsyncStorage.getItem(key);
        const arr = stored ? JSON.parse(stored) : [];
        const found = arr.find((x) => x.key === id);
        if (found) setItem(found);
        else router.back();
      } catch (e) {
        console.error("historyDetail load error", e);
        router.back();
      }
    };
    load();
  }, [id]);

  if (!item) return null;

  const data = item.data || {};

  // determine photos list
  const photos =
    (item.accidentImageUri && (Array.isArray(item.accidentImageUri) ? item.accidentImageUri : [item.accidentImageUri])) || data.photos || [];

  // helper to render a section row if value exists
  const Row = ({ label, value }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{String(value)}</Text>
      </View>
    );
  };

  const handleDelete = () => {
    Alert.alert(
      t("historyPage.delete", { defaultValue: "Delete" }),
      t("historyPage.deleteConfirm", { defaultValue: "Are you sure you want to delete this report?" }),
      [
        { text: t("buttons.cancel", { defaultValue: "Cancel" }), style: "cancel" },
        {
          text: t("historyPage.delete", { defaultValue: "Delete" }),
          style: "destructive",
          onPress: async () => {
            try {
              const key = await getHistoryKey();
              const stored = await AsyncStorage.getItem(key);
              const arr = stored ? JSON.parse(stored) : [];
              const filtered = arr.filter((x) => x.key !== id);
              await AsyncStorage.setItem(key, JSON.stringify(filtered));
              router.back();
            } catch (e) {
              console.error("delete error", e);
            }
          },
        },
      ],
    );
  };

  // format time: prefer declared hour/minute, fallback to ISO time from item.date
  const formatTime = () => {
    const h = data.hour ?? data.accidentHour ?? data.hours ?? data.time ?? null;
    const m = data.minute ?? data.accidentMinute ?? data.minutes ?? null;
    if (h !== null && m !== null) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      return `${hh}:${mm}`;
    }
    try {
      const d = new Date(item.date);
      return d.toLocaleTimeString();
    } catch (e) {
      return "";
    }
  };

  // determine a short vehicle label to show in the header (brand/model/plate)
  const getVehicleLabel = () => {
    // look in multiple possible locations for vehicle info
    const candidate =
      data.vehicle ||
      (data.vehicles && data.vehicles.length ? data.vehicles[0] : null) ||
      item.vehicle ||
      (item.vehicles && item.vehicles.length ? item.vehicles[0] : null) ||
      data.vehicleDetails ||
      null;
    if (!candidate) return null;
    const brand =
      candidate.brand ||
      candidate.make ||
      candidate.marque ||
      candidate.vehicleDetails?.make ||
      "";
    const model = candidate.model || candidate.modele || candidate.vehicleDetails?.model || "";
    const plate =
      candidate.plate ||
      candidate.registrationNumber ||
      candidate.licensePlate ||
      candidate.vehicleDetails?.registrationCertificate?.licensePlateNumber ||
      candidate.vehicleDetails?.licensePlateNumber ||
      "";
    const parts = [];
    if (brand) parts.push(brand);
    if (model) parts.push(model);
    if (plate) parts.push(plate);
    return parts.join(" ") || null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Text style={styles.headerBackIcon}>←</Text>
          <Text style={styles.headerBackText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.headerDelete}>
          <Text style={styles.headerDeleteText}>{t("historyPage.delete")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.subtle}>{t("historyPage.time")}: {formatTime()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("historyPage.summary")}</Text>
          <Text style={styles.summaryText}>{data.otherSpecification || data.vehicleDamageDescription || data.summary || "-"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("historyPage.mainInformation")}</Text>
          <Row label={t("historyPage.location")} value={data.accidentLocation || data.location || data.place || "-"} />
          <Row label={t("historyPage.type")} value={data.type || data.accidentType || data.accitendType} />
        </View>

        {data.owner && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("historyPage.person")}</Text>
              <Row label={t("historyPage.name")} value={`${data.owner.name || ""} ${data.owner.lastName || ""}`.trim()} />
              <Row label={t("historyPage.phone")} value={data.owner.phone} />
              <Row label={t("historyPage.email")} value={data.owner.email} />
              <Row label={t("historyPage.address")} value={data.owner.address} />
          </View>
        )}

        {(data.vehicle || (data.vehicles && data.vehicles.length)) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("historyPage.vehicle")}</Text>
              {data.vehicle ? (
              <>
                  <Row label={t("historyPage.make")} value={data.vehicle.brand} />
                  <Row label={t("historyPage.model")} value={data.vehicle.model} />
                  <Row label={t("historyPage.plate")} value={data.vehicle.plate || data.vehicle.license_plate} />
              </>
            ) : (
              data.vehicles.map((v, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Row label={`${t("historyPage.vehicle")} ${i + 1}`} value={v.car?.model || v.vehicleDetails?.model || v.car?.registration || "-"} />
                  <Row label={t("historyPage.plate")} value={v.car?.license_plate || v.vehicleDetails?.registrationCertificate?.licensePlateNumber || "-"} />
                </View>
              ))
            )}
          </View>
        )}

        {photos.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("historyPage.photos")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photoThumb} />
              ))}
            </ScrollView>
          </View>
        )}

        {item.people && item.people.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("historyPage.peopleInvolved")}</Text>
            {item.people.map((p, i) => (
              <View key={i} style={styles.personRow}>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{p.name || `Personne ${i + 1}`}</Text>
                  <Text style={styles.personSub}>{p.role || p.relation || ""}</Text>
                </View>
                {p.imageUri ? <Image source={{ uri: p.imageUri }} style={styles.personThumb} /> : null}
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scroll: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 12 },
  section: { marginBottom: 12 },
  sectionTitle: { fontWeight: "bold", marginBottom: 6 },
  imagesRow: { flexDirection: "row", flexWrap: "wrap" },
  image: { width: 120, height: 120, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  mono: { fontFamily: "monospace", fontSize: 12, color: "#333" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  rowLabel: { color: "#666", width: 120 },
  rowValue: { flex: 1, textAlign: "right" },
  personThumb: { width: 40, height: 40, borderRadius: 20 },
  rawToggle: { paddingVertical: 8 },
  rawToggleText: { color: "#0B8BA8" },
  photoScroll: { marginTop: 8 },
  photoThumb: { width: 140, height: 120, borderRadius: 8, marginRight: 8 },
  card: { backgroundColor: "white", borderRadius: 10, padding: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  summaryText: { fontSize: 15, color: "#333", lineHeight: 20 },
  personRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  personInfo: { flex: 1 },
  personName: { fontSize: 15, color: "#222" },
  personSub: { fontSize: 13, color: "#666" },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: "white" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 8 },
  headerBack: { flexDirection: "row", alignItems: "center" , padding: 6},
  headerBackText: { marginLeft: 8, color: "#19363C", fontWeight: "600" },
  headerBackIcon: { fontSize: 20, color: "#19363C" },
  headerDelete: { padding: 8 },
  headerDeleteText: { color: "#c62828", fontWeight: "600" },
});
