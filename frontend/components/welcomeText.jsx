import React from 'react';
import { View, Text ,Dimensions} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const WelcomeText = ({message}) => (
  <View style={{ width: screenWidth, marginTop: 25, marginBottom: 30, paddingHorizontal: 10, }}>
    <Text style={{ color: "#19363C", fontSize: 32, fontFamily: "bold", fontWeight: 500 }}>
      {message} <Text style={{ color: "#CF8C58" }}>Impact</Text><Text>.</Text>
    </Text>
  </View>
);

export default WelcomeText;
