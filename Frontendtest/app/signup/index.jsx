// Mise à jour de SignUp.js pour inclure CheckboxWithText
import React, { useState, useRef } from "react";
import { View, FlatList, Button,Dimensions,StyleSheet,TouchableOpacity } from "react-native";
import HeaderComponent from "../../components/headerComponent";
import WelcomeText from "../../components/welcomeText";
import InputField from "../../components/inputFields";
import SocialButton from "../../components/socialButtons";
import CheckboxWithText from "../../components/Main/BottomTabsBar/checkBox";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";


const { width: screenWidth } = Dimensions.get('window');

export default function SignUp() {
  const [isSignInPage, setIsSignInPage] = useState(true);
  const [isPasswordShown, setPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const flatListRef = useRef();
  const navigation = useNavigation();

  const togglePasswordVisibility = () => setPasswordShown(!isPasswordShown);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordShown(!isConfirmPasswordShown);

  const goToSignInPage = () => {
    setIsSignInPage(false);
    flatListRef.current.scrollToIndex({ animated: true, index: 1 });
  };

  const goToSignUpPage = () => {
    setIsSignInPage(true);
    flatListRef.current.scrollToIndex({ animated: true, index: 0 });
  };

  // Ajustements dans la fonction renderItem
const renderItem = ({ item }) => {
  let welcomeMessage = item.key === "signIn" 
    ? "Bon retour sur l'application mobile" 
    : "Bienvenue sur l'application mobile";

  return (
    <View style={{ width: screenWidth, alignItems: 'center', padding: 20 }}>
      <WelcomeText message={welcomeMessage}/>
      <View style={{ marginRight:25}}>
        <InputField placeholder="Entrez votre courriel" />
        <InputField
          placeholder="Entrez votre mot de passe"
          secureTextEntry={!isPasswordShown}
          icon={isPasswordShown ? "eye-off" : "eye"}
          onIconPress={togglePasswordVisibility}
        />
        {item.key === "signUp" && (
          <>
            <InputField
              placeholder="Confirmez votre mot de passe"
              secureTextEntry={!isConfirmPasswordShown}
              icon={isConfirmPasswordShown ? "eye-off" : "eye"}
              onIconPress={toggleConfirmPasswordVisibility}
            />
            <CheckboxWithText
              isChecked={isChecked}
              onCheck={setChecked}
              text="J'accepte les "
              onPressText={() => navigation.navigate("TermsScreen")}
            />
          </>
        )}
        <Button
          title={item.key === "signIn" ? "Me Connecter" : "Continuer"}
          onPress={() => router.push(`${item.key === "signIn" ? '(home)/index.jsx' : 'signUpLanding.jsx'}`)}
          style={{ alignSelf: 'center' }}  
        />
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={{ flex: 1}}>
      <View style={{ flex: 1, marginHorizontal: 23, backgroundColor: "#F1F1F1"}}>
        <HeaderComponent
          isSignInPage={isSignInPage}
          goToSignInPage={goToSignInPage}
          goToSignUpPage={goToSignUpPage}
          
        />
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={[{ key: "signUp" }, { key: "signIn" }]}
          renderItem={renderItem}
          keyExtractor={(item) => item.key
          }
          ItemSeparatorComponent = {()=> <View style={{height:3,backgroundColor:'black'}}></View>}
        />
        <View style={styles.socialButtons}>
          <SocialButton
            source={require("../../../Frontendtest/assets/facebook.png")}
            onPress={() => console.log("Facebook login pressed")}
            text="Facebook"
          />
          <SocialButton
            source={require("../../../Frontendtest/assets/google.png")}
            onPress={() => console.log("Google login pressed")}
            text="Google"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20
  },
  
});