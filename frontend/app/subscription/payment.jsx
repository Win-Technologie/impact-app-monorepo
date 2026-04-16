import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useFocusEffect } from "@react-navigation/native";
import { authenticateWithStripe } from "../../utils/stripeAuth";

export default function Payment() {
  const { t } = useTranslation();
  const { plan } = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [savedMethods, setSavedMethods] = useState([]);
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [paymentTypeSelection, setPaymentTypeSelection] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedPaymentMethods();
    }, [])
  );

  const loadSavedPaymentMethods = async () => {
    try {
      const methods = await AsyncStorage.getItem("paymentMethods");
      if (methods) {
        setSavedMethods(JSON.parse(methods));
      }
    } catch (error) {
      console.log("Error loading payment methods:", error);
    }
  };

  const handleAddPaymentMethod = () => {
    setShowPaymentTypeModal(true);
  };

  const handlePaymentTypeConfirm = async () => {
    setShowPaymentTypeModal(false);
    setPaymentTypeSelection(null);
    
    if (paymentTypeSelection === "card") {
      router.push("subscription/creditcard");
    } else if (paymentTypeSelection === "stripe") {
      // Authenticate with Stripe (Placeholder)
      setIsAuthenticating(true);
      
      const result = await authenticateWithStripe();
      
      setIsAuthenticating(false);
      
      if (result.success) {
        // Save Stripe payment method
        try {
          const methods = await AsyncStorage.getItem("paymentMethods");
          const savedMethods = methods ? JSON.parse(methods) : [];
          
          // Check if this Stripe payment method is already added
          const existingStripe = savedMethods.find(
            m => m.type === "stripe" && m.paymentMethodId === result.paymentMethodId
          );
          
          if (existingStripe) {
            Alert.alert("Information", "Cette méthode de paiement Stripe est déjà ajoutée");
          } else {
            // Add new Stripe payment method
            savedMethods.push({
              type: "stripe",
              paymentMethodId: result.paymentMethodId,
              last4: result.last4,
              brand: result.brand,
            });
            
            await AsyncStorage.setItem("paymentMethods", JSON.stringify(savedMethods));
            await loadSavedPaymentMethods();
            Alert.alert("Succès", `Méthode de paiement Stripe ajoutée`);
          }
        } catch (error) {
          console.log("Error saving Stripe:", error);
          Alert.alert("Erreur", "Impossible de sauvegarder la méthode de paiement Stripe");
        }
      } else {
        Alert.alert("Information", result.error || "Stripe integration à venir");
      }
    }
  };

  const handleSelectMethod = (index) => {
    // Toggle: if clicking the same method, deselect it
    if (selectedMethod === index) {
      setSelectedMethod(null);
    } else {
      setSelectedMethod(index);
    }
  };

  const handleDeleteMethod = async (index) => {
    Alert.alert(
      "Supprimer",
      "Voulez-vous vraiment supprimer ce mode de paiement?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedMethods = savedMethods.filter((_, i) => i !== index);
              await AsyncStorage.setItem("paymentMethods", JSON.stringify(updatedMethods));
              setSavedMethods(updatedMethods);
              // If the deleted method was selected, deselect
              if (selectedMethod === index) {
                setSelectedMethod(null);
              } else if (selectedMethod > index) {
                // Adjust selected index if needed
                setSelectedMethod(selectedMethod - 1);
              }
            } catch (error) {
              console.log("Error deleting payment method:", error);
              Alert.alert("Erreur", "Impossible de supprimer le mode de paiement");
            }
          },
        },
      ]
    );
  };

  const handleStartSubscription = () => {
    if (savedMethods.length === 0) {
      Alert.alert("Erreur", "Veuillez ajouter un mode de paiement");
      return;
    }
    if (selectedMethod === null) {
      Alert.alert("Erreur", "Veuillez sélectionner un mode de paiement");
      return;
    }
    Alert.alert(
      "Succès",
      "Votre abonnement a été activé!",
      [{ text: "OK", onPress: () => router.push("(tabs)/account") }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#19363C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paiement de l'abonnement</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t("subscription.paymentMethods")}</Text>

          {savedMethods.map((method, index) => (
            <View
              key={index}
              style={[
                styles.paymentOption,
                selectedMethod === index && styles.selectedOption,
              ]}
            >
              <TouchableOpacity
                style={styles.optionSelectArea}
                onPress={() => handleSelectMethod(index)}
              >
                <View style={styles.optionContent}>
                  {method.type === "visa" ? (
                    <>
                      <View style={styles.visaBadge}>
                        <Text style={styles.visaText}>VISA</Text>
                      </View>
                      <Text style={styles.optionText}>•••• {method.lastFour}</Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="payment" size={24} color="#635BFF" />
                      <Text style={styles.optionText}>
                        {method.brand || 'Stripe'} •••• {method.last4 || method.email}
                      </Text>
                    </>
                  )}
                </View>
                <View style={styles.radioButton}>
                  {selectedMethod === index && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMethod(index)}
              >
                <MaterialIcons name="delete-outline" size={24} color="#CF8C58" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={handleAddPaymentMethod}>
            <Text style={styles.addCardLink}>Ajouter un mode de paiement</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              * Le paiement se renouvellera automatiquement jusqu'à annulation
              de votre part.
            </Text>
          </View>

          <Text style={styles.termsText}>
            ** Des frais bancaires divers peuvent s'appliquer lors de la
            transaction. Ces frais sont externe à l'application mobile Impact et
            sont donc à la charge de l'utilisateur.
          </Text>
        </View>
      </ScrollView>

        <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleStartSubscription}
        >
          <Text style={styles.confirmButtonText}>{t("subscription.start")}</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Type Selection Modal */}
      <Modal
        visible={showPaymentTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Type de mode de paiement</Text>

            <TouchableOpacity
              style={[
                styles.modalOption,
                paymentTypeSelection === "card" && styles.selectedModalOption,
              ]}
              onPress={() => setPaymentTypeSelection("card")}
            >
              <View style={styles.modalOptionContent}>
                <View style={styles.visaBadge}>
                  <Text style={styles.visaText}>VISA</Text>
                </View>
                <Text style={styles.modalOptionText}>
                  Carte de crédit ou de débit
                </Text>
              </View>
              <View style={styles.radioButton}>
                {paymentTypeSelection === "card" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                paymentTypeSelection === "stripe" && styles.selectedModalOption,
              ]}
              onPress={() => setPaymentTypeSelection("stripe")}
            >
              <View style={styles.modalOptionContent}>
                <View style={styles.stripeBadge}>
                  <Text style={styles.stripeBadgeText}>Stripe</Text>
                </View>
                <Text style={styles.modalOptionText}>Stripe (à venir)</Text>
              </View>
              <View style={styles.radioButton}>
                {paymentTypeSelection === "stripe" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPaymentTypeModal(false);
                  setPaymentTypeSelection(null);
                }}
              >
                <Text style={styles.cancelButtonText}>{t("buttons.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.continueButton]}
                onPress={handlePaymentTypeConfirm}
                disabled={!paymentTypeSelection}
              >
                <Text style={styles.continueButtonText}>{t("buttons.continue")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Modal for Stripe Authentication */}
      <Modal
        visible={isAuthenticating}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0B8BA8" />
            <Text style={styles.loadingText}>Connexion à Stripe...</Text>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 14,
    color: "#B0B0B0",
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "white",
    overflow: "hidden",
  },
  selectedOption: {
    borderColor: "#0B8BA8",
    backgroundColor: "#F0F9FB",
  },
  optionSelectArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  deleteButton: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#19363C",
    marginLeft: 15,
  },
  visaBadge: {
    backgroundColor: "#1A1F71",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  visaText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#0B8BA8",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0B8BA8",
  },
  addCardLink: {
    color: "#CF8C58",
    fontSize: 14,
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  termsText: {
    fontSize: 11,
    color: "#999",
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "white",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#19363C",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 15,
  },
  selectedModalOption: {
    borderColor: "#0B8BA8",
    backgroundColor: "#F0F9FB",
  },
  modalOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 15,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#19363C",
    marginLeft: 15,
    flexShrink: 1,
  },
  stripeBadge: {
    backgroundColor: "#635BFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stripeBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F1F1",
    marginRight: 10,
  },
  continueButton: {
    backgroundColor: "#CF8C58",
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "#19363C",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Loading overlay styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    minWidth: 200,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#19363C",
    fontWeight: "500",
  },
});
