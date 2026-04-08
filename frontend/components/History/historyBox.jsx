import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function HistoryBoxComponent({
  date,
  description,
  people = [],
  accidentImageUri,
  onPress,
  width = "100%",
  height = 100,
  style,
}) {
  // Styles combinés pour le composant de la boîte
  const boxStyles = [styles.box, { width, height }];

  // choose first image: if accidentImageUri is array, use first element
  let thumbnailUri = null;
  if (Array.isArray(accidentImageUri)) {
    thumbnailUri = accidentImageUri.length ? accidentImageUri[0] : null;
  } else {
    thumbnailUri = accidentImageUri;
  }

  return (
    <TouchableOpacity style={boxStyles} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.row}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.content}>
          <Text style={styles.dateTitle}>{new Date(date).toLocaleString()}</Text>
          <Text numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "white",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "stretch",
  },

  dateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start", // Aligner le titre à gauche
  },

  description: {
    fontSize: 14,
    marginVertical: 5,
    alignSelf: "flex-start", // Aligner la description à gauche
  },

  personImagesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  personImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 5, // Espacer les images des personnes
  },

  accidentImage: {
    width: 100,
    height: 100,
    marginTop: 5,
  },

  bottomLine: {
    height: 0,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#eee",
  },

  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#eee",
  },

  content: {
    flex: 1,
  },
});

// borderBottomLeftRadius: 5,
//     borderBottomRightRadius: 5,
