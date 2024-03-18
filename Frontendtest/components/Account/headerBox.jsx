import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Pour l'icône de modification

export default function HeaderBoxComponent({ name, email, profileImageUrl }) {
  return (
    <View style={styles.headerBox}>
      <Image
        source={{ uri: profileImageUrl }}
        style={styles.profileImage}
      />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      <TouchableOpacity style={styles.editButton}>
      <MaterialCommunityIcons name="account-edit" size={34} color="white" />
        <Text style={styles.editButtonText}>Modifier mon profil</Text>
      </TouchableOpacity>
      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    width: '100%',
    height: 366,
    backgroundColor: '#19363C',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative', // Pour le positionnement absolu de la bottomLine
    padding:45,
    
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 70, // Pour rendre l'image ronde
    borderWidth: 1,
    borderColor: 'white',
    marginBottom:20,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  email: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: '#CF8C58',
    width:220,
    height:54,
    borderRadius:5,
    justifyContent:'center'
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft:20,
  },
  bottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#CF8C5B',
  },
});
