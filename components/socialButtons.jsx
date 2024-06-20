import React from 'react';
import { TouchableOpacity, Image, Text } from 'react-native';

const SocialButton = ({ source, onPress, text }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flex: 1,
      alignItems: "center",
      flexDirection: "row",
      height: 52,
      borderWidth: 1,
      borderColor: "white",
      justifyContent: 'center',
      borderRadius: 5,
      marginRight: 4,
      backgroundColor: "white",
    }}
  >
    <Image
      source={source}
      style={{ height: 36, width: 36, marginRight: 8 }}
      resizeMode="contain"
    />
    <Text>{text}</Text>
  </TouchableOpacity>
);

export default SocialButton;
