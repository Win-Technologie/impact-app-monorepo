import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";

export default function SmallBox({
  title,
  subtitle,
  completion,
  actualstep,
  nbstep,
  onPress,
}) {
  // Ici, completion est supposé être un nombre entre 0 et 100
  //const isCompleted = completion === 100;
  const isCompleted = actualstep === nbstep;

  return (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={styles.contentContainer}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>
            {isCompleted ? "✓" : `${((actualstep / nbstep) * 100).toFixed(0)}%`}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <Entypo name="chevron-right" size={24} style={styles.arrowIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 334,
    height: 80,
    borderRadius: 5,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#19363C",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  progressText: {
    color: "#19363C",
    fontSize: 14,
  },
  textContainer: {
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    color: "#19363C",
    //fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#19363C",
  },
  arrowIcon: {
    color: "#19363C",
  },
});
