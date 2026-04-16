import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InfoDeBase() {
  const { t } = useTranslation();
  const [infos, setInfo] = useState([]);
  const params = useLocalSearchParams();
  const { individus } = params;
  const person = Number(individus) || 1;

  const next = () => {
    router.navigate("declarations/twoPersonnes/typeOfAccident");
  };

  useEffect(() => {
    const tab = [];

    for (let i = 0; i < person; i++) {
      if (i === 0) {
        tab.push({
          title: t("declaration.provideMyInfo"),
          description: t("declaration.provideMyInfoDescription"),
          subtitle: t("declaration.accessMyInfo"),
          number: i,
        });
      } else {
        tab.push({
          title: t("declaration.receiveInformation"),
          description: t("declaration.receiveInformationDescription"),
          subtitle: t("declaration.enterInformation"),
          number: i,
        });
      }
    }

    setInfo(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (number) => {
    if (number === 0) {
      router.push({ pathname: "declarations/twoPersonnes/InfoPersons/myInfo", params: { person: number } });
    } else {
      router.push({ pathname: "declarations/twoPersonnes/InfoPersons/otherInfo", params: { person: number } });
    }
  };

  const InfoCard = ({ item }) => (
    <TouchableOpacity style={styles.box} onPress={() => goTo(item.number)}>
      <View style={{ padding: 10 }}>
        <View style={{ paddingBottom: 10, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>{item.title}</Text>

          {item.number > 0 && (
            <View style={{ width: 25, height: 25, backgroundColor: "#CF8C58", borderRadius: 5, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#fff" }}>{item.number}</Text>
            </View>
          )}
        </View>

        <View>
          <Text style={{ fontWeight: "400", color: "#19363C", fontSize: 14 }}>{item.description}</Text>
        </View>
      </View>

      <View style={styles.boxFooter}>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ color: "#FFFFFF", fontWeight: "400", fontSize: 14 }}>{item.subtitle} {"  "}</Text>
          <MaterialIcons name="chevron-right" color="#FFFFFF" size={20} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 20, alignItems: "center" }}>
        <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => router.back()}>
          <AntDesign name="arrow-left" size={20} color="#19363C" style={{ fontWeight: "200" }} />
          <Text style={{ color: "#19363C" }}>{"   "}{t("back")}</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>{t("declaration.basicInformationTitle")}</Text>
        </View>
      </View>

      <View style={{ marginBottom: 100 }}>
        <FlatList data={infos} renderItem={InfoCard} keyExtractor={(item) => item.number.toString()} />
      </View>

      <View style={styles.footContainer}>
        <TouchableOpacity onPress={next} style={{ backgroundColor: "#0B8BA8", height: 50, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "500" }}> {t("buttons.continue")} </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 23,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  box: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FAFAFA",
    backgroundColor: "#FAFAFA",
    position: "relative",
    marginTop: 15,
    height: 200,
  },

  boxFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 45,
    backgroundColor: "#19363C",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 10,
  },

  footContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
