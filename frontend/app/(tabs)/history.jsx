import { View, Text, StyleSheet, FlatList, StatusBar } from "react-native";
import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import BoxComponent from "../../components/Home/boxComponent";
import SearchInput from "../../components/History/searchInput";
import HistoryBoxComponent from "../../components/History/historyBox";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function HistoryPage() {
  const { t } = useTranslation();
  const [historyData, setHistoryData] = useState([]);
  const [query, setQuery] = useState("");

  const loadLocalHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem("local_accidents");
      const arr = stored ? JSON.parse(stored) : [];
      setHistoryData(arr);
    } catch (e) {
      console.error("loadLocalHistory error", e);
    }
  };

  useEffect(() => {
    loadLocalHistory();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLocalHistory();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        animated={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <BoxComponent height={100} style={[styles.box, { marginTop: 0 }]}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{t("historyPage.title")}</Text>
          <Text style={styles.text2}>
            {historyData.length} {t("historyPage.accidents")}
          </Text>
        </View>
        {/* plus icon removed from Historique header */}
      </BoxComponent>

      <SearchInput value={query} onChangeText={setQuery} />

      <FlatList
        data={historyData.filter((item) => {
          if (!query || query.trim() === "") return true;
          const q = query.trim().toLowerCase();
          try {
            const d = new Date(item.date);
            const iso = d.toISOString();
            const ymd = iso.slice(0, 10);
            const loc = d.toLocaleDateString();
            const full = d.toLocaleString();
            const desc = (item.description || "").toLowerCase();
            return (
              (iso && iso.toLowerCase().includes(q)) ||
              (ymd && ymd.includes(q)) ||
              (loc && loc.toLowerCase().includes(q)) ||
              (full && full.toLowerCase().includes(q)) ||
              desc.includes(q)
            );
          } catch (e) {
            return (item.description || "").toLowerCase().includes(q);
          }
        })}
        renderItem={({ item }) => (
          <HistoryBoxComponent
            date={item.date}
            description={(item.data && item.data.otherSpecification) || item.description}
            people={item.people}
            accidentImageUri={item.accidentImageUri || (item.data && item.data.photos)}
            onPress={() => router.push({ pathname: "historyDetail", params: { id: item.key } })}
          />
        )}
        keyExtractor={(item) => item.key}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },

  box: {
    borderRadius: 5,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "grey",
    padding: 15,
    backgroundColor: "#19363C",
    position: "relative",
    marginTop: 15,
  },

  textContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  text: {
    color: "white",
    fontSize: 18,
  },
  text2: {
    color: "white",
    marginTop: 15,
  },
  icon: {
    position: "absolute",
    right: 30,
    top: "50%",
    marginTop: -5,
  },
});
