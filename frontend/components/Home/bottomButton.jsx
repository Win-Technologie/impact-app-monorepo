import { useEffect, useRef } from "react";
import { Text, Animated, TouchableOpacity } from "react-native";

export default function BottomButton({ onPress, style, children }) {
  // Définir la valeur initiale de l'animation hors de l'écran
  const slideUpAnim = useRef(new Animated.Value(1000)).current; // Commence en bas de l'écran

  useEffect(() => {
    // Déclenche l'animation au montage du composant
    Animated.spring(slideUpAnim, {
      toValue: 0, // Arrive à sa position finale
      velocity: 2, // Vitesse de l'animation
      tension: 1, // Contrôle la rigidité du ressort
      friction: 5, // Contrôle la résistance de l'animation
      useNativeDriver: true,
    }).start();
  }, [slideUpAnim]);

  return (
    <Animated.View
      style={[style, { transform: [{ translateY: slideUpAnim }] }]}
    >
      <TouchableOpacity onPress={onPress}>
        <Text>{children}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
