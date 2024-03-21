import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import DualOptionButtonStep from '../../../components/SignUp/dualBottomButtonsSteps';

const ContactInfoPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('CA');
  const [province, setProvince] = useState('');

  const countries = [
    { label: "🇨🇦 Canada", value: "CA" },
    { label: "🇫🇷 France", value: "FR" },
    { label: "🇺🇸 États-Unis", value: "US" }
  ];

  const countryProvinces = {
    CA: ["Ontario", "Québec", "Colombie-Britannique"],
    FR: ["Île-de-France", "Nouvelle-Aquitaine", "Occitanie"],
    US: ["Californie", "Texas", "New York"]
  };

  useEffect(() => {
    setProvince(countryProvinces[country]?.[0] || '');
  }, [country]);

  const handlePressBack = () => {
    console.log('Back pressed');
  };

  const handlePressContinue = () => {
    console.log('Continue pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quel est votre numéro de téléphone principal ?</Text>
        <TextInput
          style={styles.input}
          placeholder="514-500-4000"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <Text style={styles.title}>Quelle est votre adresse de domicile ?</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre adresse"
          value={address}
          onChangeText={setAddress}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Ville"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={[styles.input, styles.inputQuarter]}
            placeholder="Code Postal"
            value={postalCode}
            onChangeText={setPostalCode}
          />
        </View>

        <View style={styles.row}>
          <SelectDropdown
            data={countries.map((country) => country.label)}
            onSelect={(selectedItem, index) => {
              setCountry(countries[index].value);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              return item;
            }}
            buttonStyle={styles.dropdown1BtnStyle}
            buttonTextStyle={styles.dropdown1BtnTxtStyle}
            renderDropdownIcon={() => {
              return <Text>▼</Text>;
            }}
            dropdownIconPosition={'right'}
            dropdownStyle={styles.dropdown1DropdownStyle}
            rowStyle={styles.dropdown1RowStyle}
            rowTextStyle={styles.dropdown1RowTxtStyle}
          />

          <SelectDropdown
            data={countryProvinces[country] || []}
            onSelect={(selectedItem, index) => {
              setProvince(selectedItem);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              return item;
            }}
            buttonStyle={styles.dropdown1BtnStyle}
            buttonTextStyle={styles.dropdown1BtnTxtStyle}
            renderDropdownIcon={() => {
              return <Text>▼</Text>;
            }}
            dropdownIconPosition={'right'}
            dropdownStyle={styles.dropdown1DropdownStyle}
            rowStyle={styles.dropdown1RowStyle}
            rowTextStyle={styles.dropdown1RowTxtStyle}
          />
        </View>
      </View>

      <View style={styles.absoluteButtonContainer}>
        <DualOptionButtonStep
          onPressCancel={handlePressBack}
          onPressRegister={handlePressContinue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'white'
  },
  content: {
    marginTop: 15,
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  absoluteButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputHalf: {
    width: '60%',
    marginRight: '10%',
  },
  inputQuarter: {
    width: '30%',
  },
  dropdown1BtnStyle: {
    width: '80%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  dropdown1BtnTxtStyle: {
    color: '#444',
    textAlign: 'left'
  },
  dropdown1DropdownStyle: {
    backgroundColor: '#EFEFEF'
  },
  dropdown1RowStyle: {
    backgroundColor: '#EFEFEF',
    borderBottomColor: '#C5C5C5'
  },
  dropdown1RowTxtStyle: {
    color: '#444',
    textAlign: 'left'
  },
});

export default ContactInfoPage;
