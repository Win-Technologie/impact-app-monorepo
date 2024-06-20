import React from 'react'
import BottomTabsBar from '../../components/Main/BottomTabsBar/BottomTabsBar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function Layout() {

    const {t} = useTranslation();

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#19363C', tabBarInactiveBackgroundColor: 'white', headerShown: false }}>

            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.home'),
                    tabBarIcon: ({ color }) => <Foundation name="home" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="declaration"
                options={{
                    title: t('tabs.declare'),
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="add-box" size={24} color={color} />,
                }}
            />

           
            <Tabs.Screen
                name="history"
                options={{
                    title: t('tabs.history'),
                    tabBarIcon: ({ color }) => <FontAwesome5 name="clipboard-list" size={24} color={color} />,
                }}
            />


            <Tabs.Screen
                name="account"
                options={{
                    title: t('tabs.account'),
                    tabBarIcon: ({ color }) => <FontAwesome5 name="cog" size={24} color={color} />,
                }}
            />

        </Tabs>
    )

}