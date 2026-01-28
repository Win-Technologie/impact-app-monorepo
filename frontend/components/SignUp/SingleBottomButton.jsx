// SingleOptionButton.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SingleBottomButton({ onPress, children }) {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.singleButton]}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>{children}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    height: 50,
  },

  button: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B6878", // Feel free to adjust the color
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    //fontWeight: 'bold',
  },
});
