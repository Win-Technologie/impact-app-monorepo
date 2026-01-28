import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const InputField = ({
  placeholder,
  secureTextEntry,
  onChangeText,
  icon,
  onIconPress,
}) => (
  <View style={[styles.inputContainer]}>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="black"
      secureTextEntry={secureTextEntry}
      style={styles.textInput}
      onChangeText={onChangeText}
    />
    {icon && onIconPress && (
      <TouchableOpacity onPress={onIconPress} style={styles.icon}>
        <Ionicons name={icon} size={24} color="black" />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 48,
    backgroundColor: "white",
    borderColor: "white",
    borderRadius: 2,
    borderWidth: 1,
    paddingLeft: 22,
    marginBottom: 20,
    marginLeft: -17,
  },
  textInput: {
    flex: 1,
    marginRight: 10, // Laissez un peu d'espace pour l'icône
  },
  icon: {
    position: "absolute",
    right: 10, // Augmentez si l'icône est trop à droite
  },
});

export default InputField;
