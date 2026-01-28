import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticateUser } from "../api/users/userApi";
import SingleBottomButton from "../../components/SignUp/SingleBottomButton";

export default function SignTabMenu({ tab }) {
  return (
    <View style={styles.toggleButtonsContainer}>
      <TouchableOpacity
        style={{ marginRight: 10 }}
        onPress={goToSignInPage}
        disabled={isSignInPage}
      >
        <Text style={{ color: isSignInPage ? "#ccc" : "#19363C" }}>
          Connexion |
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToSignUpPage} disabled={!isSignInPage}>
        <Text style={{ color: !isSignInPage ? "#ccc" : "#19363C" }}>
          Inscription
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleButtonsContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
});
