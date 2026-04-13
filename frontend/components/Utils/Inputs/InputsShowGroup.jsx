import { StyleSheet, Text, View } from "react-native";
import InputTextShow from "./InputTextShow";
import React from "react";

const DropdownInputShow = ({ label, info }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <SelectDropdown
      data={[info]} // Static data just to display the current value
      defaultButtonText={info}
      buttonTextAfterSelection={(selectedItem) => selectedItem}
      rowTextForSelection={(item) => item}
      buttonStyle={styles.dropdownBtnStyle}
      buttonTextStyle={styles.dropdownBtnTxtStyle}
      renderDropdownIcon={() => <Text>▼</Text>}
      dropdownIconPosition={"right"}
      disabled // Disable dropdown since this is for display only
    />
  </View>
);
export default function InputsShowGroup({ dataToShow, editable = true, onChange }) {
  return (
    <View style={styles.container}>
      {dataToShow.map((item, key) => {
        const nameBase = item.name || String(key);
        if (item.style === "column") {
          return (
            <InputTextShow
              key={key}
              name={nameBase}
              label={item.label}
              info={item.value}
              editable={editable}
              onChange={onChange}
            />
          );
        } else if (item.style === "row") {
          return (
            <View style={styles.inputInfoRow} key={key}>
              <View style={styles.inputInfoRowFirstChildren}>
                <InputTextShow
                  name={`${nameBase}-first`}
                  label={item.firstLabel}
                  info={item.valueFirstLabel}
                  editable={editable}
                  onChange={onChange}
                />
              </View>
              <View style={styles.inputInfoRowSecondChildren}>
                <InputTextShow
                  name={`${nameBase}-second`}
                  label={item.secondLabel}
                  info={item.valueSecondLabel}
                  editable={editable}
                  onChange={onChange}
                />
              </View>
            </View>
          );
        } else if (item.style === "dropdown") {
          return (
            <View style={styles.inputInfoRow} key={key}>
              <View style={styles.inputInfoRowFirstChildren}>
                <DropdownInputShow
                  label={item.firstLabel}
                  info={item.valueFirstLabel}
                />
              </View>
              <View style={styles.inputInfoRowSecondChildren}>
                <DropdownInputShow
                  label={item.secondLabel}
                  info={item.valueSecondLabel}
                />
              </View>
            </View>
          );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  inputInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputInfoRowSecondChildren: {
    width: "40%",
    marginLeft: "1%",
  },
  inputInfoRowFirstChildren: {
    minWidth: "55%",
  },
});
