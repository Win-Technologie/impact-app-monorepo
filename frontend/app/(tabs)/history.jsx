import { View, Text, StyleSheet, FlatList, StatusBar } from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
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

  useEffect(() => {
    const loadLocalHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem("local_accidents");
        const arr = stored ? JSON.parse(stored) : [];
        setHistoryData(arr);
      } catch (e) {
        console.error("loadLocalHistory error", e);
      }
    };
    loadLocalHistory();
  }, []);

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
        <AntDesign
          name="plus-circle"
          size={34}
          color="white"
          style={styles.icon}
        />
      </BoxComponent>

      <SearchInput />

      <FlatList
        data={historyData}
        renderItem={({ item }) => (
          <HistoryBoxComponent
            date={item.date}
            description={item.description}
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
