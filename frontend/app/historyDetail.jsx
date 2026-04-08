import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function HistoryDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("local_accidents");
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
      "Supprimer",
      "Voulez-vous vraiment supprimer cette déclaration ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const stored = await AsyncStorage.getItem("local_accidents");
              const arr = stored ? JSON.parse(stored) : [];
              const filtered = arr.filter((x) => x.key !== id);
              await AsyncStorage.setItem("local_accidents", JSON.stringify(filtered));
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Text style={styles.headerBackIcon}>←</Text>
          <Text style={styles.headerBackText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.headerDelete}>
          <Text style={styles.headerDeleteText}>🗑 Supprimer</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.subtle}>Heure: {formatTime()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations principales</Text>
          <Row label="Lieu" value={data.accidentLocation || data.location || data.place || "-"} />
          <Row label="Type" value={data.type || data.accidentType || data.accitendType} />
          <Row label="Résumé" value={data.otherSpecification || data.vehicleDamageDescription || data.summary || "-"} />
        </View>

        {data.owner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personne</Text>
            <Row label="Nom" value={`${data.owner.name || ""} ${data.owner.lastName || ""}`.trim()} />
            <Row label="Téléphone" value={data.owner.phone} />
            <Row label="Email" value={data.owner.email} />
            <Row label="Adresse" value={data.owner.address} />
          </View>
        )}

        {(data.vehicle || (data.vehicles && data.vehicles.length)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Véhicule</Text>
            {data.vehicle ? (
              <>
                <Row label="Marque" value={data.vehicle.brand} />
                <Row label="Modèle" value={data.vehicle.model} />
                <Row label="Plaque" value={data.vehicle.plate} />
              </>
            ) : (
              data.vehicles.map((v, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Row label={`Véhicule ${i + 1} - Propriétaire`} value={v.personalDetails?.name || v.personalDetails?.fullName} />
                  <Row label={`V${i + 1} Plaque`} value={v.vehicleDetails?.registrationCertificate?.licensePlateNumber} />
                </View>
              ))
            )}
          </View>
        )}

        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.imagesRow}>
              {photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.image} />
              ))}
            </View>
          </View>
        )}

        {item.people && item.people.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personnes impliquées</Text>
            {item.people.map((p, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.rowLabel}>{p.name || `Personne ${i + 1}`}</Text>
                {p.imageUri ? <Image source={{ uri: p.imageUri }} style={styles.personThumb} /> : null}
              </View>
            ))}
          </View>
        )}

        {/* raw data removed */}
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
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: "white" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 8 },
  headerBack: { flexDirection: "row", alignItems: "center" , padding: 6},
  headerBackText: { marginLeft: 8, color: "#19363C", fontWeight: "600" },
  headerBackIcon: { fontSize: 20, color: "#19363C" },
  headerDelete: { padding: 8 },
  headerDeleteText: { color: "#c62828", fontWeight: "600" },
});
