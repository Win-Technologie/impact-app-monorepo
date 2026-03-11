import {
  StyleSheet,
  View,
  ImageBackground,
  Animated,
  FlatList,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import MainPageListItem from "../components/MainPageListItem";
import { router } from "expo-router";
import MainPageButton from "../components/Main/BottomTabsBar/MainPageButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
//import { Stack } from 'expo-router';

export default function MainScreen() {
  const [dataIndex, setDataIndex] = useState(0);
  const slideUpAnim = useRef(new Animated.Value(400)).current;
  const slideAnim = useRef(new Animated.Value(-1000)).current;
  const [showPopup] = useState(true);
  const { t, i18n } = useTranslation();

  const onSkipPress = () => {
    router.push("/signIn");
  };

  const getLanguage = async () => {
    const val = await AsyncStorage.getItem("language");
    return val;
  };

  useEffect(() => {
    getLanguage().then((val) => {
      if (val) {
        i18n.changeLanguage(val);
      } else {
        i18n.changeLanguage(val);
      }
    });
  }, []);

  useEffect(() => {
    if (showPopup) {
      Animated.sequence([
        Animated.timing(slideUpAnim, {
          toValue: 500,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(slideUpAnim, {
          toValue: -3,
          stiffness: 100,
          damping: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideUpAnim.setValue(400);
    }

    if (showPopup) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [showPopup, dataIndex]);

  const data = [
    {
      title: t("mainScreen.complicatedSituationTitle"),
      description: t("mainScreen.complicatedSituationDescription"),
      showButton: true,
    },
    {
      title: t("mainScreen.quickResolutionTitle"),
      description: t("mainScreen.quickResolutionDescription"),
      showButton: true,
    },
    {
      title: t("mainScreen.dataSecurityTitle"),
      description: t("mainScreen.dataSecurityDescription"),
      showButton: false,
    },
  ];

  const onNextPress = () => {
    if (dataIndex < data.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -1000,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setDataIndex((prevIndex) => prevIndex + 1);

        slideAnim.setValue(1000);

        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const onRegisterPress = () => {
    router.push("signup");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        //source={{ uri: '../../assets/fond.png' }}
        source={require("../assets/fond.png")}
        resizeMode="cover"
        style={{ flex: 1, justifyContent: "center", width: "100%" }}
      >
        <Animated.View
          style={[
            styles.popupContainer,
            { transform: [{ translateY: dataIndex === 0 ? slideUpAnim : 0 }] },
          ]}
        >
          <View style={styles.popupContent}>
            <FlatList
              data={[data[dataIndex]]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <MainPageListItem item={item} slideAnim={slideAnim} />
              )}
            />
            <MainPageButton
              slideAnim={slideAnim}
              onNextPress={() => onNextPress(data, setDataIndex, slideAnim)}
              onRegisterPress={onRegisterPress}
              showRegisterButton={!data[dataIndex].showButton}
              onSkipPress={onSkipPress}
            />
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },

  popupContainer: {
    position: "absolute",
    bottom: -5,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    //borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
    borderWidth: 1,
    height: "40%",
    borderColor: "#ccc",
    alignItems: "center",
  },
  popupContent: {
    width: "100%",
    alignItems: "center",
  },
});
