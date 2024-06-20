import { SafeAreaView, Text, StyleSheet, ScrollView, StatusBar, } from 'react-native';
import React from 'react'
import HeaderBox from '../../components/Account/headerBox';
import SettingsOptions from '../../components/Account/settingsOptions';
import Button from '../../components/History/button';
import { router } from 'expo-router';
import clientPic from '../../assets/splashscreen.png'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useNavigation } from 'expo-router';

export async function signout() {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("user");
    router.push("signIn");
}

export default function Index() {

    const { t, i18n } = useTranslation();
    const [selfie, setSelfie] = React.useState();
    const navigation = useNavigation();

    const userProfile = {
        name: "Michael Lessard",
        email: "Michael.lessard@example.com",
        profileImageUrl: { clientPic },
        currentLanguage: i18n.language="en"? "English": "Français",
        appVersion: "1.0.0",
    };



    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getSelfie();
            // The screen is focused
            // Call any action
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation])



    const getSelfie = async () => {
        const s = await AsyncStorage.getItem("selfie");
        setSelfie(s);
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                animated={true}
                backgroundColor="#19363C"
                barStyle="light-content"
            />

            <ScrollView contentContainerStyle={styles.scrollView}>

                <HeaderBox
                    name={userProfile.name}
                    email={userProfile.email}
                    selfie={selfie}
                    setSelfie={setSelfie}
                />


                <SettingsOptions currentLanguage={userProfile.currentLanguage} appVersion={userProfile.appVersion} />


                <Button
                    style={styles.button}
                    onPress={signout}>
                    <Text style={{ color: 'white', }}>Me déconnecter</Text>
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    scrollView: {
        alignItems: 'center',
    },

    button: {
        width: 334,
        height: 51,
        borderRadius: 5,
        backgroundColor: '#0B8BA8',
        shadowColor: 'grey',
        shadowOpacity: 0.5,
        shadowOffset: { width: 4, height: 4 },
        marginBottom: 25,

    }
});