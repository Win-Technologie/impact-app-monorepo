import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Calendar } from "react-native-calendars";

const DateInput = ({ label, value, onChange, minDate }) => {
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const handleDayPress = (day) => {
    const selectedDate = new Date(day.timestamp);
    // Adjust for timezone offset to get correct UTC date
    selectedDate.setMinutes(
      selectedDate.getMinutes() + selectedDate.getTimezoneOffset(),
    );
    // Format date to 'YYYY/MM/DD'
    const formattedDate = selectedDate
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "/");
    onChange(formattedDate);
    setCalendarVisible(false); // Correctly use the state setter
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        onPress={() => setCalendarVisible(true)}
        style={styles.textInput}
      >
        <Text>{value || "Entrez une date"}</Text>
      </TouchableOpacity>
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)} // Correctly handle modal close
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setCalendarVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{ [value]: { selected: true, marked: true } }}
              minDate={minDate}
              theme={{
                selectedDayBackgroundColor: "#00adf5",
                todayTextColor: "#00adf5",
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 4,
    minHeight: 44,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
});

export default DateInput;
