import { StyleSheet, Text, View, Button } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Camera, cameraType } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";

export default function TakePhoto() {
  const [imageFront, setImageFront] = useState();
  const [imageBack, setImageBack] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const takePhoto = async (type) => {
    console.log(type);
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.back,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        type === "front"
          ? setImageFront(result.assets[0].uri)
          : setImageBack(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log("front", imageFront);
  console.log("back", imageBack);

  return (
    <View style={styles.container}>
      <Button title="prends a photo recto" onPress={() => takePhoto("front")} />
      <Button title="prends a photo verso" onPress={() => takePhoto("back")} />
    </View>
  );
}

const styles = StyleSheet.create({});
