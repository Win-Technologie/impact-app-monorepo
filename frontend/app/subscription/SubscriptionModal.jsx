import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

export default function SubscriptionModal({ visible, onClose }) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const handleContinue = () => {
    onClose();
    router.push({
      pathname: "subscription/payment",
      params: { plan: selectedPlan },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Sélectionner un forfait</Text>

          <TouchableOpacity
            style={[
              styles.option,
              selectedPlan === "monthly" && styles.selectedOption,
            ]}
            onPress={() => setSelectedPlan("monthly")}
          >
            <View style={styles.radioButton}>
              {selectedPlan === "monthly" && (
                <View style={styles.radioButtonSelected} />
              )}
            </View>
            <View>
              <Text style={styles.optionTitle}>Mensuel</Text>
              <Text style={styles.optionPrice}>2,98$ / mois</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              selectedPlan === "annual" && styles.selectedOption,
            ]}
            onPress={() => setSelectedPlan("annual")}
          >
            <View style={styles.radioButton}>
              {selectedPlan === "annual" && (
                <View style={styles.radioButtonSelected} />
              )}
            </View>
            <View>
              <Text style={styles.optionTitle}>Annuel</Text>
              <Text style={styles.optionPrice}>17,98$ / an</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleContinue}
            >
              <Text style={styles.confirmButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 15,
  },
  selectedOption: {
    borderColor: "#0B8BA8",
    backgroundColor: "#F0F9FB",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#0B8BA8",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0B8BA8",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#19363C",
  },
  optionPrice: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F1F1",
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#CF8C58",
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "#19363C",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
