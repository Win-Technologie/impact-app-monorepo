import { SafeAreaView, Text,StyleSheet ,ScrollView,TouchableOpacity} from 'react-native'
import React from 'react'
import HeaderBoxComponent from '../../../components/Account/headerBox';
import SettingsOptions from '../../../components/Account/settingsOptions';
import Button from '../../../components/History/button';
import { router } from 'expo-router';

const userProfile = {
  name: "Michael Lessard",
  email: "Michael.lessard@example.com",
  profileImageUrl: "../../../assets/google.png",
  currentLanguage: "Français",
  appVersion: "1.0.0",
};

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
      <HeaderBoxComponent
        name={userProfile.name}
        email={userProfile.email}
        profileImageUrl={userProfile.profileImageUrl}
      />
      <SettingsOptions currentLanguage={userProfile.currentLanguage} appVersion={userProfile.appVersion}/>
      <Button
      style={styles.button}
      onPress={()=>router.push('/logout')}>
        <Text style={{color:'white',}}>Me deconnecter</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    alignItems: 'center',
    //padding: 15,
  },
  button:{
    width:334,
    height:51,
    borderRadius:5,
    backgroundColor:'#0B8BA8',
    borderRadius:5,
    
  }
});