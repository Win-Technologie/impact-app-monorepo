import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TextInputLarge from '../../../components/SignUp/textInputLarge'; 
import AnimatedButton from '../../../components/SignUp/animatedButton'; 
import DualOptionButton from '../../../components/SignUp/dualBottomButtons';

const SignUpStep1 = ({ onNext }) => {
  const [name, setName] = useState('');
  const [surname,setSurname] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  const handleSelectGender = (gender) => {
    console.log(`handleSelectGender: ${gender}`);
    setSelectedGender(gender);
  };

  const handlePressCancel = () => {
    console.log('Cancel pressed');
    // Gérez l'action d'annulation ici, par exemple, revenir à l'écran précédent
  };

  const handlePressRegister = () => {
    console.log('Register pressed');
    onNext(); // Vous pouvez appeler onNext ou une autre fonction pour gérer l'inscription
  };


  // GenderButton dans SignUpStep1.js
const GenderButton = ({ title, gender }) => {
  const isSelected = selectedGender === gender;

  // Définition des styles en fonction de l'état isSelected
  const buttonStyle = isSelected
    ? {
        backgroundColor: '#0B8BA8',
        borderColor: '#0B8BA8',
        marginHorizontal: 5,
        
      }
    : {
        backgroundColor: 'transparent',
        borderColor: '#ccc',
        marginHorizontal: 5,
      };

  const textStyle = {
    color: isSelected ? 'white' : '#ccc',
  };

  return (
    <AnimatedButton
      onPress={() => handleSelectGender(gender)}
      title={title}
      customStyle={buttonStyle}
      textStyle={textStyle}
    />
  );
};


  console.log('SignUpStep1 render');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>Quel est votre nom complet ?</Text>
        <TextInputLarge
          placeholder="Prénom"
          value={surname}
          onChangeText={setSurname}
        />
        <TextInputLarge
          placeholder="Nom"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.question}>Quel est votre genre?</Text>
        <View style={styles.genderButtonContainer}>
          <GenderButton title="Homme" gender="homme" />
          <GenderButton title="Femme" gender="femme" />
          <GenderButton title="Je ne préfère pas répondre" gender="non-binary" />
        </View>
      </View>
      
      <View style={styles.absoluteButtonContainer}>
        <DualOptionButton
          onPressCancel={handlePressCancel}
          onPressRegister={handlePressRegister}
        />
      </View>
    </View>
  );
  }  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 95,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  absoluteButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  question: {
    fontSize: 18,
    marginBottom: 10,
  },
  genderButtonContainer: {
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  nextButton: {
    backgroundColor: '#0B8BA8',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SignUpStep1;