import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function SearchInput({ value = "", onChangeText = () => {} }) {
  const handleClear = () => {
    onChangeText("");
  };

  return (
    <View style={styles.container}>
      <AntDesign
        name="search"
        size={20}
        color="grey"
        style={styles.iconLeft}
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        placeholder="Chercher une date d'accident"
        placeholderTextColor="grey"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.iconRight}>
          <AntDesign name="closecircle" size={20} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F1F1",
    borderRadius: 5,
    marginTop: 15,
    shadowColor: "grey",
    shadowOpacity: 0.5,
    shadowOffset: { width: 2, height: 2 },
    width: "100%",
  },

  input: {
    height: 50,
    paddingVertical: 10,
    paddingLeft: 30,
    paddingRight: 10,
    fontSize: 16,
    marginLeft: 10,
  },

  iconLeft: {
    position: "absolute",
    left: 10,
  },

  iconRight: {
    position: "absolute",
    right: 10,
  },
});
