import { View, StyleSheet, Text } from 'react-native';

// InfoItem : Composant fonctionnel pour afficher des informations avec un titre et un contenu.
/**
 * 
 * @param {string} title - le title pour le item à afficher
 * @param {*} content - le contenu de l'item 
 * @returns view avec title et contenu 
 */
const InfoItem = ({ title, content }) => (

    // View principal qui regroupe le titre et le contenu.
    <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text>{content}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        gap: 3
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#1B6878'
    }
})


export default InfoItem;