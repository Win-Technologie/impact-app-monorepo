import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Assurez-vous d'avoir installé cette bibliothèque
import DropDownPicker from "react-native-dropdown-picker";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { DeclarationState } from "../../GlobalState/DeclarationState";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeclarationPage() {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState("1");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isAlone, setIsAlone] = useState(true);
  const [declaration, setDeclaration] = useRecoilState(DeclarationState);

  // console.log(declaration);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: t("yourComponent.twopeoples"), value: "2" },
    { label: t("yourComponent.threepeoples"), value: "3" },
    { label: t("yourComponent.fourpeoples"), value: "4" },
    { label: t("yourComponent.fivepeoples"), value: "5" },
  ]);

  const chooseOption = (option) => {
    if (option == 1) {
      setIsAlone(true);
    } else {
      setIsAlone(false);
    }
  };

  const next = () => {
    if (isAlone) {
      setDeclaration((prev) => ({ ...prev, individus: 1 }));
      router.navigate("declarations/onePersonne/VehicleSelectionPage");
    } else {
      if (value) {
        setDeclaration((prev) => ({ ...prev, individus: Number(value) }));
        router.navigate({
          pathname: "declarations/twoPersonnes/infoDebase",
          params: { individus: value },
        });
      } else {
        Alert.alert("Info", t("yourComponent.numberofpersoninvoved"), [
          {
            text: "Ok",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
        ]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.mainTitle}>{t("yourComponent.collectingInfo")}</Text>

      <Text style={styles.subTitle}>{t("yourComponent.accidentSteps")}</Text>

      <View style={{ flexDirection: "row", marginVertical: 10 }}>
        <TouchableOpacity
          onPress={() => {
            chooseOption(1);
          }}
          style={isAlone ? styles.selectedButton : styles.unSelectedButton}
        >
          <View style={{ flex: 1 }}>
            <Icon name="person" size={30} color={isAlone ? "#fff" : "black"} />
          </View>

          <View style={{ flex: 9 }}>
            <Text
              style={
                isAlone
                  ? styles.selectedButtonText
                  : styles.unSelectedButtonText
              }
            >
              {t("yourComponent.alone")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginVertical: 10 }}>
        <TouchableOpacity
          onPress={() => {
            chooseOption(2);
          }}
          style={!isAlone ? styles.selectedButton : styles.unSelectedButton}
        >
          <View style={{ flex: 1 }}>
            <Icon name="people" size={30} color={!isAlone ? "#fff" : "black"} />
          </View>

          <View style={{ flex: 9 }}>
            <Text
              style={
                !isAlone
                  ? styles.selectedButtonText
                  : styles.unSelectedButtonText
              }
            >
              {t("yourComponent.multiple")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        {!isAlone && (
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            zIndex={3000}
            zIndexInverse={1000}
            placeholder={t("yourComponent.numberOfIndividuals")}
            dropDownDirection="BOTTOM"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            onChangeValue={(value) => {
              // console.log("Value selected:", value);
              setOpen(false); // Fermer le DropDown après une sélection
            }}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => {
          next();
        }}
      >
        <Text style={styles.continueButtonText}>{t("buttons.continue")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 20,
  },

  mainTitle: {
    fontSize: 22,
    fontFamily: "bold",
    textAlign: "left",
    width: "100%",
    marginBottom: 20,
    marginTop: 20,
  },

  subTitle: {
    fontSize: 14,
    textAlign: "left",
    // fontFamily: 'regular',
    marginBottom: 20,
    width: "100%",
  },

  selectedButton: {
    flexDirection: "row",
    backgroundColor: "#0B8BA8",
    justifyContent: "flex-start",
    padding: 10,
    borderRadius: 5,
    justifyContent: "flex-start",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0B8BA8",
    backgroundColor: "#0B8BA8",
    height: 65,
    flex: 1,
  },

  selectedButtonText: {
    color: "#fff",
    marginLeft: 10,
    paddingHorizontal: 5,
  },

  unSelectedButton: {
    flexDirection: "row",
    backgroundColor: "#0B8BA8",
    justifyContent: "flex-start",
    padding: 10,
    borderRadius: 5,
    justifyContent: "flex-start",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
    borderColor: "#ccc",
    height: 65,
    flex: 1,
  },

  unSelectedButtonText: {
    color: "black",
    marginLeft: 10,
    paddingHorizontal: 5,
  },

  inputSection: {
    marginBottom: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
    flexShrink: 1,
  },

  continueButton: {
    position: "absolute",
    bottom: 0,
    margin: 20,
    backgroundColor: "#0B8BA8",
    paddingVertical: 15,
    borderRadius: 5,
    width: "100%",
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
    backgroundColor: "#F1F1F1",
    borderBottomWidth: 1,
  },

  dropdownContainer: {
    backgroundColor: "#F1F1F1",
  },
});
