import { View, Text } from 'react-native'
import React, {useEffect} from 'react';
import { Stack } from 'expo-router';
import {RecoilRoot} from "recoil"; 
import {useFonts} from "expo-font";
import * as SplashScreen from 'expo-splash-screen';



SplashScreen.preventAutoHideAsync();
export default function _layout() {
  const [fontsLoaded, fontError] = useFonts({
    bold: require('../assets/Font/InterBold.ttf'),
    demiBold: require('../assets/Font/InterSemiBold.ttf'),
    medium: require('../assets/Font/InterMedium.ttf'),
    regular: require('../assets/Font/InterRegular.ttf'),
    light: require('../assets/Font/InterLight.ttf'),
    thin: require("../assets/Font/InterThin.ttf")
  });

  useEffect(() => {
    const redirect = async () => {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    };

    redirect(); 
},[fontsLoaded, fontError]); 

if(!fontsLoaded && !fontsLoaded) {
  return null;
}
  return (
     <RecoilRoot>
       <Stack
         screenOptions={{
          headerShown: false,
        }}
       > 
       <Stack.Screen name="(home)"/>
       </Stack>
     </RecoilRoot>
  )
}