import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DateInputComponent from '../../../components/SignUp/datepicker';
import DualOptionButtonStep from '../../../components/SignUp/dualBottomButtonsSteps';

const Dob = () => {
  const handlePressBack = () => {
    console.log('Back pressed');
   
  };

  const handlePressContinue = () => {
    console.log('Continue pressed');
    
  };

  return (
    <View style={styles.container}>
      {/* La vue content qui organise ses enfants en flex-start */}
      <View style={styles.content}>
        <Text style={styles.title}>Quelle est votre date de naissance?</Text>
        <DateInputComponent />
      </View>
      <View style={styles.buttonContainer}>
        <DualOptionButtonStep
          onPressCancel={handlePressBack}
          onPressRegister={handlePressContinue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 235,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative', // Pour positionner le bouton en absolu
  },
  title: {
    fontSize: 24,
    marginTop: 15,
    marginBottom: 20,
    marginHorizontal:8.5,
   
  },
  content: {
    alignItems: 'flex-start', 
    width: '100%',
    alignSelf:'stretch' 
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Dob;
