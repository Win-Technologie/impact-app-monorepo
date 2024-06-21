import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import { useTranslation } from 'react-i18next';
import ImagePickerModal from "../ImagePickerModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from 'expo-router';
export default function HeaderBox({ name, email, selfie, setSelfie }) {

    const [filePath, setFilePath] = React.useState(null);
    const [visible, setVisible] = React.useState(false);
    const { t } = useTranslation();
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const HOST_URL = result = API_URL.replace("api/", ""); 
    const navigation = useNavigation();



    const createFormData = (photo, body = {}) => {

        let filename = photo.fileName.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : 'image';
       
        const data = new FormData();
        data.append('image', {
            name: photo.fileName,
            type:type,
            uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
        });

        Object.keys(body).forEach((key) => {
            data.append(key, body[key]);
        });

        return data;
    };

    const handleUploadPhoto = async (photo) => {


        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
            console.error("No token provided");
            return;
        }


        fetch(`${API_URL}users/user/upload-profile-image`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
            body: createFormData(photo, { userId: '123' }),
           
        }).then((response) => response.json())
        .then((response) => {
            saveSelfie(`${HOST_URL}Backend/${response.imagePath}`)
            setFilePath(`${HOST_URL}Backend/${response.imagePath}`);
        })
        .catch((error) => {
            console.log('error', error);
        });

    };
    

    React.useEffect(() => {

        if (selfie && !visible) {
            handleUploadPhoto(selfie);
        }


    }, [visible]);


    const saveSelfie = async (selfie) => {
        await AsyncStorage.setItem("selfie", selfie);
    }


    const getSelfie = async () => {
        const s = await AsyncStorage.getItem("selfie");
        setFilePath(s);
    }


    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {

            getSelfie();
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation])



    return (
        <View style={styles.headerBox}>
            
            <Image
               // source={selfie ? { uri: `data:image;base64,${selfie}` } : require('../../assets/avatar.jpg')}
                source={selfie ? { uri: `${filePath}` } : require('../../assets/avatar.jpg')}
                style={styles.profileImage}
            />

            <TouchableOpacity onPress={() => { setVisible(true) }} style={{
                position: "relative",
                bottom: 35,
                left: 30,
                borderWidth: 1,
                height: 30,
                width: 30,
                borderRadius: 18,
                borderColor:"#CF8C58",
                alignContent: "center",
                justifyContent: "center",
                alignSelf: "center",
                backgroundColor: "#CF8C58"
            }}>
                <Text style={{ textAlign:'center' }}>
                    <MaterialCommunityIcons name="camera" color="white" size={20} />
                </Text> 
            </TouchableOpacity>

            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>

            <TouchableOpacity style={styles.editButton}>
                <MaterialCommunityIcons name='account-edit' size={34} color='white' />
                <Text style={styles.editButtonText}>{t('account.modifyyourprofil')}</Text>
            </TouchableOpacity>


            <View style={styles.bottomLine} />
            <ImagePickerModal
                isVisible={visible}
                onClose={() => setVisible(false)}
                setImage={setSelfie}
            />
        </View>
    );
}


const styles = StyleSheet.create({

    headerBox: {
        width: "100%",
        height: 366,
        backgroundColor: "#19363C",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative", // Pour le positionnement absolu de la bottomLine
        padding: 45,
    },

    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 70, // Pour rendre l'image ronde
        borderWidth: 1,
        borderColor: "white",
    },

    name: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",

    },

    email: {
        color: "white",
        fontSize: 14,
        marginTop: 5,
    },

    editButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 40,
        backgroundColor: "#CF8C58",
        width: 220,
        height: 54,
        borderRadius: 5,
        justifyContent: "center",
    },

    editButtonText: {
        color: "white",
        fontSize: 14,
        marginLeft: 20,
    },

    bottomLine: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: "#CF8C5B",
    },

    clientImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },

});
