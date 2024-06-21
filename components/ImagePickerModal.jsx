/* eslint-disable eol-last */
/* eslint-disable prettier/prettier */
import React from 'react';
import { SafeAreaView, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';



export default function ImagePickerModal({ isVisible, onClose, setImage }) {


    const pickupImage = async (mode) => {

        if (mode ==1) {

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                base64:true,
                //aspect: [4, 3],
                quality: 1,
            });

            //console.log(result.assets[0].base64);

            if (!result.canceled) {
              
              //  setImage(result.assets[0].base64);
                setImage(result.assets[0]);
                onClose();
            }

        } else {

            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                //base64:true,
                // aspect: [4, 3],
                quality: 1,
            });


            if (!result.canceled) {
                //alert(result.assets[0].uri);
                setImage(result.assets[0].assets[0].base64);
                onClose();
            }
        }

    }


    return (
        <Modal
            isVisible={isVisible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            style={styles.modal}>
            <SafeAreaView style={styles.buttons}>
                <Pressable style={styles.button} onPress={() => { pickupImage(1); }}>
                    <Ionicons style={styles.buttonIcon} name="image-sharp" size={26} color="#1B6878" />
                    <Text style={styles.buttonText}>Galerie</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={() => { pickupImage(2); }}>
                    <Ionicons style={styles.buttonIcon} name="camera" size={26} color="#1B6878" />
                    <Text style={styles.buttonText}>Camera</Text>
                </Pressable>
            </SafeAreaView>
        </Modal>
    );


}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },

    buttonIcon: {
        width: 30,
        height: 30,
        margin: 5,
    },

    buttons: {
        backgroundColor: 'white',
        flexDirection: 'row',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
    },

    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonText: {
        fontSize: 12,
        textAlign:"center"

    },

});