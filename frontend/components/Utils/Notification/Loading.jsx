import { StyleSheet, Text, View,ActivityIndicator } from 'react-native'
import React from 'react'

export default function Loading({text,color}) {
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center', marginBottom: 30 }}>{text}</Text>
            <ActivityIndicator size={'small'} color={color|| '#19363C'}/>
        </View>
    )
}

const styles = StyleSheet.create({})