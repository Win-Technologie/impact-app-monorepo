import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRecoilValue } from "recoil";
import { notificationsPrefState } from "../../GlobalState/NotificationsPrefState";

export default function HomeHeader({
  children,
  clientName,
  selfie,
  setSelfie,
}) {
  const [filePath, setFilePath] = React.useState(null);
  const router = useRouter();
  const prefs = useRecoilValue(notificationsPrefState);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        <Image
          source={
            selfie != null
              ? { uri: `${selfie}` }
              : require("../../assets/avatar.jpg")
          }
          style={styles.clientImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>{children}</Text>
          <Text style={styles.clientName}>{clientName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bellIconContainer}
        onPress={() => {
          router.push("settings/notifications");
        }}
      >
        <MaterialIcons name="notifications" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    //paddingTop: 10,
    marginBottom: 20,
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  clientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  textContainer: {
    marginLeft: 10,
  },

  clientName: {
    fontWeight: "bold",
    marginTop: -5,
  },

  welcomeText: {
    marginBottom: 5,
  },

  bellIconContainer: {
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    right: 4,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CF8C58",
  },
});
