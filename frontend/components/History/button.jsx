import { Text, TouchableOpacity, StyleSheet } from "react-native";
export default function Button({ onPress, style, children }) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    // Styles de base du bouton ici si nécessaire
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});
