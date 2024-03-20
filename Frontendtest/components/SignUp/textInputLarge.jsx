import { View, Text, TextInput,StyleSheet} from 'react-native'
import React from 'react'

export default function textInputLarge({placeholder,onChangeText,value}) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
      style = {styles.input}
      placeholder= {placeholder}  
      value={value}
      onChangeText={onChangeText}
      
      >
      

      </TextInput>
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 51,
    backgroundColor: "white",
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    paddingLeft: 22,
    marginBottom: 20,
    marginLeft:4,
    marginHorizontal: 5,
    

  },
  input: {
    flex: 1,
    
  }
})