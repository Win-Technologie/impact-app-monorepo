import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image} from 'react-native';
//import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';




const QRCodePage = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleQRCodeRead = ({ type, data }) => {
    setScannedData(data);
    setIsScannerActive(false); // Turn off scanner after successful scan
    console.log('QR Code Scanned:', data);
  };


  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Camera.requestCameraPermissionsAsync();
  //     setHasPermission(status === 'granted');
  //   })();
  // }, []);

  // const handleQRCodeRead = async ({ type, data }) => {
  //   setIsScannerActive(false); // Turn off scanner after successful scan
  //   try {
  //     const scannedData = JSON.parse(data);
  //     if (scannedData.id && scannedData.iv) {
  //       await sendScannedDataToServer(scannedData);
  //     } else {
  //       alert("Invalid QR code", "The QR code is missing necessary data.");
  //     }
  //   } catch (error) {
  //     console.error("QR Code Scanning Error:", error);
  //     alert("Scanning Error", "Failed to read QR code.");
  //   }
  // };

  // const sendScannedDataToServer = async ({ id, iv }) => {
  //   try {
  //     const token = await AsyncStorage.getItem('userToken');
  //     const response = await fetch(`${API_URL}/code/read`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ id, iv })
  //     });
  
  //     if (response.ok) {
  //       const contentType = response.headers.get("content-type");
  //       if(contentType && contentType.indexOf("application/json") !== -1) {
  //         const jsonResponse = await response.json();
  //         console.log('Success:', jsonResponse);
  //         alert("Success", "Data successfully sent and found.");
  //       } else {
  //         console.log('Received non-JSON response');
  //         alert("Error", "Received non-JSON response from the server.");
  //       }
  //     } else {
  //       console.log('HTTP Error:', response.status);
  //       alert("Error", `HTTP Error ${response.status}`);
  //     }
  //   } catch (error) {
  //     console.error("Network Error:", error);
  //     alert("Network Error", "Failed to communicate with the server.");
  //   }
  // };
  if (hasPermission === null) {
    return <View><Text>Requesting for camera permission</Text></View>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
     <View style={styles.qrContainer}>
        {isScannerActive ? (
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            onBarCodeScanned={isScannerActive ? handleQRCodeRead : undefined}>
            <View style={styles.cameraView}>
              <Text style={styles.cameraText}>Scanning...</Text>
            </View>
          </Camera>
        ) : (
          <TouchableOpacity onPress={() => setIsScannerActive(true)} style={styles.imagePlaceholder}>
            <Text>Tap to start scanning</Text>
          </TouchableOpacity>
        )}
        <Text>{scannedData ? `Scanned Data: ${scannedData}` : 'No QR code scanned'}</Text>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Recevoir des informations</Text>
        
        <TouchableOpacity style={styles.infoBox} onPress={() => router.push('/personalInfo')}>
  <Icon name="person" size={34} color="#19363C" />
  <View style={styles.infoTextContainer}>
    <Text style={styles.infoTextPerso}>Informations personnelles</Text>
    <Text style={styles.subInfoTextPerso}>Nom,âge,adresse...</Text>
  </View>
  <Icon name="chevron-right" size={30} color="#000" />
</TouchableOpacity>

<TouchableOpacity style={styles.infoBox} onPress={() => router.push('/vehicleInfo')}>
<FontAwesome5 name="car" size={30} color="#19363C" />
  <View style={styles.infoTextContainer}>
    <Text style={styles.infoTextCar}>Informations du véhicule</Text>
    <Text style={styles.subInfoTextCar}>Modèle,numéro de plaque...</Text>
  </View>
  <Icon name="chevron-right" size={30} color="#000" />
</TouchableOpacity>

<TouchableOpacity style={styles.infoBox} onPress={() => router.push('/insuranceInfo')}>
<View style={styles.iconBackground}>
  <MaterialIcons name="checklist" size={30} color="white" />
</View>

  <View style={styles.infoTextContainer}>
    <Text style={styles.infoText}>Informations d'assurance</Text>
    <Text style={styles.subInfoText}>Numéro d'assurance, nom de société...</Text>
  </View>
  <Icon name="chevron-right" size={30} color="#000" />
</TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
  },
  qrContainer: {
    height: 450,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 20,
    marginHorizontal: 30,
    marginBottom: 40,
    marginVertical: 40,
  },
  camera: {
    width: 300,
    height: 300,
  },
  cameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: '#fff',
  },
  imagePlaceholder: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc', // Grey placeholder
  },
  qrImage: {
    width: 300,
    height: 300,
  },
  infoSection: {
    flexGrow: 1,
    backgroundColor: '#19363C',
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 40,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  infoSection: {
    flexGrow: 1, 
    backgroundColor: '#19363C', 
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 40,
    marginHorizontal:55,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Assure l'espacement entre les éléments
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  
  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  infoTextCar: {
    marginLeft: -57,
    fontSize: 16,
  },
  infoTextPerso: {
    marginLeft: -48,
    fontSize: 16,
  },
  subInfoText: {
    marginLeft: 10,
    fontSize: 14, 
    color: '#666',
  },
  subInfoTextPerso: {
    marginLeft: -48,
    fontSize: 14, 
    color: '#666',
  },
  subInfoTextCar: {
    marginLeft: -57,
    fontSize: 14, 
    color: '#666',
  },
  iconBackground: {
    backgroundColor: '#19363C', 
    padding: 1, 
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center'
},
iconButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#CF8C58', 
    padding: 10,
    borderRadius: 5,
    width: 180, // Largeur fixe du bouton
    height: 55,
    
},
textStyle: {
    marginLeft: 10, 
    color: 'white', 
}
});

export default QRCodePage;
