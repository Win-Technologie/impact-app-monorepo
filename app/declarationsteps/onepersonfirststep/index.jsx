import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView } from 'react-native';
import AnimatedButton from "../../../components/SignUp/animatedButton";
import DualOptionButton from "../../../components/SignUp/dualBottomButtonsSteps";
import Stepper from '../../../components/SignUp/stepper';
import { useTranslation } from 'react-i18next';



const AccidentTypePage = () => {


    const [selectedType, setSelectedType] = useState('');
    const [currentStep, setCurrentStep] = useState(1);  // Example step state
    const totalSteps = 4;  // Example total steps
    const [showAdditionalInput, setShowAdditionalInput] = useState(false);
    const [showAccidentTypeInput, setShowAccidentTypeInput] = useState(false);
    const [accidentType, setAccidentType] = useState("");
    const [plateNumber, setPlateNumber] = useState("");
    const {t} = useTranslation();
    const handlePress = (type) => {
        setSelectedType(type);
        setShowAdditionalInput(type === t('accidentTypes.vehicleCollisionWithEmptyVehicle'));
        setShowAccidentTypeInput(type === t('accidentTypes.other'));
    };

    return (
        <SafeAreaView style={styles.outerContainer}>
            <Stepper currentStep={currentStep} totalSteps={totalSteps} style={styles.stepper} />
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                <View style={styles.container}>
               
                        <Text style={styles.title}>{t('accidentTypes.title')}</Text>
                        <View style={styles.buttonContainer}>
                                <AnimatedButton
                                    title={t('accidentTypes.vehicleCollisionWithEmptyVehicle')}
                                    onPress={() => handlePress(t('accidentTypes.vehicleCollisionWithEmptyVehicle'))}
                                    customStyle={selectedType === t('accidentTypes.vehicleCollisionWithEmptyVehicle') ? styles.activeButton : styles.button}
                                    textStyle={selectedType === t('accidentTypes.vehicleCollisionWithEmptyVehicle') ? styles.activeButtonText : styles.buttonText}
                                />
                                <AnimatedButton
                                    title={t('accidentTypes.publicItemCollisionWithDamage')}
                                    onPress={() => handlePress(t('accidentTypes.publicItemCollisionWithDamage'))}
                                    customStyle={selectedType === t('accidentTypes.publicItemCollisionWithDamage') ? styles.activeButton : styles.button}
                                    textStyle={selectedType === t('accidentTypes.publicItemCollisionWithDamage') ? styles.activeButtonText : styles.buttonText}
                                />
                                <AnimatedButton
                                    title={t('accidentTypes.publicItemCollisionWithoutDamage')}
                                    onPress={() => handlePress(t('accidentTypes.publicItemCollisionWithoutDamage'))}
                                    customStyle={selectedType === t('accidentTypes.publicItemCollisionWithoutDamage') ? styles.activeButton : styles.button}
                                    textStyle={selectedType === t('accidentTypes.publicItemCollisionWithoutDamage') ? styles.activeButtonText : styles.buttonText}
                                />
                                <AnimatedButton
                                    title={t('accidentTypes.privateItemCollision')}
                                    onPress={() => handlePress(t('accidentTypes.privateItemCollision'))}
                                    customStyle={selectedType === t('accidentTypes.privateItemCollision') ? styles.activeButton : styles.button}
                                    textStyle={selectedType === t('accidentTypes.privateItemCollision') ? styles.activeButtonText : styles.buttonText}
                                />
                                <AnimatedButton
                                    title={t('accidentTypes.other')}
                                    onPress={() => handlePress(t('accidentTypes.other'))}
                                    customStyle={selectedType === t('accidentTypes.other') ? styles.activeButton : styles.button}
                                    textStyle={selectedType === t('accidentTypes.other') ? styles.activeButtonText : styles.buttonText}
                                />
                    </View>

                        {showAdditionalInput && (
                        <View style={styles.additionalInputContainer}>
                                    <Text style={styles.additionalTitle}>{t('accidentTypes.vehicleInfo')}</Text>
                            <View style={styles.inputWithCounter}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('accidentTypes.plateNumber')}
                                    value={plateNumber}
                                    onChangeText={text => setPlateNumber(text.substring(0, 7))}
                                />
                                <Text style={styles.counter}>{`${plateNumber.length}/7`}</Text>
                            </View>
                        </View>
                    )}
                    {showAccidentTypeInput && (
                        <View style={styles.additionalInputContainer}>
                            <Text style={styles.additionalTitle}>{t('accidentTypes.accidentTypeInfo')}</Text>
                            <View style={styles.inputWithCounter}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('accidentTypes.accidentType')}
                                    value={accidentType}
                                    onChangeText={setAccidentType}

                                />
                            </View>
                            {showAdditionalInput && (
                                <View style={styles.additionalInputContainer}>
                                    <Text style={styles.additionalTitle}>Information sur le véhicule touché</Text>
                                    <View style={styles.inputWithCounter}>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Numéro de plaque"
                                            value={plateNumber}
                                            onChangeText={text => setPlateNumber(text.substring(0, 7))}
                                        />
                                        <Text style={styles.counter}>{`${plateNumber.length}/7`}</Text>
                                    </View>
                                </View>
                            )}
                            {showAccidentTypeInput && (
                                <View style={styles.additionalInputContainer}>
                                    <Text style={styles.additionalTitle}>Informations sur le type d'accident</Text>
                                    <View style={styles.inputWithCounter}>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Type d'accident"
                                            value={accidentType}
                                            onChangeText={setAccidentType}
                                        />
                                    </View>
                                </View>
                            )}

                        </View>)}
                  </View>
            </ScrollView>

            <DualOptionButton 
                leftButtonTitle={t('buttons.cancel')}
                rightButtonTitle={t('buttons.confirm')}
                onPressBack={() => console.log("Back pressed")}
                onPressContinue={() => console.log("Continue pressed")}
                style={styles.footer}
            />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({

    outerContainer: {
        flex: 1,
        backgroundColor: 'white', // Ensures the entire screen is covered
    },

    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 10,
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 30,  // Added top margin for better spacing
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        fontSize: 14,
    },
    button: {
        width: '90%',
        padding: 10,
        marginVertical: 5,
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
        width: '90%',
        color: 'white'
    },
    footer: {
        width: '100%',
        padding: 10,
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
        width: '90%',
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

});

export default AccidentTypePage;
