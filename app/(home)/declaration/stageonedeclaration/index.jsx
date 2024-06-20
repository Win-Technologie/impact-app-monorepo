import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity,ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';

const InfoPage = () => {
  const [numberOfPeople, setNumberOfPeople] = useState(3); // Adaptez ceci selon le nombre de personnes impliquées
  

  return (
    <SafeAreaView style={styles.container}>
         <View style={styles.fixedHeader}>
        <TouchableOpacity onPress={() => navigate('/')} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#19363C" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Information de base</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Mes informations</Text>
          <Text style={styles.boxText}>Voici quelques détails sur votre compte et vos informations.</Text>
          <TouchableOpacity style={styles.bottomLine} onPress={() => console.log('Accéder')}>
            <Text style={styles.bottomLineText}>Accéder à mes informations</Text>
            <Icon name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {Array.from({ length: numberOfPeople }, (_, index) => (
          <View key={index} style={styles.box}>
            <View style={styles.titleContainer}>
              <Text style={styles.boxTitle}>Recevoir des informations</Text>
              <Text style={styles.boxNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.boxText}>Information détaillée pour la personne {index + 1}.</Text>
            <TouchableOpacity style={styles.bottomLine} onPress={() => console.log('Saisir')}>
              <Text style={styles.bottomLineText}>Saisir des informations</Text>
              <Icon name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.continueButton} onPress={() => router.push('../../../../signup/stagetwodeclaration')}>
          <Text style={styles.continueButtonText}>Continuer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding:20,
      },
      fixedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 40, // Depending on status bar height
        //backgroundColor: '#0B8BA8'
      },
      backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        color: '#19363C',
      },
      backButtonText: {
        color: '#19363C',
        marginLeft: 5
      },
      headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#19363C'
      },
      scrollViewContent: {
        flex: 1,
      },
  box: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#eee',
    height: 200,
    width:'100%',
    justifyContent: 'flex-start',
    shadowColor:'#000',
    shadowOffset:{width: 0, height: 6 },
    shadowOpacity:0.5,
    elevation:4,
    shadowRadius:2.62,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom:10,
  },
  boxText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    justifyContent:'flex-start'
  },
  boxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10
  },
  backButtonText: {
    color: '#FFF',
    marginLeft: 5
  },
  boxNumber: {
    backgroundColor: '#19363C',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 18,
    color:'white',
    top:-4,
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#19363C',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
  },
  bottomLineText: {
    color: '#FFF',
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#0B8BA8',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    width: '100%',
    shadowColor:'#eee',
    shadowOffset:{height:6,width:0},
    shadowOpacity:0.5,
    elevation:8,
    shadowRadius:2.62,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default InfoPage;
