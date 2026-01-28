// Dans ButtonGroup.js
import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
} from "react-native";

const MainPageButton = ({
  slideAnim,
  onNextPress,
  onRegisterPress,
  showRegisterButton,
  onSkipPress,
}) => (
  <View style={styles.buttonContainer}>
    {!showRegisterButton && (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <Animated.View
          style={[
            { transform: [{ translateX: slideAnim }] },
            { flex: 1, marginRight: 10 },
          ]}
        >
          <TouchableOpacity
            onPress={onSkipPress}
            style={[styles.button, styles.passButton]}
          >
            <Text style={styles.passButtonText}>Passer</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            { transform: [{ translateX: slideAnim }] },
            { flex: 1, marginLeft: 10 },
          ]}
        >
          <TouchableOpacity
            onPress={onNextPress}
            style={[styles.button, styles.nextButton]}
          >
            <Text style={styles.buttonText}>Suivant</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )}

    {showRegisterButton && (
      <Animated.View
        style={[
          { flex: 1, flexDirection: "row" },
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <TouchableOpacity
          onPress={onRegisterPress}
          style={[styles.button, styles.registerButton]}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      </Animated.View>
    )}
  </View>
);

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    flex: 1,
    height: 70,
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 10,
  },

  button: {
    width: "100%",
    height: 60,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#white",
    marginHorizontal: 5,
    shadowColor: "grey",
    shadowOpacity: 0.5,
    shadowOffset: { width: 4, height: 4 },
  },

  passButton: {
    backgroundColor: "#F1F1F1",
    borderColor: "white",
  },

  nextButton: {
    backgroundColor: "#0B8BA8",
    borderColor: "#0B8BA8",
  },

  registerButton: {
    backgroundColor: "#0B8BA8",
    borderColor: "#0B8BA8",
    marginTop: 10,
    marginHorizontal: -1,
  },

  buttonText: {
    color: "#ffffff",
    fontFamily: "System",
  },

  passButtonText: {
    color: "grey",
  },
});

export default MainPageButton;
