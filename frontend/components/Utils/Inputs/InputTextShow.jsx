import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'

function InputTextShow({ label, info, editable = true }) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={info}
                editable={editable}
            />

        </View>
    )
}

export default InputTextShow

const styles = StyleSheet.create({

    container: {
        // Width:'100%'
    },

    label: {
        color: '#b4b4b5',
        marginBottom: 5,
        fontSize: 12
    },

    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 7,
        backgroundColor: '#fafafa'

    }
})