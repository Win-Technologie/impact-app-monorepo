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
} from "react-native";
import { useTranslation } from "react-i18next";
import DualOptionButtonStep from "../../../components/SignUp/dualBottomButtonsSteps";
import { router } from "expo-router";
import { SimpleLineIcons } from "@expo/vector-icons";
import ImagePickerModal from "../../../components/ImagePickerModal";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilState } from "recoil";
import {
  userDetailsState,
  licenceScanState,
} from "../../../GlobalState/userDetailState";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ScanPermis() {
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

  // const [userDetails, setUserDetails] = useRecoilState(userDetailsState);

  const userDetails = {
    address: "32 rue desmarchais",
    alternateAddress: "",
    alternateCity: "",
    alternateCountry: "",
    alternatePostalCode: "",
    alternateProvince: "",
    birthDay: "1998-06-11",
    city: "Longueil",
    companyName: "",
    country: "CA",
    email: "",
    gender: "M",
    lastName: "Onana onana",
    licenseCategory: "5",
    licenseDelivery: "2022-05-08",
    licenseExpiration: "2027-04-09",
    licenseMention: "Rien",
    licenseNumber: "1365889t86",
    name: "Joe",
    phone: "4388833759",
    postalCode: "J4j2x9",
    province: "Qu�bec",
    typeAccount: "free",
  };

  const openPickupImage = (nber) => {
    if (nber == 1) {
      setVisible1(true);
    } else if (nber == 2) {
      setVisible2(true);
    } else if (nber == 3) {
      setVisible3(true);
    }

    setCameraNumber(nber);
    setImage(null);
  };

  const handlePressBack = () => {
    router.back();
  };

  const showToastSuccesToast = () => {
    ToastAndroid.showWithGravityAndOffset(
      t("signUpLandingPage.drivenlicencesave"),
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  const handlePressContinue = async () => {
    if (!rectoImage || !versoImage || !selfie) {
      Alert.alert(
        "Incomplet",
        "Vous devez uploader toutes les photos requises avant de continuer.",
        [
          {
            text: "Ok",
            onPress: () => {},
            style: "cancel",
          },
        ],
      );
    } else {
      let requestData = {
        /*"number": "C6126-140989-03",
                "birthdate": "1989/09/14",
                "address": "1530 Av.Filion",
                "appartment": "302",
                "province": "QC",
                "postalCode": "J4R1W4",
                "licenseClass": "5",
                "sex": "m",
                "rest": "non",
                "mention": "non",
                "referenceNumber": "PF8181RM1",
                "height": "1.82",
                "weight": "87",
                "issued": "2021/12/09",
                "expires": "2029/09/14",
                "city": "Saint-Lambert",
                "country": "Canada",*/

        number: userDetails.licenseNumber, // "C6126-140989-03",
        birthdate: userDetails.birthDay.replaceAll("-", "/"), // "1989/09/14",
        address: userDetails.address, //"1530 Av.Filion",
        //appartment: "302",
        province: "QC",
        postalCode: userDetails.postalCode.trim(), //"J4R1W4",
        licenseClass: userDetails.licenseCategory, // "5"
        sex: userDetails.gender.toLowerCase(), //"m",
        rest: "non",
        mention: "non",
        referenceNumber: "PF8181RM1",
        height: "1.82",
        weight: "87",

        issued: userDetails.licenseDelivery.replaceAll("-", "/"), // "2021/12/09",
        expires: userDetails.licenseExpiration.replaceAll("-", "/"), // "2029/09/14",
        city: userDetails.city, // "Saint-Lambert",
        country: "Canada", // userDetails.country,// Pas le code mais nom du pays avec au moins 4 char*/
        photoRecto: rectoImage,
        photoVerso: versoImage, // "rwweqopkpkqewf49", //versoImage,
        photoSelfie: versoImage, // selfie,
      };

      try {
        // Send user details
        // console.log(userDetailsPayload);

        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          console.error("No token provided");
          return;
        }

        setLoadingModalVisible(true);
        const userDetailsUrl = `${API_URL}dl/user/license`;

        const userResponse = await fetch(userDetailsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        //console.log(userResponse);
        // const userData = await userResponse.json();
        // console.log(userData);

        setLoadingModalVisible(false);
        setLicenceScan(true);
        router.push("/signup/signUpLanding");
        showToastSuccesToast();

        //console.log(userData);
        /*if (userData.msg == "Nouvelle licence ajout�e avec succ�s") {

                    console.log("okay")
                } else {

                    console.log("echec");
                }*/
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    }
  };

  /*useEffect(() => {

        if (!visible) {

            if (cameraNber == 1) {

                setRectoImage(image);

            } else if (cameraNber == 2) {

                setVersoImage(image);

            } else {

                setSelfie(image);

            }

        }

    }, [visible]);*/

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.titleText}>
          Veuilez Scanner et faire verifier votre permis de conduire
        </Text>

        <View
          style={{ padding: 2, alignItems: "center", justifyContent: "center" }}
        >
          <TouchableOpacity
            style={styles.UploadButton}
            onPress={() => {
              openPickupImage(1);
            }}
          >
            {!rectoImage ? (
              <SimpleLineIcons name="cloud-upload" size={24} color="#1B6878" />
            ) : (
              <SimpleLineIcons name="check" size={24} color="green" />
            )}

            <Text style={styles.text}>
              Telecharger une photo du{" "}
              <Text style={{ color: "#0B7BA8" }}>recto</Text> de votre
              permis{" "}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            padding: 2,
            alignItems: "center",
            marginVertical: 20,
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            style={styles.UploadButton}
            onPress={() => {
              openPickupImage(2);
            }}
          >
            {!versoImage ? (
              <SimpleLineIcons name="cloud-upload" size={24} color="#1B6878" />
            ) : (
              <SimpleLineIcons name="check" size={24} color="green" />
            )}

            <Text style={styles.text}>
              Telecharger une photo du{" "}
              <Text style={{ color: "#0B7BA8" }}>verso</Text> de votre
              permis{" "}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            padding: 2,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={styles.UploadButton}
            onPress={() => {
              openPickupImage(3);
            }}
          >
            {!selfie ? (
              <SimpleLineIcons name="cloud-upload" size={24} color="#1B6878" />
            ) : (
              <SimpleLineIcons name="check" size={24} color="green" />
            )}
            <Text style={styles.text}>
              Telecharger votre{" "}
              <Text style={{ color: "#0B7BA8" }}>selfie</Text>{" "}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <DualOptionButtonStep
          onPressBack={handlePressBack}
          onPressContinue={handlePressContinue}
        />
      </View>

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

      <Modal
        backdropOpacity={0.7}
        isVisible={loadingModalVisible}
        onRequestClose={() => {
          setLoadingModalVisible(!loadingModalVisible);
        }}
      >
        <View style={styles.modal}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="small" color="#1B6878" />
            <Text style={{ marginTop: 10, fontSize: 12, color: "#fff" }}>
              {" "}
              {t("pleasewait")}{" "}
            </Text>
          </View>
        </View>
      </Modal>
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

  scrollviewContainer: {},

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
});
