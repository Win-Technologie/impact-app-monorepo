import React, { useTransition, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import SmallBox from '../../../components/SignUp/smallBox';
import { useRecoilState } from "recoil";
import { userInfoGatherState, lastVehicleState, licenceScanState, userDetailsState } from "../../../GlobalState/userDetailState";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function SignUpLandingPage() {


    const [progressData, setProgressData] = useRecoilState(userInfoGatherState);
    const [licenceScan, setLicenceScan] = useRecoilState(licenceScanState);
    const [lastVehicle, setlastVehicle] = useRecoilState(lastVehicleState);
    const [userDetails, setUserDetails] = useRecoilState(userDetailsState);
    const { t } = useTranslation();
    const loginUrl = "user/login/token";
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const LOGIN_URL = `http://172.25.32.1:8000/api/users/user/login/token`;
    const navigation = useNavigation();


    async function confirmSignout() {

        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("user");

        setLicenceScan(false);
        setlastVehicle(null);
        setProgressData([
            { id: 0, title: "Information personnelles", subtitle: "4 minutes", completion: 0, actualstep: 0, nbstep: 4 },
            { id: 1, title: "Information du vehicules", subtitle: "8 minutes", completion: 0, actualstep: 0, nbstep: 4 },
            { id: 2, title: "Informations d'assurances", subtitle: "8 minutes", completion: 0, actualstep: 0, nbstep: 4 },
        ]);

        setUserDetails({
            email: '',
            name: '',
            lastName: '',
            phone: '',
            address: '',
            postalCode: '',
            companyName: '',
            province: '',
            city: '',
            country: '',
            gender: '',
            birthDay: '',
            licenseNumber: '',
            licenseDelivery: '',
            licenseExpiration: '',
            licenseMention: '',
            licenseCategory: '',
            alternateAddress: '',
            alternateCity: '',
            alternatePostalCode: '',
            alternateCountry: '',
            alternateProvince: '',
            typeAccount: 'free',
        });

        router.push('signup');
    }


    async function signout() {
        Alert.alert('Attention', "Voulez-vous vraiment abandonder le processus de recolte d'informations d'inscription", [
            
            {
                text: 'Non',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },

            { text: 'Oui', onPress: () => confirmSignout() },
        ]);
    }

    

    useEffect(() => {
        navigation.addListener('beforeRemove', (e) => {
            e.preventDefault();

        });
    }, []);



    const handlePressOption = (item) => {
 
        switch (item.title) {
            case t('signUpLandingPage.personalInformation'):
                router.push('/signup/personalInfoSteps/nameAndGender');
                break;

                case t('signUpLandingPage.vehicleInformation'):

                    if (lastVehicle==null) {
                        router.push('/signup/vehiculesSteps/vehiculesDetails');
                    } else {
                        Alert.alert(t('Info'), t('signUpLandingPage.addInsuranceInfo'), [
                            {
                                text: 'Ok',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'Cancel',
                            },
                        ]);
                    }
                break;

                case t('signUpLandingPage.insuranceInformation'):

                if (lastVehicle == null) {
                   
                    Alert.alert(t('Info'), t('signUpLandingPage.addVehicleFirst'), [
                        {
                            text: 'Ok',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'Cancel',
                        },
                    ]);

                } else {
                    router.push('/signup/insurance/insurancePolicy');
                }
                break;
            default:
                console.log(t('signUpLandingPage.noOptionSelected'));
        }
    };


    const handlePressCancel = () => {
        router.push('signup');
    };

    const handlePressRegister = async () => {

        if (/*licenceScan*/ true) {

            /*await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("user");*/

            setLicenceScan(false);
            setlastVehicle(null);
            setProgressData([
                { id: 0, title: "Information personnelles", subtitle: "4 minutes", completion: 0, actualstep: 0, nbstep: 4 },
                { id: 1, title: "Information du vehicules", subtitle: "8 minutes", completion: 0, actualstep: 0, nbstep: 4 },
                { id: 2, title: "Informations d'assurances", subtitle: "8 minutes", completion: 0, actualstep: 0, nbstep: 4 },
            ]);

            setUserDetails({
                email: '',
                name: '',
                lastName: '',
                phone: '',
                address: '',
                postalCode: '',
                companyName: '',
                province: '',
                city: '',
                country: '',
                gender: '',
                birthDay: '',
                licenseNumber: '',
                licenseDelivery: '',
                licenseExpiration: '',
                licenseMention: '',
                licenseCategory: '',
                alternateAddress: '',
                alternateCity: '',
                alternatePostalCode: '',
                alternateCountry: '',
                alternateProvince: '',
                typeAccount: 'free',
            });


            try {

                const token = await AsyncStorage.getItem('userToken');

                if (!token) {
                    console.error("No token provided");
                    return;
                }

           

                const response = await fetch(LOGIN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                  //  body: JSON.stringify(null)
                });

                const responseData = await  response.json();

                await AsyncStorage.setItem("userToken", token);
                await AsyncStorage.setItem("user", JSON.stringify(responseData.user));
                router.push('(tabs)');


            } catch (error) {
                console.error('Error submitting data:', error);
            }


        } else {

            Alert.alert('Info', t('signUpPage.mustscanyourlicence'), [

                {
                    text: 'Ok',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },

            ]);

        }

    };

    const RenderItem = ({item}) => {

        return (

            <SmallBox
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                completion={item.completion}
                actualstep={item.actualstep}
                nbstep={item.nbstep}
                onPress={() => handlePressOption(item)}
            />
        );

    }

    const goToVeriff = () => {

        if (progressData[2].completion == 1) {

            router.push("signup/scandocuments/scanpermis");

        } else {

            Alert.alert('Info', t('signUpPage.youmusthavecompletedalltheinformationcollectionsteps'), [

                {
                    text: 'Ok',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },


            ]);
            
        }
   

    }


    const footer = () => {

        return (

            <View style={{ marginBottom:100 }}>
                <Text style={styles.MainTitle}>{t('signUpLandingPage.documentScanTitle')}</Text>
                <View style={{ flexDirection:'row' }}>

                    <TouchableOpacity style={{ flex: 1, marginRight: 10 }} onPress={() => { goToVeriff()} }>
                        <View style={styles.innerBox}>
                            <FontAwesome name="drivers-license" size={45} color="#CF8C58" />
                            <Text style={styles.title}>{t('signUpLandingPage.driverLicense')}</Text>
                            <Text style={styles.description}>{t('signUpLandingPage.scanDriverLicense')}</Text>
                            <View style={styles.bottomLine}>
                                <Text style={{ color: 'white' }}>{t('signUpLandingPage.scanButton')}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flex: 1, marginLeft: 10 }} onPress={() => console.log('Pressed')}>
                        <View style={styles.innerBox}>
                            <Ionicons name="document-text" size={45} color="#CF8C58" />
                            <Text style={styles.title}>{t('signUpLandingPage.insurancePapers')}</Text>
                            <Text style={styles.description}>{t('signUpLandingPage.scanInsurancePapers')}</Text>
                            <View style={styles.bottomLine}>
                                <Text style={{ color: 'white' }}>{t('signUpLandingPage.scanButton')}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                </View>
            </View>
        
        )

    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', }}>

            <View style={styles.container}>
                <FlatList
                    data={progressData}
                    renderItem={RenderItem}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={<Text style={styles.MainTitle}>{t('signUpLandingPage.headerTitle')}</Text>}
                    ListFooterComponent={footer}
                />

                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity style={[styles.bottomButton, styles.cancelButton]} onPress={signout}>
                        <Text style={styles.buttonText}>{t('signUpLandingPage.cancelButton')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.bottomButton, styles.registerButton]} onPress={handlePressRegister}>
                        <Text style={styles.buttonText}>{t('signUpLandingPage.end')}</Text>
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
    },

    registerButton: {
        flex: 0.7,
        backgroundColor: '#1B6878',
    },

    buttonText: {
        color: 'white',
        fontSize: 16,
        //fontWeight: 'bold',
    },

    innerBox: {
        height: 157,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop:10,
        borderRadius:5,
        backgroundColor:'#F1F1F1'
    },

    title: {
        fontSize: 14,
        //fontWeight: 'bold',
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
