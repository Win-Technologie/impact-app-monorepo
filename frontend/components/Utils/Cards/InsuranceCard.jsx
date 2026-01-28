import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import InfoItem from "./InfoItem/InfoItem";

/**
 * @param {string} policyNumber - Le numéro de la police d'assurance.
 * @param {string} insuranceCompany - Le nom de la compagnie d'assurance.
 * @param {string} VehiculeNumber - Le numéro de plaque du véhicule.
 * @param {string} model - Le modèle du véhicule.
 * @param {string} year - L'année du véhicule.
 * @returns Un composant React qui affiche une liste d'InfoItem pour chaque détail du véhicule.
 */
export default function InsuranceCard({
  policyNumber,
  insuranceCompany,
  VehiculeNumber,
  model,
  year,
}) {
  // Création d'un tableau contenant les détails du véhicule et de l'assurance pour les afficher.
  const details = [
    { title: "Nom d'assurance", content: insuranceCompany },
    { title: "Police d'assurance", content: policyNumber },
    { title: "Modèle de votre voiture", content: model },
    { title: "Année de votre voiture", content: year },
    { title: "Numéro de plaque", content: VehiculeNumber },
  ];

  return (
    <View style={styles.card}>
      {details.map((detail, index) => (
        <InfoItem key={index} title={detail.title} content={detail.content} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 10,
    gap: 20,
  },
});
