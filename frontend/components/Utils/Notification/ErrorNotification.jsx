import { StyleSheet, Text, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
/**
 * composant permettant d'afficher les erreurs
 * @param {string} - text contenant l'erreur
 * @returns
 */
export default function ErrorNotification({ error }) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.icon}>
        <FontAwesome6 name="square-xmark" size={30} color="#ed4c4c" />
      </View>
      <View>
        <Text style={styles.textError}>{error}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    paddingHorizontal: 10,
    backgroundColor: "#ffe3e3",
    borderRadius: 5,
    minWidth: "100%",
    height: 70,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    gap: 4,
  },
  icon: {
    marginLeft: 3,
  },
  textError: {
    marginLeft: 4,
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "medium",
    textAlign: "left",
  },
});
