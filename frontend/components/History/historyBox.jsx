import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function HistoryBoxComponent({ date, description, people, accidentImageUri, width = "100%", height = 200, style }) {
  // Styles combinés pour le composant de la boîte
  const boxStyles = [styles.box, { width, height }];

  return (
    <View style={boxStyles}>
      <Text style={styles.dateTitle}>{date}</Text> 
      <Text style={styles.description}>{description}</Text> 
      
      <View style={styles.personImagesContainer}>
        {people.map((person, index) => (
          <Image
            key={index}
            source={{ uri: person.imageUri }}
            style={styles.personImage}
          />
        ))}
      </View>

      <Image
        source={{ uri: accidentImageUri }}
        style={styles.accidentImage}
      />

      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({

    box: {
       // flexDirection: "colunm",
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#F1F1F1',
        marginTop: 15,
        alignItems: 'flex-end', // Aligner les éléments à droite
       
    },

    dateTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: 'flex-start', // Aligner le titre à gauche
    },

    description: {
        fontSize: 14,
        marginVertical: 5,
        alignSelf: 'flex-start', // Aligner la description à gauche
    },

    personImagesContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Aligner les images des personnes à droite
    },

    personImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginLeft: 5, // Espacer les images des personnes
    },

    accidentImage: {
        width: 100, // Définissez la taille de l'image de l'accident
        height: 100,
        marginTop: 5, // Espacer l'image de l'accident des images des personnes
    },

    bottomLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 35,
        backgroundColor: '#19363C',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5
    },
});


// borderBottomLeftRadius: 5,
//     borderBottomRightRadius: 5,