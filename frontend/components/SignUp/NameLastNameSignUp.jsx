import { StyleSheet, Text, View, TextInput } from "react-native";
import React from "react";

export default function NameLastNameSignUp({ text }) {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.titleText}>{text}</Text>
      <TextInput style={styles.inputInsurance} placeholder="Prénom" />
      <TextInput style={styles.inputInsurance} placeholder="Nom" />
    </View>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: 23,
    marginBottom: 30,
    fontWeight: "bold",
    color: "#19363C",
  },
  contentContainer: {
    gap: 5,
  },
  inputInsurance: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
});
