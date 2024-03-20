import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateInputComponent = () => {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };

  // Fonction pour afficher le DatePicker
  const showDatePicker = () => {
    setShow(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateInputContainer}>
        <TextInput
          style={[styles.input, styles.dayInput]}
          value={date.getDate().toString()}
          placeholder="JJ"
          //editable={false}
          onFocus={showDatePicker}
        />
        <TextInput
          style={[styles.input, styles.monthInput]}
          value={(date.getMonth() + 1).toString()}
          placeholder="MM"
          //editable={false}
          onFocus={showDatePicker}
        />
        <TextInput
          style={[styles.input, styles.yearInput]}
          value={date.getFullYear().toString()}
          placeholder="AAAA"
          //editable={false}
          onFocus={showDatePicker}
        />
      </View>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={new Date()}  // Optionnel: Limite à la date actuelle
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    textAlign: 'center',
  },
  dayInput: {
    width: '20%',
  },
  monthInput: {
    width: '35%',
  },
  yearInput: {
    width: '45%',
  },
});

export default DateInputComponent;
