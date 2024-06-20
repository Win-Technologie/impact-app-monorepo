import { StyleSheet, Text, View, Button, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
/*import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insuranceCompanyState } from '../../GlobalState/InsuranceState';
import { useForm, Controller } from 'react-hook-form';
import SingleBottomButton from '../../components/SignUp/SingleBottomButton';
import { AntDesign } from '@expo/vector-icons';

import InputsShowGroup from '../../components/Utils/Inputs/InputsShowGroup';
import { fetchUserInfoAndVehicle } from '../api/users/userApi';
import { useRecoilState, useRecoilValue } from 'recoil';
import { accidentVehicleState } from '../../GlobalState/AccidentVehiculeState';
import { globalPersonalInfo } from '../../GlobalState/PersonalInfoState';
import Loading from '../../components/Utils/Notification/Loading';
import { userDetailsState } from '../../GlobalState/userDetailState';
*/

export default function GetUserInformation() {
    //obtenir la valeur de manière globale
    /*const VEHICLE_ID = useRecoilValue(accidentVehicleState);

    const ENDPOINT = 'users/user/vehicle/info/';
    const [userData, setUserData] = useState(null);
    const [, setPersonalInfoState] = useRecoilState(globalPersonalInfo)
    const [isEditable, setIsEditable] = useState(true);



    //obtenir les données au moment du rendu du composant 
    useEffect(() => {
        userInformation()
    }, [])

    *//**
    * Crée et organise les données de l'utilisateur pour l'affichage.
    * @param {Object} data - Contient les données de l'utilisateur et de son permis de conduire.
    *//*
    const createDataUser = (data) => {
        console.log("Received Data:", data); // Add this line to log the received data
    if (!data.owner) {
        console.error("Data does not contain owner information.");
        return; // Prevent further execution if owner is undefined
    }
        const dataToShow = [
            { style: 'column', label: 'Prénom', value: data.owner?.name || 'non disponible' },
            { style: 'column', label: 'Nom', value: data.owner.lastName || 'non disponible' },
            { style: 'row', firstLabel: 'Numéro du permis de conduire', valueFirstLabel: data.driverLicense.number || 'non disponible', secondLabel: 'Expiration', valueSecondLabel: data.driverLicense.expires || 'non disponible' },
            { style: 'column', label: 'adresse courriel', value: data.owner.email || 'non disponible' },
            { style: 'column', label: 'Numéro de téléphone', value: data.owner.phone || 'non disponible' },
            { style: 'column', label: "Numéro et rue de l'adresse", value: data.owner.address || 'non disponible' },
            { style: 'row', firstLabel: 'Ville', valueFirstLabel: data.owner.city || 'non disponible', secondLabel: 'Code postale', valueSecondLabel: data.owner.postalCode || 'non disponible' },
            { style: 'row', firstLabel: 'Pays', valueFirstLabel: data.owner.country || 'non disponible', secondLabel: 'Province', valueSecondLabel: data.owner.province || 'non disponible' },
        ]
        setUserData(dataToShow);

    }


    *//**
     * Récupère les informations de l'utilisateur et de son véhicule à partir du backend 
     *//*
    async function userInformation() {
        const userToken = await AsyncStorage.getItem('userToken');
    
        try {
            // Fetching user and vehicle information
            const result = await fetchUserInfoAndVehicle(VEHICLE_ID, userToken, ENDPOINT);
    
            if (result.error) {
                // If there's an error returned from the fetch function, handle it accordingly
                throw new Error(`Failed to fetch data: ${result.status} ${result.message}`);
            }
    
            // If the data is successfully fetched, process it
            console.log('Vehicle ID:', VEHICLE_ID); // Debugging log
            createDataUser(result.data);
            setIsEditable(false);  // Set fields to not editable if data is fetched
            setPersonalInfoState(result.data);
            console.log(result.data);  // Log data to debug and confirm it's being received
            //console.log(globalPersonalInfo); 
            
    
        } catch (error) {
            // Error handling if the try block fails
            console.error('Error fetching user information:', error);
            alert(`Failed to fetch user information: ${error.message}`);
        }
    }
    
    


    *//**
     * Gère l'action de continuer à la prochaine étape du processus.
     *//*
    const handlePressContinue = () => {

        router.push('/getinformation/getvehiculeinformation');
    };*/


    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}   >
            {/*<SafeAreaView style={styles.safeAreaContainer}>
                <ScrollView contentContainerStyle={styles.scrollviewContainer} keyboardShouldPersistTaps='handled'>
                    <View style={styles.headersContainer}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <View style={styles.headerIcon}>
                                <AntDesign name="arrowleft" size={24} color="black" />
                                <Text>Retour</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle} >Informations personnelles</Text>
                    </View>
                    <View style={styles.contentContainer}>
                        {!userData ? <Loading text='Loading..' /> : <InputsShowGroup dataToShow={userData} editable={isEditable}/>}
                    </View>
                </ScrollView>
            </SafeAreaView>
            <View style={styles.absoluteButtonContainer}>
                <SingleBottomButton children='Continuer' onPress={handlePressContinue} />
            </View>*/}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    scrollviewContainer: {
        flexGrow: 1
    },
    safeAreaContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 40 : 0
    },
    headersContainer: {
        marginTop: 20,
        flexDirection: 'row',
        gap: 15,
        marginHorizontal: 20
    },
    headerTitle: {
        fontSize: 19,
        // marginBottom: 30,
        fontWeight: 'bold',
        color: '#19363C',
        // marginHorizontal: 20
    },
    headerIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    contentContainer: {
        marginTop: 20,
        marginHorizontal: 20,
        // flex: .85,
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 23,
        marginBottom: 30,
        fontWeight: 'bold',
        color: '#19363C',
        marginHorizontal: 20
    },
    inputContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 8

    },
    inputInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // width: '100%'
        // marginHorizontal: 20,
        // marginVertical: 10,

    },
    inputInfoRowSecondChildren: {
        width: '40%',
        marginLeft: '1%',
        flexDirection: 'column',
        flexDirection: 'row'
    },
    inputInfoRowFirstChildren: {
        minWidth: '55%'
    },
    inputInsuranceName: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 7
    },
    errorText: {
        color: 'red',
        fontSize: 12,
    },
    inputInsurance: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 20,
        marginHorizontal: 20,
    },
    inputCodePostal: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 20,
    },
    inputVille: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 20,
    },
    inputHalf: {
        width: '60%',
        marginRight: '5%',
    },
    inputQuarter: {
        width: '35%',
        marginRight: '5%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
    },
    dropdown1BtnStyle: {
        width: '60%',
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
    },
    dropdown2BtnStyle: {
        width: '35%',
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
    },
    dropdown1BtnTxtStyle: {
        color: '#444',
        textAlign: 'left'
    },
    dropdown1DropdownStyle: {
        backgroundColor: '#EFEFEF'
    },
    dropdown1RowStyle: {
        backgroundColor: '#EFEFEF',
        borderBottomColor: '#C5C5C5'
    },
    dropdown1RowTxtStyle: {
        color: '#444',
        textAlign: 'left'
    },
})