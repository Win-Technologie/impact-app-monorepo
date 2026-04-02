/* eslint-disable eol-last */
/* eslint-disable prettier/prettier */
import React from "react";
import { SafeAreaView, Text, Pressable, StyleSheet, Modal, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

export default function ImagePickerModal({ isVisible, onClose, setImage }) {
  const pickupImage = async (mode) => {
    // Request permissions first
    if (mode === 1) {
      const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libStatus !== 'granted') {
        alert('Permission to access gallery is required!');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0] && result.assets[0].uri) {
        setImage(result.assets[0]);
        onClose();
      }
    } else {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (camStatus !== 'granted') {
        alert('Permission to access camera is required!');
        return;
      }
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0] && result.assets[0].uri) {
        setImage(result.assets[0]);
        onClose();
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <SafeAreaView style={styles.buttons}>
        <Pressable
          style={styles.button}
          onPress={() => {
            pickupImage(1);
          }}
        >
          <Ionicons
            style={styles.buttonIcon}
            name="image-sharp"
            size={26}
            color="#1B6878"
          />
          <Text style={styles.buttonText}>Galerie</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            pickupImage(2);
          }}
        >
          <Ionicons
            style={styles.buttonIcon}
            name="camera"
            size={26}
            color="#1B6878"
          />
          <Text style={styles.buttonText}>Camera</Text>
        </Pressable>
      </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  buttonIcon: {
    width: 30,
    height: 30,
    margin: 5,
  },

  buttons: {
    backgroundColor: "white",
    flexDirection: "row",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },

  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 12,
    textAlign: "center",
  },
});
