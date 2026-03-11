import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { RecoilRoot } from "recoil";
import { router } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import MainScreen from ".";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../localization/i18n";
import { MenuProvider } from "react-native-popup-menu";
import { fr, en, registerTranslation } from "react-native-paper-dates";
import { Stack } from "expo-router";

function applyRecoilReact19Compat() {
  const reactClientInternals =
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  if (
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    !reactClientInternals
  ) {
    return;
  }

  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
    ReactCurrentDispatcher: {
      get current() {
        return reactClientInternals.H;
      },
      set current(value) {
        reactClientInternals.H = value;
      },
    },
    ReactCurrentOwner: {
      get currentDispatcher() {
        return reactClientInternals.H;
      },
      set currentDispatcher(value) {
        reactClientInternals.H = value;
      },
    },
  };
}

applyRecoilReact19Compat();

//registerTranslation('fr', fr)
//registerTranslation('en-GB', enGB)
registerTranslation("en", en);

SplashScreen.preventAutoHideAsync();
export default function _layout() {
  const [fontsLoaded, fontError] = useFonts({
    bold: require("../assets/Font/InterBold.ttf"),
    demiBold: require("../assets/Font/InterSemiBold.ttf"),
    medium: require("../assets/Font/InterMedium.ttf"),
    regular: require("../assets/Font/InterRegular.ttf"),
    light: require("../assets/Font/InterLight.ttf"),
    thin: require("../assets/Font/InterThin.ttf"),
  });

  useEffect(() => {
    const redirect = async () => {
      setTimeout(async () => {
        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
      }, 3000);
    };

    redirect();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontsLoaded) {
    return null;
  }
  return (
    <RecoilRoot>
      <MenuProvider>
        <Slot />
      </MenuProvider>
    </RecoilRoot>
  );
}
