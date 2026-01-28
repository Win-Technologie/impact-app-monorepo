import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform ,TouchableOpacity,Text} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';


const DatePicker = ({onChange}) => {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShow(Platform.OS === 'ios');
    if (onChange) {
      onChange(currentDate); // Passer la date modifiée au composant parent
    }
  };

  const showDatePicker = () => {
    setShow(true);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={showDatePicker} style={styles.dateInputContainer}>
        <TextInput
          style={[styles.input, styles.dayInput]}
          value={`${date.getDate().toString().padStart(2, '0')}`}
          placeholder="JJ"
          editable={false}
          onPressIn={showDatePicker}
        />
        <View style={styles.separator} />
        <TextInput
          style={[styles.input, styles.monthInput]}
          value={`${(date.getMonth() + 1).toString().padStart(2, '0')}`}
          placeholder="MM"
          editable={false}
          onPressIn={showDatePicker}
        />
        <View style={styles.separator} />
        <TextInput
          style={[styles.input, styles.yearInput]}
          value={date.getFullYear().toString()}
          placeholder="AAAA"
          editable={false}
          onPressIn={showDatePicker}
        />
      </Pressable>
      {show && (
  <View style={styles.datePickerContainer}>
    <View style={styles.dateDisplayContainer}>
      <Text style={styles.dateDisplayText}>{`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}</Text>
    </View>
    <DateTimePicker
      value={date}
      mode="date"
      display={Platform.OS === 'ios' ? 'inline' : 'default'}
      onChange={handleChange}
      locale="fr-FR"
      maximumDate={new Date()}
      style={styles.datePicker}
    />
  </View>
)}

      {Platform.OS === 'ios' && show && (
  <View style={styles.iosButtonContainer}>
     <TouchableOpacity style={[styles.iosButton, styles.cancelButton]} onPress={() => setShow(false)}>
      <Text style={styles.iosButtonText}>Annuler</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.iosButton, styles.confirmButton]} onPress={() => setShow(false)}>
      <Text style={styles.iosButtonText}>Confirmer</Text>
    </TouchableOpacity>
   
  </View>
)}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  dateInputContainer: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: 'white',
    justifyContent:'flex-start'
  },
  input: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  dayInput: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  monthInput: {
    flex: 1.75, 
  },
  yearInput: {
    flex: 2.25, 
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  separator: {
    width: 1,
    backgroundColor: 'gray',
    
  },
  iosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  iosButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100, 
  },
  confirmButton: {
    backgroundColor: '#007AFF', 
    flex: 2, 
  },
  cancelButton: {
    backgroundColor: '#C7C7CC', 
    flex: 1,
  },
  iosButtonText: {
    color: 'white',
    fontSize: 16,
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    overflow: 'hidden',
  },
  dateDisplayContainer: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDisplayText: {
    fontSize: 18,
    color: '#333',
  },
  datePicker: {
    borderColor:'grey',
  },
});

export default DatePicker;
