import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeHeader({ imageUrl, children, clientName }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        <Image
          source={ require("../../assets/google.png") }
          style={styles.clientImage}
          resizeMode='cover'
        />
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>{children}</Text>
          <Text style={styles.clientName}>{clientName}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bellIconContainer}>
        <MaterialIcons name="notifications" size={32} color="black" />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom:20,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientImage: {
    width: 60,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 10,
    
  },
  clientName: {
    fontWeight: 'bold',
  },
  welcomeText: {
    marginBottom: 5, 
  },
  bellIconContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    right: 3,
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
});
