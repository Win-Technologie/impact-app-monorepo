import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PermissionsAndroid, Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      if (result === RESULTS.GRANTED) {
        console.log('Camera permission granted');
      } else {
        console.log('Camera permission denied');
      }
    }
  };


const QRCodeDisplay = ({ API_URL }) => {
    const [qrImageUri, setQrImageUri] = useState(null);

    useEffect(() => {
        const fetchTokenAndQR = async () => {
            const token = await AsyncStorage.getItem('userToken');
            fetch(`${API_URL}users/code/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.text())
            .then(data => {
                console.log('Received data:', data);
                setQrImageUri(data);
            })
            .catch(error => {
                console.error('Error fetching QR code:', error);
            });
        };

        fetchTokenAndQR();
    }, [API_URL]);

    return (
        <View style={styles.qrContainer}>
            {qrImageUri ? (
                <Image source={{ uri: qrImageUri }} style={styles.qrImage} />
            ) : (
                <Text>Chargement du QR Code...</Text>
            )}
            <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Copied')}>
                <Icon name="content-copy" size={24} color="#FFF" />
                <Text style={styles.textStyle}>GHIIH665X</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    qrContainer: {
        //width: 350,
        height: 450,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginHorizontal:30,
        marginBottom:40,
        marginVertical:40,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    textStyle: {
        marginLeft: 10,
        color: '#FFF',
    }
});

export default QRCodeDisplay;
