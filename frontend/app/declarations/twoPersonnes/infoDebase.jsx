import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { RadioButton } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InfoDeBase() {
  const { t, i18n } = useTranslation();
  const [infos, setInfo] = useState([]);
  const params = useLocalSearchParams();
  const { individus } = params;
  const person = Number(individus);

  const next = () => {
    router.navigate("declarations/twoPersonnes/typeOfAccident");
  };

  useEffect(() => {
    var tab = [];

    for (var i = 0; i < person; i++) {
      if (i == 0) {
        tab = [
          ...tab,
          {
            title: "Fournir mes informations",
            description:
              "Fournissez vos informations aux autres individus impliqués en fournissant manuellement vos données personnelles.",
            subtitle: "Accéder à mes informations",
            number: i,
          },
        ];
      } else {
        tab = [
          ...tab,
          {
            title: "Recevoir des informations",
            description:
              "Recevez les informations des autres individus impliqués en rentrant manuellement leurs données personnelles.",
            subtitle: "Saisir des informations",
            number: i,
          },
        ];
      }
    }

    setInfo(tab);
  }, []);

  const goTo = (number) => {
    if (number == 0) {
      router.navigate("declarations/twoPersonnes/InfoPersons/myInfo");
    } else {
      router.navigate("declarations/twoPersonnes/InfoPersons/otherInfo");
    }
  };

  const InfoCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.box}
        onPress={() => {
          goTo(item.number);
        }}
      >
        <View style={{ padding: 10 }}>
          <View
            style={{
              paddingBottom: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}
            >
              {item.title}
            </Text>
            {item.number > 0 && (
              <View
                style={{
                  width: 25,
                  height: 25,
                  backgroundColor: "#CF8C58",
                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {item.number > 0 && (
                  <Text style={{ color: "#fff" }}>{item.number}</Text>
                )}
              </View>
            )}
          </View>

          <View>
            <Text style={{ fontWeight: "400", color: "#19363C", fontSize: 14 }}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.boxFooter}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: "#FFFFFF", fontWeight: "400", fontSize: 14 }}>
              {item.subtitle} {"  "}
            </Text>
            <MaterialIcons name="chevron-right" color="#FFFFFF" size={20} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
            name="arrow-left"
            size={20}
            color="#19363C"
            style={{ fontWeight: "200" }}
          />
          <Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
        </TouchableOpacity>

        <View>
          <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>
            Informations de base
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 100 }}>
        <FlatList
          data={infos}
          renderItem={InfoCard}
          keyExtractor={(item) => item.number.toString()}
        />
      </View>

      <View style={styles.footContainer}>
        <TouchableOpacity
          onPress={next}
          style={{
            backgroundColor: "#0B8BA8",
            height: 50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 500 }}>
            {" "}
            Continuer{" "}
          </Text>
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

  button: {
    position: "absolute",
    bottom: 0,
    margin: 20,
    backgroundColor: "#0B8BA8",
    paddingVertical: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
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
