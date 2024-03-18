import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const HeaderComponent = ({ isSignInPage, goToSignInPage, goToSignUpPage }) => (
  <View style={{ flexDirection: "row" ,paddingTop:30 , marginLeft:9}}>
    <TouchableOpacity
      style={{ marginRight: 5 ,}}
      onPress={goToSignInPage}
      disabled={!isSignInPage}
    >
      <Text style={{ color: isSignInPage ? '#19363C' : '#ccc' }}>Connexion |</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={goToSignUpPage}
      disabled={isSignInPage}
    >
      <Text style={{ color: !isSignInPage ? '#19363C' : '#ccc' }}>Inscription</Text>
    </TouchableOpacity>
  </View>
);

export default HeaderComponent;
