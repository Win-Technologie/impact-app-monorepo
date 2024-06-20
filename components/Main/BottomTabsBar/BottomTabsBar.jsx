import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

export default function BottomTabsBar() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#19363C', tabBarInactiveBackgroundColor: 'white', headerShown: false }}>

            {/*<Tabs.Screen
                name="index"
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({ color }) => <Foundation name="home" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="declaration/index"
                options={{
                    title: 'Déclarer',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="add-box" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="history/index"
                options={{
                    title: 'Historique',
                    tabBarIcon: ({ color }) => <FontAwesome5 name="clipboard-list" size={24} color={color} />,
                }}
            />*/}
           
        </Tabs>
    );
}
