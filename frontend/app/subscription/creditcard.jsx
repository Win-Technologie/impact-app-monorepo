import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreditCard() {
  const { t } = useTranslation();
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted;
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + " / " + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleConfirm = async () => {
    // Validate all fields are filled
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    // Validate card name contains only letters and spaces
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(cardName)) {
      Alert.alert("Erreur", "Le nom ne doit contenir que des lettres");
      return;
    }

    // Validate card number contains only digits and is 16 digits long
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (!/^\d+$/.test(cleanedCardNumber)) {
      Alert.alert("Erreur", "Le numéro de carte ne doit contenir que des chiffres");
      return;
    }
    if (cleanedCardNumber.length !== 16) {
      Alert.alert("Erreur", "Le numéro de carte doit contenir 16 chiffres");
      return;
    }

    // Validate expiry date
    const expiryParts = expiryDate.split(" / ");
    if (expiryParts.length !== 2) {
      Alert.alert("Erreur", "Format de date d'expiration invalide (MM / AA)");
      return;
    }
    const month = parseInt(expiryParts[0], 10);
    const year = parseInt(expiryParts[1], 10);
    if (month < 1 || month > 12) {
      Alert.alert("Erreur", "Le mois doit être entre 01 et 12");
      return;
    }
    // Check if card is expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      Alert.alert("Erreur", "La carte est expirée");
      return;
    }

    // Validate CVV contains only digits and is 3 digits
    if (!/^\d{3}$/.test(cvv)) {
      Alert.alert("Erreur", "Le CVV doit contenir exactement 3 chiffres");
      return;
    }
    
    // Save payment method
    try {
      const lastFour = cardNumber.replace(/\s/g, "").slice(-4);
      const methods = await AsyncStorage.getItem("paymentMethods");
      const savedMethods = methods ? JSON.parse(methods) : [];
      
      savedMethods.push({
        type: "visa",
        lastFour: lastFour,
        name: cardName,
      });
      
      await AsyncStorage.setItem("paymentMethods", JSON.stringify(savedMethods));
      
      Alert.alert(
        "Succès",
        "Carte ajoutée avec succès!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log("Error saving payment method:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder la carte");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#19363C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajout d'un mode de paiement</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="#B0B0B0"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de la carte</Text>
              <TextInput
                style={styles.input}
                placeholder="XXX XXXX XXXX XXX"
                placeholderTextColor="#B0B0B0"
                value={cardNumber}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, ""); // Remove non-digits
                  if (cleaned.length <= 16) {
                    setCardNumber(formatCardNumber(cleaned));
                  }
                }}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Date d'expiration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM / AA"
                  placeholderTextColor="#B0B0B0"
                  value={expiryDate}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "");
                    if (cleaned.length <= 4) {
                      setExpiryDate(formatExpiryDate(cleaned));
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={7}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Code de sécurité (CVV)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#B0B0B0"
                  value={cvv}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, ""); // Remove non-digits
                    if (cleaned.length <= 3) {
                      setCvv(cleaned);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={styles.cameraButton}>
              <MaterialIcons name="camera-alt" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#19363C",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    flex: 1,
    position: "relative",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#19363C",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#19363C",
  },
  row: {
    flexDirection: "row",
  },
  cameraButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#CF8C58",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  confirmButton: {
    backgroundColor: "#0B8BA8",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
