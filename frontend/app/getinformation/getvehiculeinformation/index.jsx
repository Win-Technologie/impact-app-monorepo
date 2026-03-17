import {
  StyleSheet,
  Text,
  View,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
/*import { router } from 'expo-router';
import InputsShowGroup from '../../components/Utils/Inputs/InputsShowGroup';
import SingleBottomButton from '../../components/SignUp/SingleBottomButton';
import { AntDesign } from '@expo/vector-icons';
import { useRecoilValue } from 'recoil';
import { globalPersonalInfo } from '../../../GlobalState/PersonalInfoState';
import Loading from '../../components/Utils/Notification/Loading';
import { vehicleDetailsState } from '../../GlobalState/vehiculeState';*/

export default function GetVehicleInformation() {
  /*//obtenir la valeur de manière globale
    const personalInformation = useRecoilValue(globalPersonalInfo);
    const [dataVehicle, setDataVehicle] = useState(null);

    */ /**
   * * Contient des informations détaillées sur le véhicule à afficher.
   */ /*
    const infoVehicle = [

        { style: 'column', label: 'Numéro du certificat d'immatriculation', value: personalInformation?.vehicle?.serialNumber || 'non disponible' },
        { style: 'column', label: 'Numéro de plaque', value: personalInformation?.vehicle?.plate|| 'non disponible'  },
        { style: 'row', firstLabel: 'Modèle du véhicule', valueFirstLabel: personalInformation?.vehicle?.model|| 'non disponible' , secondLabel: 'Année', valueSecondLabel: personalInformation?.vehicle?.year?.toString()|| 'non disponible'  },
        { style: 'column', label: 'Couleur du véhicule', value: personalInformation?.vehicle?.color|| 'non disponible'  },
    ]

    */ /**
   * * Contient des informations détaillées sur le proprietaire du véhicule à afficher.
   */ /*
    const vehicleOwner = [
        { style: 'column', label: 'Prénom', value: personalInformation.owner.name || 'non disponible' },
        { style: 'column', label: 'Nom', value: personalInformation.owner.lastName|| 'non disponible'  },
        { style: 'column', label: 'adresse courriel', value: personalInformation.owner.email || 'non disponible' },
        { style: 'column', label: 'Numéro de téléphone', value: personalInformation.owner.phone || 'non disponible' },
        { style: 'column', label: "Numéro et rue de l'adresse", value: personalInformation.owner.address || 'non disponible' },
        { style: 'row', firstLabel: 'Ville', valueFirstLabel: personalInformation.owner.city|| 'non disponible' , secondLabel: 'Code postale', valueSecondLabel: personalInformation.owner.postalCode || 'non disponible'  },
        { style: 'row', firstLabel: 'Pays', valueFirstLabel: personalInformation.owner.country || 'non disponible' , secondLabel: 'Province', valueSecondLabel: personalInformation.owner.province || 'non disponible'  },
    ]

    // Continuer à la prochaine étape après la soumission du formulaire.
    const handlePressContinue = () => {
        // Met à jour le nom de l'assurance avec la valeur soumise.

        // Redirige l'utilisateur à l'étape suivante du processus d'inscription.
        router.push('/getinformation/getinsuranceinformation');
    };*/

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/*<SafeAreaView style={styles.safeAreaContainer}>
                <ScrollView contentContainerStyle={styles.scrollviewContainer} keyboardShouldPersistTaps='handled'>
                    <View style={styles.headersContainer}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <View style={styles.headerIcon}>
                                <AntDesign name="arrowleft" size={24} color="black" />
                                <Text>Retour</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle} >Informations du véhicule</Text>
                    </View>
                    <View style={styles.contentContainer}>

                        {infoVehicle.length === 0 ? <Loading text='Chargement...' /> : <InputsShowGroup dataToShow={infoVehicle} />}
                        <View >
                            <Text style={[styles.headerTitle, styles.marginSpace, styles.centerText]} >Informations du propriétaire</Text>
                            {vehicleOwner.length === 0 ? <Loading text='Chargement' /> : <InputsShowGroup dataToShow={vehicleOwner} />}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <View style={styles.absoluteButtonContainer}>
                <SingleBottomButton children='Continuer' onPress={handlePressContinue} />
            </View>*/}
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollviewContainer: {
    flexGrow: 1,
  },
  safeAreaContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  headersContainer: {
    marginTop: 20,
    flexDirection: "row",
    gap: 15,
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 19,
    // marginBottom: 30,
    fontWeight: "bold",
    color: "#19363C",
    // marginHorizontal: 20
  },
  headerIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contentContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    // flex: .85,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 23,
    marginBottom: 30,
    fontWeight: "bold",
    color: "#19363C",
    marginHorizontal: 20,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  marginSpace: {
    marginVertical: 20,
  },
  centerText: {
    textAlign: "center",
  },
  inputInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // width: '100%'
    // marginHorizontal: 20,
    // marginVertical: 10,
  },
  inputInfoRowSecondChildren: {
    width: "40%",
    marginLeft: "1%",
    flexDirection: "column",
    flexDirection: "row",
  },
  inputInfoRowFirstChildren: {
    minWidth: "55%",
  },
  inputInsuranceName: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 7,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  inputInsurance: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  inputCodePostal: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  inputVille: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  inputHalf: {
    width: "60%",
    marginRight: "5%",
  },
  inputQuarter: {
    width: "35%",
    marginRight: "5%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },
  dropdown1BtnStyle: {
    width: "60%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
  dropdown2BtnStyle: {
    width: "35%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
  dropdown1BtnTxtStyle: {
    color: "#444",
    textAlign: "left",
  },
  dropdown1DropdownStyle: {
    backgroundColor: "#EFEFEF",
  },
  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },
  dropdown1RowTxtStyle: {
    color: "#444",
    textAlign: "left",
  },
});
