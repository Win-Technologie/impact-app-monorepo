// AnimatedButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const AnimatedButton = ({ onPress, title, customStyle, textStyle }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, customStyle]}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'grey',
        marginBottom:20,
        height:51,
      },
      buttonText: {
        color: 'grey',
        fontSize: 16,
      },
});

export default AnimatedButton;
