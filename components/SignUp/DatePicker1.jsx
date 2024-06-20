import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRecoilState } from 'recoil';
import { userDetailsState } from '../../GlobalState/userDetailState';

const DatePicker = () => {
  const [date, setDate] = useState(new Date());
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [userDetails, setUserDetails] = useRecoilState(userDetailsState);

  const handleDayPress = (day) => {
    // Create a new date object using the selected date
    const selectedDate = new Date(day.timestamp);

    // Adjust the date for the local time zone offset
    selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());

    setDate(selectedDate);
    setCalendarVisible(false);

    // Format the date to "YYYY/MM/DD"
    const formattedDate = `${selectedDate.getFullYear()}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getDate().toString().padStart(2, '0')}`;
  
    setUserDetails(prevDetails => ({ ...prevDetails, birthDay: formattedDate }));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.dateInputContainer}>
        <Text style={[styles.input, styles.dayInput]}>{date.getDate().toString().padStart(2, '0')}</Text>
        <View style={styles.separator} />
        <Text style={[styles.input, styles.monthInput]}>{(date.getMonth() + 1).toString().padStart(2, '0')}</Text>
        <View style={styles.separator} />
        <Text style={[styles.input, styles.yearInput]}>{date.getFullYear().toString()}</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={isCalendarVisible}
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Calendar
              current={date.toISOString().split('T')[0]} 
              minDate={'1900-01-01'}
              maxDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markedDates={{
                [date.toISOString().split('T')[0]]: {selected: true, marked: true, selectedColor: 'blue'}
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    width:'60%'
  },
  input: {
    padding: 10,
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  dayInput: {},
  monthInput: {},
  yearInput: {},
  separator: {
    height: '100%',
    width: 1,
    backgroundColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    maxWidth: '90%',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'black',
  }
});

export default DatePicker;
