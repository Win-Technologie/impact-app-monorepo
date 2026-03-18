// Stepper.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Stepper = ({ currentStep, totalSteps, displayStep }) => {
  // Always show step as 1-based (never 0)
  let visibleStep = displayStep ?? currentStep;
  if (!visibleStep || visibleStep < 1) visibleStep = 1;
  const normalizedStep = Math.min(Math.max(visibleStep, 1), totalSteps);
  const progress = (normalizedStep / totalSteps) * 100;
  //console.log(`Progress width: ${progress}%`);

  return (
    <View style={styles.container}>
      <Text>Étape {visibleStep} sur {totalSteps}</Text>
      <View style={styles.progressBarBackground}>
        <View
          style={[styles.progressBarForeground, { width: `${progress}%` }]}
        />
      </View>
      {/*<Text>{progress.toFixed(0)}%</Text>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  progressBarBackground: {
    width: "100%",
    height: 5,
    backgroundColor: "#e0e0e0",
  },
  progressBarForeground: {
    height: 5,
    backgroundColor: "#CF8C58",
    borderRadius: 5,
  },
});

export default Stepper;
