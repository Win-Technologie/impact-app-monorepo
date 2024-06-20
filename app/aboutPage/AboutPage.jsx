import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
    const router = useRouter();
    const { t } = useTranslation();

    const handleBackPress = () => {
        router.back();
    };

    const handleFaqPress = () => {
        // Navigate to the FAQ page
        router.push('faq/Faq');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                    <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>
                    {t('about.title')}<Text style={styles.highlight}>Impact.</Text>
                </Text>
                <Text style={styles.paragraph}>
                    {t('about.text1')}
                </Text>
                <Image source={require('../../assets/splashscreen.png')} style={styles.image} />
                <Text style={styles.paragraph}>
                    {t('about.text2')}
                </Text>
                <Image source={require('../../assets/google.png')} style={styles.image} />
                <Text style={styles.paragraph}>
                    {t('about.text3')}
                </Text>
                <TouchableOpacity style={styles.faqButton} onPress={handleFaqPress}>
                    <Text style={styles.faqButtonText}>{t('about.accessFaq')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop:20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        marginLeft: 5,
        fontSize: 16,
    },
    content: {
        flex:1,
    },
    scrollContent:{
        padding:20,
        paddingBottom:30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    highlight: {
        color: '#CF8C58',
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 15,
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 15,
    },
    faqButton: {
        backgroundColor: '#1B6878',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        
    },
    faqButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default AboutPage;