// Stepper.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Stepper = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep) / totalSteps) * 100;
  //console.log(`Progress width: ${progress}%`);

  return (
    <View style={styles.container}>
          <Text>Étape {currentStep == totalSteps ? currentStep : currentStep+1} sur {totalSteps}</Text>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarForeground, { width: `${progress}%` }]} />
      </View>
      {/*<Text>{progress.toFixed(0)}%</Text>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 5,
    backgroundColor: '#e0e0e0',
    
  },
  progressBarForeground: {
    height: 5,
    backgroundColor: '#CF8C58',
    borderRadius: 5,
  },
});

export default Stepper;
