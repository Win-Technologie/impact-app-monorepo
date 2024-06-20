import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';

import { useState, useCallback, useEffect, useRef } from 'react';

const TextArea = ({ placeholder }) => {
    const [text, setText] = useState('');

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.textArea}
                placeholder={placeholder}
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={5} // 
            />
        </View>
    );


};

const styles = StyleSheet.create({
    container: {
      flex: 1,
    
    },
    textArea: {
      height: 120, 
      justifyContent: "flex-start",
   
      borderWidth: 1,
      padding: 10,
      textAlignVertical: 'top' ,

      width: '100%',
 
      borderColor: '#ccc',
      borderRadius: 5,
     
      marginBottom: 7,
      backgroundColor: '#fafafa'
    }
  });

export default TextArea;
