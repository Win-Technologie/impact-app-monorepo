import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import ImagePickerModal from "../ImagePickerModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, router } from "expo-router";
export default function HeaderBox({ name, email, selfie, setSelfie }) {
  const [filePath, setFilePath] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const { t } = useTranslation();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const HOST_URL = API_URL.replace("api/", "");
  const navigation = useNavigation();

  const createFormData = (photoOrUri, body = {}) => {
    // Accept either an object { uri, fileName } or a uri string
    const isString = typeof photoOrUri === "string";
    const uri = isString ? photoOrUri : photoOrUri?.uri;
    if (!uri) throw new Error("No image URI provided for upload");

    const filename = isString
      ? uri.split("/").pop() || `photo_${Date.now()}.jpg`
      : photoOrUri.fileName || uri.split("/").pop() || `photo_${Date.now()}.jpg`;

    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";

    const data = new FormData();
    data.append("image", {
      name: filename,
      type: type,
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
    });

    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });

    return data;
  };

  const handleUploadPhoto = async (photoOrUri) => {
    console.log("[headerBox] handleUploadPhoto called with:", photoOrUri);
    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      console.error("No token provided");
      return;
    }
    console.log("[headerBox] sending upload to", `${API_URL}users/user/upload-profile-image`);
    const original = photoOrUri;
    fetch(`${API_URL}users/user/upload-profile-image`, {
      method: "PATCH",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      body: createFormData(photoOrUri, { userId: "123" }),
    })
      .then((response) => response.json())
      .then(async (response) => {
        console.log("[headerBox] upload response:", response);
        if (!response || !response.imagePath) {
          console.error("[headerBox] upload response missing imagePath", response);
          // Persist local image so UI doesn't revert while server fails
          try {
            const localUri = typeof original === 'string' ? original : original?.uri;
            if (localUri) {
              await saveSelfie(localUri);
              setFilePath(localUri);
              if (typeof setSelfie === "function") setSelfie(localUri);
            }
          } catch (e) {
            console.error('[headerBox] failed to persist local image after upload error', e);
          }
          return;
        }
        let newUrl = `${HOST_URL}Backend/${response.imagePath}`;
        // normalize backslashes from server
        newUrl = newUrl.replace(/\\/g, "/");
        console.log("[headerBox] newUrl ->", newUrl);
        await saveSelfie(newUrl);
        console.log("[headerBox] saved selfie to AsyncStorage");
        setFilePath(newUrl);
        // update parent state so the header shows the persisted image
        if (typeof setSelfie === "function") {
          setSelfie(newUrl);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  React.useEffect(() => {
    // Trigger upload when a new local selfie URI is provided and the
    // image picker modal is not visible. Skip upload when the selfie
    // is already an uploaded HTTP URL (prevents re-uploading and
    // overwriting the stored image).
    if (!selfie || visible) return;

    // If selfie is a string and already points to a hosted URL, don't upload.
    if (typeof selfie === "string") {
      const isHttp = selfie.startsWith("http://") || selfie.startsWith("https://");
      const isGridFsPath = selfie.includes("/user/profile-image/") || selfie.includes("/user/driving-licence-photo/");
      if (isHttp || isGridFsPath) {
        console.log("[headerBox] selfie is already hosted, skipping upload ->", selfie);
        // Ensure local state reflects the hosted URL
        if (selfie !== filePath) {
          setFilePath(selfie);
          saveSelfie(selfie);
        }
        return;
      }
    }

    // Otherwise treat as a local uri/object and upload it
    console.log("[headerBox] uploading local selfie ->", selfie);
    handleUploadPhoto(selfie);
  }, [selfie, visible]);

  const saveSelfie = async (selfie) => {
    const payload = JSON.stringify({ url: selfie, ts: Date.now() });
    await AsyncStorage.setItem("selfie", payload);
  };

  const getSelfie = async () => {
    const s = await AsyncStorage.getItem("selfie");
    let parsed;
    try {
      parsed = s ? JSON.parse(s) : null;
    } catch (e) {
      parsed = { url: s, ts: 0 };
    }
    // Only update filePath if AsyncStorage has a non-empty value
    // and it differs from the currently-displayed filePath. This
    // prevents a late read returning null and clearing the image.
    if (parsed && parsed.url && parsed.url !== filePath) {
      setFilePath(parsed.url);
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getSelfie();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.headerBox}>
      <View>
        <Image
          source={
            // Prefer the uploaded filePath URL, then the local selfie URI, then fallback avatar
            filePath
              ? { uri: filePath }
              : selfie
              ? { uri: selfie }
              : require("../../assets/avatar.jpg")
          }
          style={styles.profileImage}
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          setVisible(true);
        }}
        style={{
          position: "relative",
          bottom: 35,
          left: 30,
          borderWidth: 1,
          height: 30,
          width: 30,
          borderRadius: 18,
          borderColor: "#CF8C58",
          alignContent: "center",
          justifyContent: "center",
          alignSelf: "center",
          backgroundColor: "#CF8C58",
        }}
      >
        <Text style={{ textAlign: "center" }}>
          <MaterialCommunityIcons name="camera" color="white" size={20} />
        </Text>
      </TouchableOpacity>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => router.push("profile/editProfile")}
      >
        <MaterialCommunityIcons name="account-edit" size={34} color="white" />
        <Text style={styles.editButtonText}>
          {t("account.modifyyourprofil")}
        </Text>
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
