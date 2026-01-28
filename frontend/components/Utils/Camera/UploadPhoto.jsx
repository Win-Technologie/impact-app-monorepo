import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export default function UploadPhoto() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectImage = async () => {
    setIsLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 2,
      aspect: [4, 3],
      quality: 1,
    });
    setIsLoading(false);
    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      setPhotos(selectedImages);
    }
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Button title="choisir une image" onPress={selectImage} />
      <View style={{ flexDirection: "row" }}>
        {isLoading ? (
          <View style={{ marginVertical: 5 }}>
            <Text
              style={{ marginVertical: 5, color: "gray", fontWeight: "bold" }}
            >
              {" "}
              Chargement des images...{" "}
            </Text>
            <ActivityIndicator
              style={{ marginVertical: 5 }}
              size="small"
              color="#0B8BA8"
            />
          </View>
        ) : (
          photos &&
          photos.map((item, key) => (
            <Image
              key={key}
              source={{ uri: item }}
              style={{ height: 150, width: 150 }}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
