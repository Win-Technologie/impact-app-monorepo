import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";

// Stylesheet pour les composants du bouton ( il se trouve à l'extérieur du composant afin d'éviter le re-render)
const styles = StyleSheet.create({
  containerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  buttonText: {
    textAlign: "center",
  },
});

export default function ButtonOption({ text, isSelected, onPressOption }) {
  // Référence pour stocker l'état de l'animation
  const animation = useRef(new Animated.Value(0)).current;

  // Effet pour démarrer l'animation lorsque isSelected change
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isSelected ? 1 : 0, // Valeur finale de l'animation
      duration: 50,
      useNativeDriver: false, // Utilisation du nativeDriver natif désactivée pour la compatibilité
    }).start();
  }, [isSelected]);

  // Changement de la couleur de fond en fonction de l'état de sélection
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["white", "#0B8BA8"],
  });

  // Changement de la couleur du texte en fonction de l'état de sélection
  const textColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["black", "white"],
  });

  return (
    <TouchableOpacity onPress={onPressOption}>
      <Animated.View style={[styles.containerButton, { backgroundColor }]}>
        <Animated.Text style={[styles.buttonText, { color: textColor }]}>
          {text}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
