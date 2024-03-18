import { View, Text } from 'react-native'
import React, { Children } from 'react'

export default function boxComponent({width,height,children,style}) {

    const boxStyles = [{width,height}, style]

  return (
    <View style={boxStyles}>
      {children}
    </View>
  )
}