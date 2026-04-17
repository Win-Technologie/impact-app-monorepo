/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Modal,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import DualOptionButtonStep from "../../../components/SignUp/dualBottomButtonsSteps";
import { router } from "expo-router";
import { SimpleLineIcons } from "@expo/vector-icons";
import ImagePickerModal from "../../../components/ImagePickerModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilState } from "recoil";
import {
  userDetailsState,
  licenceScanState,
} from "../../../GlobalState/userDetailState";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ScanPermis() {
  // Add missing navigation handlers
  const handlePressBack = () => {
    router.back();
  };
  const handlePressContinue = async () => {
    // Upload images to backend (if present) then save URIs locally
    try {
      const token = await AsyncStorage.getItem("userToken");
        if (!token) {
        // still save locally and continue
        await AsyncStorage.setItem('user_selfie', selfie || '');
        await AsyncStorage.setItem('user_recto', rectoImage || '');
        await AsyncStorage.setItem('user_verso', versoImage || '');
        Alert.alert(t("common.success", { defaultValue: 'Succès' }), t("common.informationSaved", { defaultValue: 'Information saved' }));
        router.replace('/signup/signUpLanding');
        return;
      }

      // Build FormData
      const data = new FormData();
      const appendIf = (fieldName, uri) => {
        if (!uri) return;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        data.append(fieldName, { uri, name: filename, type });
      };

      appendIf('selfie', selfie);
      appendIf('front', rectoImage);
      appendIf('back', versoImage);

      // If any files appended, call backend endpoint
      const hasFiles = selfie || rectoImage || versoImage;
      if (hasFiles) {
        const res = await fetch(`${API_URL}users/user/upload-driving-licence-photos`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        });
        const result = await res.json();
        if (!res.ok) {
          console.log('Upload driving licence response error', result);
          Alert.alert('Erreur', 'Impossible d\'uploader les images');
        } else {
          // Optionally save returned paths in AsyncStorage
          if (result.photoSelfie) await AsyncStorage.setItem('user_selfie', result.photoSelfie);
          if (result.photoRecto) await AsyncStorage.setItem('user_recto', result.photoRecto);
          if (result.photoVerso) await AsyncStorage.setItem('user_verso', result.photoVerso);
        }
      } else {
        // No files selected — still save local URIs
        await AsyncStorage.setItem('user_selfie', selfie || '');
        await AsyncStorage.setItem('user_recto', rectoImage || '');
        await AsyncStorage.setItem('user_verso', versoImage || '');
      }

      Alert.alert(t("common.success", { defaultValue: 'Succès' }), t("common.informationSaved", { defaultValue: 'Information saved' }));
      router.replace('/signup/signUpLanding');
    } catch (e) {
      console.log('Error uploading driving licence images', e);
      Alert.alert('Erreur', "Impossible d'enregistrer les informations");
    }
  };

  // Add missing openPickupImage function
  const openPickupImage = (nber) => {
    if (nber === 1) {
      setVisible1(true);
    } else if (nber === 2) {
      setVisible2(true);
    } else if (nber === 3) {
      setVisible3(true);
    }
    setCameraNumber(nber);
    setImage(null);
  };
  const { t } = useTranslation();
  const [rectoImage, setRectoImage] = React.useState(null);
  const [versoImage, setVersoImage] = React.useState(null);
  const [selfie, setSelfie] = React.useState(null);
  const [cameraNber, setCameraNumber] = React.useState(0);
  const [visible1, setVisible1] = React.useState(false);
  const [visible2, setVisible2] = React.useState(false);
  const [visible3, setVisible3] = React.useState(false);
  const [image, setImage] = React.useState(null);
  const [loadingModalVisible, setLoadingModalVisible] = React.useState(false);
  const [, setLicenceScan] = useRecoilState(licenceScanState);

  const [userDetails, setUserDetails] = useRecoilState(userDetailsState);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollviewContainer}>
        <Text style={[styles.titleText, { marginTop: 40, textAlign: 'center' }]}> 
          Veuillez scanner et faire vérifier votre permis de conduire
        </Text>

        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={styles.UploadButton}
            onPress={() => openPickupImage(1)}
          >
            {!rectoImage ? (
              <SimpleLineIcons name="cloud-upload" size={28} color="#1B6878" />
            ) : (
              <SimpleLineIcons name="check" size={28} color="green" />
            )}
            <Text style={styles.uploadLabel}>
              Télécharger une photo du <Text style={{ color: "#0B7BA8" }}>recto</Text> de votre permis
            </Text>
          </TouchableOpacity>
          {/* Preview for recto */}
          {rectoImage && (
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Aperçu</Text>
              <Image
                source={{ uri: rectoImage }}
                style={{ width: 180, height: 120, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' }}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={styles.UploadButton}
            onPress={() => openPickupImage(2)}
          >
            {!versoImage ? (
              <SimpleLineIcons name="cloud-upload" size={28} color="#1B6878" />
            ) : (
              <SimpleLineIcons name="check" size={28} color="green" />
            )}
            <Text style={styles.uploadLabel}>
              Télécharger une photo du <Text style={{ color: "#0B7BA8" }}>verso</Text> de votre permis
            </Text>
          </TouchableOpacity>
          {/* Preview for verso */}
          {versoImage && (
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Aperçu</Text>
              <Image
                source={{ uri: versoImage }}
                style={{ width: 180, height: 120, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' }}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        <View style={styles.uploadSectionLast}>
          <TouchableOpacity
            style={styles.UploadButton}
            onPress={() => openPickupImage(3)}
          >
            {!selfie ? (
              <SimpleLineIcons name="cloud-upload" size={28} color="#1B6878" />
            ) : (
              <SimpleLineIcons name="check" size={28} color="green" />
            )}
            <Text style={styles.uploadLabel}>
              Télécharger votre <Text style={{ color: "#0B7BA8" }}>selfie</Text>
            </Text>
          </TouchableOpacity>
          {/* Preview for selfie */}
          {selfie && (
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Aperçu</Text>
              <Image
                source={{ uri: selfie }}
                style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#ccc' }}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <DualOptionButtonStep
          onPressBack={handlePressBack}
          onPressContinue={handlePressContinue}
        />
      </View>

      {/* Add ImagePickerModals for recto, verso, and selfie */}
      <ImagePickerModal
        isVisible={visible1}
        onClose={() => setVisible1(false)}
        setImage={setRectoImage}
      />
      <ImagePickerModal
        isVisible={visible2}
        onClose={() => setVisible2(false)}
        setImage={setVersoImage}
      />
      <ImagePickerModal
        isVisible={visible3}
        onClose={() => setVisible3(false)}
        setImage={setSelfie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 0,
  },

  MainTitle: {
    fontSize: 26,
    color: "#19363C",
    marginTop: 15,
    marginBottom: 25,
  },

  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  UploadButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 25,
    width: "100%",
    //marginBottom: 20,
    gap: 10,
    borderStyle: "dashed",
    borderColor: "#0B8BA8",
    alignItems: "center",
  },

  content: {
    marginTop: 10,
  },

  scrollviewContainer: {
    paddingBottom: 120,
  },
  uploadSection: {
    marginBottom: 30,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  uploadSectionLast: {
    marginBottom: 40,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  uploadLabel: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
    color: "#19363C",
    lineHeight: 22,
  },

  safeAreaContainer: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
  },

  titleText: {
    fontSize: 23,
    marginVertical: 10,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#19363C",
  },

  text: {},

  image: {
    width: 200,
    height: 200,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    backgroundColor: "#1B6878",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 200,
  },
});
