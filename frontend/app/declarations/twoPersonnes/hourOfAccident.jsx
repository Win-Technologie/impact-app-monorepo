import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import Stepper from '../../../components/SignUp/stepper';
import { TimePickerModal } from 'react-native-paper-dates';
import { router } from 'expo-router';
import { DeclarationState } from "../../../GlobalState/DeclarationState";
import { useRecoilState } from "recoil";



const hourOfAccident = () => {

    const [currentStep, setCurrentStep] = useState(2);  // Example step state
    const totalSteps = 4;  // Example total steps
    const [visible, setVisible] = React.useState(false)
    const [minute, setMinute] = React.useState(null);
    const [hour, setHour] = React.useState(null);
    const [declaration, setDeclaration] = useRecoilState(DeclarationState);

    console.log(declaration);

    const onDismiss = React.useCallback(() => {
        setVisible(false)
    }, [setVisible])


    const onConfirm = React.useCallback(
        ({ hours, minutes }) => {
            setVisible(false);
            setMinute(minutes);
            setHour(hours);
            console.log({ hours, minutes });
        },
        [setVisible]
    );


    const handlePress = (type) => {
        setSelectedType(type);
        setShowAdditionalInput(type === 'Accrochage avec un véhicule vide');
        setShowAccidentTypeInput(type === 'Autre');
    };


    const back = () => {
        router.back();
    }


    const next = () => {

        if (minute == null || hour == null) {

            Alert.alert('Erreur', "Vous devez choisir l'heure  de l'accident avant de continuer", [
                {
                    text: 'Ok',
                    onPress: () => null,
                    style: 'cancel',
                },

            ]);

        } else {

            setDeclaration({ ...declaration, hour: hour, minute: minute });
            router.navigate("declarations/onePersonne/otherSpecification");
        }

    }


    return (
        <SafeAreaView style={styles.outerContainer}>

            <Stepper currentStep={currentStep} totalSteps={totalSteps} style={styles.stepper} />
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>À quelle heure s'est dérouler l'accident?</Text>
                </View>

                <TouchableOpacity onPress={() => setVisible(true)} style={{
                    height: 50, flexDirection: 'row',
                    alignItems: "center",
                    justifyContent: 'center',
                    backgroundColor: '#FAFAFA',
                    borderRadius: 5,
                    borderColor: '#F1F1F1',
                    shadowColor: 'grey',
                    shadowOpacity: 0.5,
                    borderWidth: 1,
                    shadowOffset: { width: 2, height: 2 },
                }}>

                    <View style={{ flex: 2, alignItems: "center" }}>
                        <Text style={{ color: '#19363C' }}>{hour == null ? "heure" : hour}</Text>
                    </View>

                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ color: '#19363C' }}>:</Text>
                    </View>

                    <View style={{ flex: 2, alignItems: "center" }}>
                        <Text style={{ color: '#19363C' }}>{minute == null ? "minute" : minute}</Text>
                    </View>
                </TouchableOpacity>

                <View>
                    <TimePickerModal
                        visible={visible}
                        onDismiss={onDismiss}
                        onConfirm={onConfirm}
                        hours={12}
                        minutes={14}
                    />
                </View>


            </View>

            <View style={styles.footContainer}>
                <DualOptionButton
                    leftButtonTitle="Annuler"
                    rightButtonTitle="Confirmer"
                    onPressBack={() => back()}
                    onPressContinue={() => next()}
                />
            </View>


        </SafeAreaView>
    );
};


const styles = StyleSheet.create({

    outerContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20
    },

    container: {
        justifyContent: 'center',
        marginTop: 100
    },



    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,  // Added top margin for better spacing
        marginBottom: 30,
        textAlign: 'left'
    },

    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        fontSize: 14,
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

    button: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        fontSize: 14,

    },

    buttonText: {
        fontSize: 14.5, // Regular text style
        color: 'grey', // Default color
    },

    activeButtonText: {
        fontSize: 14.5, // Keep the same size or adjust as needed
        color: 'white', // Color changes to white when active
    },

    activeButton: {
        backgroundColor: '#0B8BA8',
        width: '100%',
        color: 'white',
        marginVertical: 10,

    },


    stepper: {
        width: '50%',
        Padding: 10,

    },

    additionalInputContainer: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },

    additionalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    inputWithCounter: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },

    textInput: {
        flex: 1,
        height: 51,
        borderColor: 'gray',
        borderRadius: 5,
        borderWidth: 1,
        padding: 10,
        paddingRight: 40,
    },

    counter: {
        textAlign: 'right',
        fontSize: 14.5,
        position: 'absolute',
        right: 13,

    },

    footContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },


});


export default hourOfAccident;
