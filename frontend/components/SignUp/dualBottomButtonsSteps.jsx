// DualOptionButton.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DualOptionButton = ({
  onPressBack,
  onPressContinue,
  continueLabel = "Continuer",
}) => {
  return (
    <View style={styles.bottomButtonContainer}>
      <TouchableOpacity
        style={[styles.bottomButton, styles.backButton]}
        onPress={onPressBack}
        accessibilityLabel="Retour"
      >
        <Text style={styles.backArrowText}>←</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.bottomButton, styles.continueButton]}
        onPress={onPressContinue}
      >
        <Text style={styles.buttonText}>{continueLabel}</Text>
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
  backButton: {
    flex: 0.3,
    backgroundColor: "#19363C",
    //borderBottomLeftRadius: 5,
  },
  continueButton: {
    flex: 0.7,
    backgroundColor: "#1B6878",
    // borderBottomRightRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    //fontWeight: 'bold',
  },
  backArrowText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
});

export default DualOptionButton;
