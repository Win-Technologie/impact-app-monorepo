import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet, View, Modal } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Icon from "react-native-vector-icons/MaterialIcons"; // Assurez-vous d'avoir installé cette bibliothèque
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";

export default function DeclarationPage() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState("1");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "2 individus", value: "2" },
    { label: "3 individus", value: "3" },
    { label: "4 individus", value: "4" },
    { label: "5 individus", value: "5" },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      {/*<Text style={styles.mainTitle}>
        Nous récoltons vos informations pour vous aider
      </Text>
      <Text style={styles.subTitle}>
        Que vous soyez seul ou plusieurs à être impliqué, il y a des démarches à
        suivre lors d'un accident de voiture
      </Text>*/}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonStyle}>
          <Icon name="person" size={30} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            Je suis le seul individu impliqué
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            setDropdownVisible(true);
            setOpen(!open); // Basculer l'état open ici permet d'ouvrir ou de fermer le menu
          }}
        >
          <Icon name="people" size={30} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            Nous sommes plusieurs individus impliqués
          </Text>
        </TouchableOpacity>
        {dropdownVisible && (
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            zIndex={3000}
            zIndexInverse={1000}
            placeholder="Nombre d'individus impliqués"
            dropDownDirection="BOTTOM"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            onChangeValue={(value) => {
              console.log("Value selected:", value);
              setOpen(false); // Fermer le DropDown après une sélection
            }}
          />
        )}

        {/* <Modal
          animationType='slide'
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <View style={styles.modalView}>
            <Picker
              selectedValue={selectedValue}
              style={styles.pickerStyle}
              onValueChange={(itemValue, itemIndex) => {
                setSelectedValue(itemValue); // Assurez-vous que cette ligne est présente
                setMenuVisible(false); // Ferme le Modal après sélection
                console.log("Sélectionné :", itemValue); // Ajoutez ceci pour le débogage
              }}
            >
              <Picker.Item label='1 individu' value='1' />
              <Picker.Item label='2 individus' value='2' />
              <Picker.Item label='3 individus' value='3' />
              <Picker.Item label='4 individus' value='4' />
              <Picker.Item label='5 individus' value='5' />
            </Picker>
          </View>
        </Modal> */}
      </View>

      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continuer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },

  mainTitle: {
    fontSize: 22,
    fontFamily: "bold",
    textAlign: "left",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  subTitle: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: "regular",
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 20, // Largeur complète pour le centrage
  },
  buttonContainer: {
    width: "100%", // Utilise toute la largeur disponible
    paddingHorizontal: 20,
  },
  buttonStyle: {
    flexDirection: "row",
    backgroundColor: "#0B8BA8",
    justifyContent: "flex-start", // Centre les éléments à l'intérieur du bouton
    paddingVertical: 20,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
    width: "100%", // Largeur complète pour une taille uniforme
    flexWrap: "wrap",
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
    flexShrink: 1,
  },
  continueButton: {
    position: "absolute",
    bottom: 20,
    // left: 25,
    right: 36,
    backgroundColor: "#0B8BA8",
    paddingVertical: 15,
    borderRadius: 5,
    width: "90.5%", // Utilise presque toute la largeur avec un petit padding
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  modalView: {
    marginTop: "50%",
    marginHorizontal: "10%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerStyle: {
    width: 150,
    height: 150,
  },
  dropdown: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#dfdfdf",
    borderBottomWidth: 1,
  },
  dropdownContainer: {
    backgroundColor: "#ffffff",
  },
});
