import { View, Text,StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import _layout from '../(home)/_layout'
import HomeHeader from '../../components/Home/homeHeader'
import BoxComponent from '../../components/Home/boxComponent';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import BottomButton from '../../components/Home/bottomButton';
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function index() {
  return (
    <SafeAreaView style={styles.screen}>
      <HomeHeader  clientName="Michael Lessard">
        <Text style={{marginBottom:10}}>Bienvenue</Text>
      </HomeHeader>
      <BoxComponent
        width={334}
        height={150}
        style={{
          borderRadius:5,
          borderWidth:1,
          borderColor:'grey',
          padding:15,
          marginLeft:20,
          backgroundColor:'#19363C',
          alignItems:'center',
          justifyContent:'center'
        }}
      >

        <Text style={{color:'white', alignItems:'center', fontFamily:'InterBold', fontSize:18}}>Profitez d'une reduction de 50% grace a un abonnement annuel</Text>

        <Text style={{marginTop:15,textDecorationLine:'underline',color:'white',fontFamily:'InterThin', fontSize:14}}>Abonnement mensuel egalement disponible</Text>

      </BoxComponent>
      <BoxComponent
        width={334}
        height={131}
        style={styles.box}
      >
        <View style={styles.textWithIcon}>
          <Text style={styles.mainText}>Urgence</Text>
          <MaterialIcons name="error" size={24} color="orange" />
        </View>

        <Text style={styles.subText}>S'il y a des blesses contactez directement les urgences</Text>

        <BoxComponent
          width={89}
          height={131}
          style={styles.ctaBox}
        >
          <FontAwesome name="phone" size={24} color="brown" />
          <Text style={styles.callText}>Appeler</Text>
        </BoxComponent>
        
      </BoxComponent>
     
        <BoxComponent
        width={334}
        height={157}
        style={styles.outerBox}
      >
        
          <View style={styles.innerBoxContainer}>
            <BoxComponent
              width={162}
              height={157}
              style={styles.innerBox1}
            >
              <Text style={styles.title}>Assurance</Text>
              <Text style={styles.description}>Contactez votre assurance dès maintenant</Text>
              <View style={styles.bottomLine1}></View>
            </BoxComponent>
            <BoxComponent
              width={162}
              height={157}
              style={styles.innerBox2}
            >
              <Text style={styles.title}>Remorquage</Text>
              <Text style={styles.description}>Contactez un remorqueur pres de votre position</Text>
              <View style={styles.bottomLine2}></View>
            </BoxComponent>
          </View>
        
      </BoxComponent>

      <BottomButton
      onPress={()=>router.push('declaration/index')}
      style={{
        width:334,
        height: 70,
        borderWidth: 1,
        borderColor: "#0B8BA8",
        marginLeft:20,
        borderRadius: 5,
        backgroundColor: "#0B8BA8",
        marginTop:20,
        alignItems:'center',
        justifyContent:'center',
        shadowColor: 'grey',
        shadowOpacity: 0.5,
        shadowOffset: { width: 4, height: 4 },
        
      }}>

      <Text style={{color:'white'}}>Déclarer un incident</Text>
      </BottomButton>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:'white',
    padding:11,
  },
  box: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
    padding: 15,
    marginLeft: 20,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    marginTop:15,
  },
  outerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
    //padding: 15,
   marginTop: 15,
    marginLeft: 20,
    
  },
  innerboxText:{
    marginBottom:10,
    marginTop:10,
  },
  contentContainer: {
    alignItems: 'center',
  },
  textWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  mainText: {
    color: '#19363C',
    fontFamily: 'InterBold',
    fontSize: 18,
    flexShrink: 1, 
  },
  subText: {
    marginTop: 15,
    flexShrink: 2,
    color: '#19363C',
    fontFamily: 'InterThin',
    fontSize: 14,
  },
  ctaBox: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#19363C', // Ou une autre couleur selon votre design
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius:5,
  },
  callAction: {
    position: 'absolute',
    right: 10,
    top: 10,
    alignItems: 'center',
  },
  callText: {
    color: 'white',
    fontSize: 14,
  },
  innerBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width:'100%',
   
  },

  innerBox1: {
    justifyContent: 'center',
    alignItems:'center',
    padding: 5,
    backgroundColor: '#19363C',
    borderRadius: 5,
    
    
  },
  innerBox2: {
    justifyContent: 'center',
    alignItems:'center',
    padding: 5,
    backgroundColor: '#F1F1F1',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  bottomLine1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10, // Hauteur du trait
    backgroundColor: '#CF8C58',
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
  },bottomLine2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10, // Hauteur du trait
    backgroundColor: '#19363C',
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
  }
});