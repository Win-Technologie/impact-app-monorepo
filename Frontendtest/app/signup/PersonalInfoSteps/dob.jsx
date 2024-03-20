import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import DateInputComponent from '../../../components/SignUp/datepicker'

export default function dob() {
  return (
    <View style={styles.container}>
      
    <DateInputComponent
    />
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding: 20,
        paddingTop: 95,
        justifyContent:'flex-start',
        alignItems:'center',
    }
})