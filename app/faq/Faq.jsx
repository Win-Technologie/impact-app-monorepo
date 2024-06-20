import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const FaqPage = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [expandedSections, setExpandedSections] = useState({});

    const handleBackPress = () => {
        router.back();
    };

    const toggleSection = (section, index) => {
        setExpandedSections((prevState) => ({
            ...prevState,
            [`${section}_${index}`]: !prevState[`${section}_${index}`],
        }));
    };

    const sections = [
        {
            title: t('faq.signupAndLogin'),
            questions: [
                { question: t('faq.question1'), answer: t('faq.answer1') },
                { question: t('faq.question2'), answer: t('faq.answer2') },
                { question: t('faq.question3'), answer: t('faq.answer3') },
                { question: t('faq.question4'), answer: t('faq.answer4') },
            ],
        },
        {
            title: t('faq.accidentReport'),
            questions: [
                { question: t('faq.question5'), answer: t('faq.answer5') },
                { question: t('faq.question6'), answer: t('faq.answer6') },
                { question: t('faq.question7'), answer: t('faq.answer7') },
            ],
        },
        {
            title: t('faq.subscription'),
            questions: [
                { question: t('faq.question8'), answer: t('faq.answer8') },
                { question: t('faq.question9'), answer: t('faq.answer9') },
                { question: t('faq.question10'), answer: t('faq.answer10') },
            ],
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                    <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>{t('faq.title')}</Text>
                {sections.map((section, sectionIndex) => (
                    <View key={sectionIndex}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.questions.map((question, questionIndex) => (
                            <View key={questionIndex} style={styles.questionWrapper}>
                                <TouchableOpacity
                                    style={styles.questionContainer}
                                    onPress={() => toggleSection(section.title, questionIndex)}
                                >
                                    <Text style={styles.questionText}>{question.question}</Text>
                                    <Icon name={expandedSections[`${section.title}_${questionIndex}`] ? "expand-less" : "expand-more"} size={24} color="#000" />
                                </TouchableOpacity>
                                {expandedSections[`${section.title}_${questionIndex}`] && (
                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answerText}>{question.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 25,
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
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#CF8C58',
        marginTop: 20,
        marginBottom: 10,
    },
    questionWrapper: {
        marginBottom: 10,
    },
    questionContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    questionText: {
        fontSize: 16,
        flex: 1,
    },
    answerContainer: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 5,
        marginTop: 5,
    },
    answerText: {
        fontSize: 14,
        color: '#555',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 30,
    },
});

export default FaqPage;
