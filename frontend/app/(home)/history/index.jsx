import { SafeAreaView, View, Text, StyleSheet, FlatList } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import BoxComponent from "../../../components/Home/boxComponent";
import SearchInput from "../../../components/History/searchInput";
import HistoryBoxComponent from "../../../components/History/historyBox";

// Données d'exemple pour la démonstration
const historyData = [
  {
    key: "1",
    date: "15 Mar 2023",
    description: "Accident mineur sans blessures",
    people: [
      {
        name: "John Doe",
        imageUri: "../../../assets/splashscreen.png",
      },
      {
        name: "Jane Doe",
        imageUri: "../../../assets/splashscreen.png",
      },
    ],
    accidentImageUri: "../../../assets/splashscreen.png",
  },
  {
    key: "2",
    date: "22 Mar 2023",
    description: "Collision arrière avec dommages matériels",
    people: [
      {
        name: "Alice Brown",
        imageUri: "../../../assets/google.png",
      },
    ],
    accidentImageUri: "../../../assets/facebook.png",
  },
  {
    key: "3",
    date: "22 Mar 2023",
    description: "Collision arrière avec dommages matériels",
    people: [
      {
        name: "Alice Brown",
        imageUri: "../../../assets/google.png",
      },
    ],
    accidentImageUri: "../../../assets/facebook.png",
  },
];

export default function HistoryPage() {
  return (
    <SafeAreaView style={styles.container}>
      <BoxComponent width={334} height={100} style={styles.box}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Historique</Text>
          <Text style={styles.text2}>{0} accidents</Text>
        </View>
        <AntDesign
          name="pluscircle"
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
            accidentImageUri={item.accidentImageUri}
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
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    // justifyContent: 'center',
  },
  box: {
    borderRadius: 5,
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
