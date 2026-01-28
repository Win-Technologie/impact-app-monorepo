import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { SimpleLineIcons } from '@expo/vector-icons';

export default function UploadButton({ handleFuntion, text }) {
    return (
        <TouchableOpacity style={styles.container}>
            <SimpleLineIcons name="cloud-upload" size={24} color="#1B6878" />
            <Text style={styles.text}>Télécharger une photo du <Text style={{color:"#0B7BA8"}}>recto</Text> et du <Text style={{color:"#0B7BA8"}}>verso</Text> {text}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 25,
        marginBottom: 20,
        gap:10,
        borderStyle:'dashed',
        borderColor:"#0B8BA8",
        alignItems:'center'
    },
    text:{

    }
})