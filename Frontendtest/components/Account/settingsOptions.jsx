import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome, Ionicons,FontAwesome5,Entypo } from '@expo/vector-icons'
import { useRouter } from 'expo-router';


export default function SettingsOptions({ currentLanguage, appVersion }) {
    const router = useRouter();

    const handlePressAbonnement = () => {
      router.push('/abonnement');
    };
  
    const handlePressVehicules = () => {
      router.push('/vehicules');
    };
  
    const handlePressLangue = () => {
      router.push('/langue');
    };
  
    const handlePressNotifications = () => {
      router.push('/notifications');
    };
  
    const handlePressAide = () => {
      router.push('/aide');
    };
  
    const handlePressAPropos = () => {
      router.push('/apropos');
    };
  
    const handlePressConditions = () => {
      router.push('/conditions');
    };
  
    const handlePressMisesAJour = () => {
      router.push('/misesajour');
    };
  return (
    <>
    <View style={styles.section}>
    <Text style={styles.sectionTitle}>Paramètres</Text>
    {renderSettingOption("Abonnement", "award", FontAwesome5,()=>handlePressAbonnement())}
    {renderSettingOption("Véhicules", "car-alt", FontAwesome5,()=>handlePressVehicules())}
    {renderSettingOptionWithDetail("Langue", "language", MaterialIcons, currentLanguage,()=>handlePressLangue())}
    {renderSettingOption("Notifications", "notifications", Ionicons,()=>handlePressNotifications())}
  </View>

  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Informations et autres</Text>
    {renderSettingOption("Aide et FAQ", "help-with-circle", Entypo,()=>handlePressAide())}
    {renderSettingOption("À propos", "info-circle", FontAwesome,()=>handlePressAPropos())}
    {renderSettingOption("Conditions et règlements", "balance-scale-left", FontAwesome5,()=>handlePressConditions())}
    {renderSettingOptionWithDetail("Mises à jour et réinstallations", "cycle", Entypo, appVersion,()=>handlePressMisesAJour())}
  </View>
</>
);

};

const renderSettingOption = (title, iconName, IconComponent, onPress) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={styles.iconContainer}>
      <IconComponent name={iconName} size={24} style={styles.icon} />
    </View>
    <Text style={styles.optionText}>{title}</Text>
    <Entypo name="chevron-right" size={16} style={styles.arrowIcon} />
  </TouchableOpacity>
);

const renderSettingOptionWithDetail = (title, iconName, IconComponent, detail, onPress) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={styles.iconContainer}>
      <IconComponent name={iconName} size={24} style={styles.icon} />
    </View>
    <Text style={styles.optionText}>{title}</Text>
    <Text style={styles.detailText}>{detail}</Text>
    <Entypo name="chevron-right" size={16} style={styles.arrowIcon} />
  </TouchableOpacity>
);


  const styles = StyleSheet.create({
    
    section: {
      width: 334,
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color:'#1D3C42',
      marginBottom: 5,
      height:40,
      width:334,
      borderColor:'white',
      backgroundColor:'#F1F1F1',
      padding:13
      
    },
    iconContainer: {
      width: 40, 
      alignItems: 'center',
      justifyContent: 'center',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      marginHorizontal:15,
    },
    icon: {
      marginRight: 10,
      color: '#19363C',
    },
    optionText: {
      flex: 1,
      fontSize: 14,
      color: '#19363C',
    },
    detailText: {
      color: 'grey',
      marginRight: 5,
    },
    arrowIcon: {
      color: '#19363C',
    },
  });
  

