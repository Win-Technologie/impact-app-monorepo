// Stepper.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import { DeclarationState } from "../../GlobalState/DeclarationState";

const Stepper = ({ currentStep, totalSteps, displayStep }) => {
  // Prefer an explicit displayStep prop, then a global declaration step, then local currentStep
  const globalDeclaration = useRecoilValue(DeclarationState);
  const globalStep = globalDeclaration && typeof globalDeclaration.step === "number" ? globalDeclaration.step : null;
  // Always show step as 1-based (never 0)
  let visibleStep = displayStep ?? globalStep ?? currentStep;
  if (!visibleStep || visibleStep < 1) visibleStep = 1;
  const normalizedStep = Math.min(Math.max(visibleStep, 1), totalSteps);
  const progress = (normalizedStep / totalSteps) * 100;
  //console.log(`Progress width: ${progress}%`);

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text>{t("declaration.step", { current: visibleStep, total: totalSteps })}</Text>
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
