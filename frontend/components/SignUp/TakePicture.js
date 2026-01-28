import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import { Camera } from "expo-camera";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const TakePicture = ({ setStartCamera, setImage, setNumber }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [flashMode, setFlashMode] = React.useState("off");
  const [cameraType, setCameraType] = React.useState(
    Camera.Constants.Type.back,
  );

  const __startCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status === "granted") {
      // start the camera
      // alert(status);
      setStartCamera(true);
    } else {
      Alert.alert("Access denied");
    }
  };

  const __takePicture = async () => {
    if (!camera) return;
    const photo = await camera.takePictureAsync();
    console.log(photo);
    setPreviewVisible(true);
    setCapturedImage(photo);
    setImage(photo);
    //setNumber(0);
  };

  const CameraPreview = ({ photo }) => {
    return (
      <View
        style={{
          backgroundColor: "transparent",
          flex: 1,
        }}
      >
        <View style={{ flex: 1, backgroundColor: "black" }}></View>

        <View style={{ flex: 4 }}>
          <Image
            source={{ uri: photo && photo.uri }}
            style={{
              //flex: 1,
              height: "100%",
            }}
            resizeMode="stretch"
          />
        </View>

        <View
          style={{ flex: 1, backgroundColor: "black", flexDirection: "row" }}
        >
          <TouchableOpacity
            onPress={__retakePicture}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#fff" }}>Réssayer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={__validatePicture}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#fff" }}>Ok</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const __retakePicture = () => {
    setCapturedImage(null);
    setPreviewVisible(false);
    __startCamera();
  };

  const __handleFlashMode = () => {
    if (flashMode === "on") {
      setFlashMode("off");
    } else if (flashMode === "off") {
      setFlashMode("on");
    } else {
      setFlashMode("auto");
    }
  };

  const __switchCamera = () => {
    if (cameraType === "back") {
      setCameraType("front");
    } else {
      setCameraType("back");
    }
  };

  const __validatePicture = () => {
    setPreviewVisible(false);
    setStartCamera(false);
  };

  return (
    <>
      {previewVisible && capturedImage ? (
        <CameraPreview photo={capturedImage} retakePicture={__retakePicture} />
      ) : (
        <View
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: "transparent",
          }}
        >
          <View style={{ flex: 1, backgroundColor: "black" }}></View>

          <View style={{ flex: 4, backgroundColor: "transparent" }}>
            <Camera
              style={{ flex: 1 }}
              flashMode={flashMode}
              type={cameraType}
              ratio={"1:1"}
              ref={(r) => {
                camera = r;
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                // position: 'absolute',
                bottom: 0,
                flexDirection: "row",
                flex: 1,
                width: "100%",
                padding: 20,
                justifyContent: "space-between",
                backgroundColor: "black",
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignSelf: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={__handleFlashMode}
                  style={{
                    backgroundColor: flashMode === "off" ? "#000" : "#fff",
                    borderRadius: 17,
                    height: 34,
                    width: 34,
                  }}
                >
                  <Text style={{ fontSize: 20, textAlign: "center" }}>⚡️</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  alignSelf: "center",
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={__takePicture}
                  style={{
                    width: 70,
                    height: 70,
                    bottom: 0,
                    borderRadius: 50,
                    backgroundColor: "#fff",
                  }}
                />
              </View>

              <View
                style={{ flex: 1, alignSelf: "center", alignItems: "center" }}
              >
                <TouchableOpacity onPress={__switchCamera} style={{}}>
                  <MaterialIcons name="cameraswitch" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    position: "relative",
    backgroundColor: "white",
  },

  content: {
    marginTop: 10,
  },

  scrollviewContainer: {},

  safeAreaContainer: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
  },

  titleText: {
    fontSize: 23,
    // marginHorizontal: 20,
    marginVertical: 10,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#19363C",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    height: 60,
  },

  inputSection: {
    marginVertical: 15,
  },

  absoluteButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    paddingLeft: 5,
  },
});

export default TakePicture;
