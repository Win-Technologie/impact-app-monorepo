import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Image
} from 'react-native';
import { Camera } from 'expo-camera';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'


const PickupPicture = ({ setStartCamera, setImage, setNumber }) => {


    const [previewVisible, setPreviewVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [flashMode, setFlashMode] = React.useState('off');
    const [cameraType, setCameraType] = React.useState(Camera.Constants.Type.back)


    return (

        <>

        </>


    );

};



const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
        position: 'relative',
        backgroundColor: 'white'
    },

    content: {
  

});

export default TakePicture;
