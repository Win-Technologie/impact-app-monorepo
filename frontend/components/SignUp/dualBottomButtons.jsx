// DualOptionButton.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DualOptionButton = ({ onPressCancel, onPressRegister }) => {
  return (
    <View style={styles.bottomButtonContainer}>
      <TouchableOpacity
        style={[styles.bottomButton, styles.cancelButton]}
        onPress={onPressCancel}
      >
        <Text style={styles.buttonText}>Annuler</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.bottomButton, styles.registerButton]}
        onPress={onPressRegister}
      >
        <Text style={styles.buttonText}>M'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomButtonContainer: {
    flexDirection: "row",
    width: "100%",
    height: 50,
  },

  bottomButton: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButton: {
    flex: 0.3,
    backgroundColor: "#19363C",
    borderBottomLeftRadius: 5,
  },

  registerButton: {
    flex: 0.7,
    backgroundColor: "#1B6878",
    borderBottomRightRadius: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    //fontWeight: 'bold',
  },
});

export default DualOptionButton;
