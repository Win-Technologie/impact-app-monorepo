import { StyleSheet, Text, View, Button, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import InputsShowGroup from '../../../../../components/Utils/Inputs/InputsShowGroup';
import SingleBottomButton from '../../../../../components/SignUp/SingleBottomButton';
import { AntDesign } from '@expo/vector-icons';
import { useRecoilValue } from 'recoil';
import { globalPersonalInfo } from '../../../../../GlobalState/PersonalInfoState';
import Loading from '../../../../../components/Utils/Notification/Loading';
import { ScannedQrCodeData } from '../../../../../GlobalState/ScannedQrCodeData';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function assuranceInfo() {

    // obtenir la valeur de manière globale
    const personalInformation = useRecoilValue(ScannedQrCodeData)

    /**
     * * Contient des informations détaillées sur l'assurance à afficher.
     */
    const infoInsurance = [

        { style: 'column', label: 'Nom de la société d’assurance', value: personalInformation.insurance.insuranceCompany || 'non disponible' },
        { style: 'row', firstLabel: 'Numéro d’assurance ', valueFirstLabel: personalInformation.insurance.policyNumber || 'non disponible', secondLabel: 'Expiration', valueSecondLabel: personalInformation.insurance.expirationDate.slice(0, 10) || 'non disponible' },
    ]

    /**
     * Contient des informations détaillées sur l'assurance d'utilisateur à afficher.
     */
    const userDataInsurance = [
        { style: 'column', label: 'Prénom', value: personalInformation.owner.name || 'non disponible' },
        { style: 'column', label: 'Nom', value: personalInformation.owner.lastName || 'non disponible' },
        { style: 'column', label: 'adresse courriel', value: personalInformation.owner.email || 'non disponible' },
        { style: 'column', label: 'Numéro de téléphone', value: personalInformation.owner.phone || 'non disponible' },
        { style: 'column', label: "Numéro et rue de l'adresse", value: personalInformation.owner.address || 'non disponible' },
        { style: 'row', firstLabel: 'Ville', valueFirstLabel: personalInformation.owner.city || 'non disponible', secondLabel: 'Code postale', valueSecondLabel: personalInformation.owner.postalCode || 'non disponible' },
        { style: 'row', firstLabel: 'Pays', valueFirstLabel: personalInformation.owner.country || 'non disponible', secondLabel: 'Province', valueSecondLabel: personalInformation.owner.province || 'non disponible' },
    ]


    // Continuer à la prochaine étape après la soumission du formulaire.
    const handlePressContinue = () => {
        // Redirige l'utilisateur à l'étape suivante 
        router.push('declarations/twoPersonnes/infoDebase');
    };


    return (

        <SafeAreaView style={styles.container}>


            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 20 }}>
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { router.back() }}>
                    <AntDesign name='arrowleft' size={20} color="#19363C" style={{ fontWeight: "200" }} /><Text style={{ color: "#19363C" }}>{"   "}Retour</Text>
                </TouchableOpacity>

                <View>
                    <Text style={{ fontSize: 18, color: "#19363C", fontWeight: "bold" }}>Informations d’assurance</Text>
                </View>

            </View>

            <ScrollView >

                <View style={styles.contentContainer}>
                    {infoInsurance.length === 0 ? <Loading text='Chargement..' /> : <InputsShowGroup dataToShow={infoInsurance} />}
                    <View >
                        <Text style={[styles.headerTitle, styles.marginSpace, styles.centerText]} >Informations de l’assuré</Text>
                        {userDataInsurance.length === 0 ? <Loading text='Chargement' /> : <InputsShowGroup dataToShow={userDataInsurance} />}
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footContainer}>
                <SingleBottomButton children='Continuer' onPress={handlePressContinue} />
            </View>

        </SafeAreaView>

    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 23,
        padding: 20,
        backgroundColor: "#FFFFFF",
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
        justifyContent: 'center',
        marginBottom: 50
    },

    titleText: {
        fontSize: 23,
        marginBottom: 30,
        fontWeight: 'bold',
        color: '#19363C',
        marginHorizontal: 20
    },


    marginSpace: {
        marginVertical: 20
    },

    centerText: {
        textAlign: 'center'
    },


    footContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

})