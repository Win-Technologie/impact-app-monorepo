// CheckboxWithText.js
import React from "react";
import { View, Text } from "react-native";
import Checkbox from "expo-checkbox";

const CheckboxWithText = ({
  isChecked,
  onCheck,
  text,
  onPressText,
  textStyle,
  checkboxStyle,
}) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Checkbox
      style={[{ marginRight: 8 }, checkboxStyle]}
      value={isChecked}
      onValueChange={onCheck}
    />
    <Text style={{ fontSize: 13, color: "#19363C" }}>
      {text}
      <Text
        style={[{ color: "blue", textDecorationLine: "underline" }, textStyle]}
        onPress={onPressText}
      >
        conditions d'utilisation
      </Text>
      <Text> du service</Text>
    </Text>
  </View>
);

export default CheckboxWithText;
