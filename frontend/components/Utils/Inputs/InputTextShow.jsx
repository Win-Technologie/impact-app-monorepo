import { StyleSheet, Text, View, TextInput } from "react-native";
import React, { useEffect, useState } from "react";

function InputTextShow({ label, info, editable = true, onChange, name }) {
  const [value, setValue] = useState(info ?? "");

  useEffect(() => {
    setValue(info ?? "");
  }, [info]);

  const handleChange = (text) => {
    setValue(text);
    if (typeof onChange === "function") onChange(name, text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        editable={editable}
        onChangeText={handleChange}
      />
    </View>
  );
}

export default InputTextShow;

const styles = StyleSheet.create({
  container: {
    // Width:'100%'
  },

  label: {
    color: "#b4b4b5",
    marginBottom: 5,
    fontSize: 12,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 7,
    backgroundColor: "#fafafa",
  },
});
