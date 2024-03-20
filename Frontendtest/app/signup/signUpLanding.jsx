import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressOption from '../../components/SignUp/smallBox';
import BoxComponent from '../../components/Home/boxComponent';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SignUpLandingPage() {
  // Exemple d'utilisation avec des données factices
  const progressData = [
    { title: "Information personnelles", subtitle: "4 minutes", completion: 0 },
    { title: "Information du vehicules", subtitle: "8 minutes", completion: 0 },
    { title: "Informations d'assurances", subtitle: "8 minutes", completion: 0 },
  ];

  const handlePressOption = (item) => {
    switch (item.title) {
      case "Information personnelles":
        router.push('PersonalInfoSteps/nameGender'); 
        break;
      case "Information du vehicules":
        router.push('CarVehicleSteps/vehicleDetails'); 
        break;
      case "Informations d'assurances":
        router.push('InsuranceSteps/insuranceDetails'); 
        break;
      default:
        console.log('Aucune option');
    }
  };
  

  const handlePressCancel = () => {
    console.log('Annuler pressed');
  };

  const handlePressRegister = () => {
    router.push('PersonalInfoSteps/nameGender');
  };

  return (
    <SafeAreaView style={{ flex: 1,backgroundColor: 'white', }}>
      <View style={styles.container}>
        <Text style={styles.MainTitle}>Récolte des informations d'inscription</Text>
        {progressData.map((item, index) => (
          <ProgressOption
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            completion={item.completion}
            onPress={() => handlePressOption(item)}
          />
        ))}

        <Text style={styles.MainTitle}>Scanner vos documents</Text>
        <BoxComponent style={styles.outerBox}>
        <TouchableOpacity onPress={()=>console.log('Pressed')}>
            <View style={styles.innerBox}>
            <FontAwesome name="drivers-license" size={45} color="#CF8C58" />
            <Text style={styles.title}>Permis de conduire</Text>
            <Text style={styles.description}>Scanner votre permis de conduire</Text>
            <View style={styles.bottomLine}>
                <Text style={{color:'white'}}>Scanner</Text>
            </View>
      </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>console.log('Pressed')}>
      <View style={styles.innerBox}>
      
        <Ionicons name="document-text" size={45} color="#CF8C58" />
        <Text style={styles.title}>Papiers d'assurances</Text>
        <Text style={styles.description}>Scanner votre preuve d'assurance</Text>
        <View style={styles.bottomLine}>
        
            <Text style={{color:'white'}}>Scanner</Text>
        
        </View>
        
      </View>
      </TouchableOpacity>
      
        </BoxComponent>

        {/* Conteneur pour les boutons "Annuler" et "M'inscrire" */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={[styles.bottomButton, styles.cancelButton]} onPress={handlePressCancel}>
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bottomButton, styles.registerButton]} onPress={handlePressRegister}>
            <Text style={styles.buttonText}>M'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 0, 
  },
  MainTitle: {
    fontSize: 26,
    color: '#19363C',
    marginTop: 15,
    marginBottom: 25,
  },
  outerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  
  bottomButtonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    flex: 0.3,
    backgroundColor: '#19363C',
    borderBottomLeftRadius: 5,
  },
  registerButton: {
    flex: 0.7,
    backgroundColor: '#1B6878',
    borderBottomRightRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  innerBox: {
    width: 162,
    height: 157,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop:10,
    position: 'relative', 
    borderRadius:5,
    backgroundColor:'#F1F1F1'
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5, 
  },
  bottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 31,
    backgroundColor: '#1B6878',
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
    alignItems:'center',
    justifyContent:'center'
  },
absoluteButton: {
position: 'absolute',
left: 30,
right: 30,
bottom: 30, 
backgroundColor: '#0B8BA8',
height: 50,
borderRadius: 5,
justifyContent: 'center',
alignItems: 'center',
},
});
