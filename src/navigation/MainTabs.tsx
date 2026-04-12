import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import AdminScreen from '../screens/AdminScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    const { profile } = useAuth();

    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#4F46E5',
        }}>
            <Tab.Screen name="Rooms" component={DiscoveryScreen} />
            <Tab.Screen name="Messages" component={ConversationsScreen} />
            <Tab.Screen name="Verify" component={VerificationScreen} />
            {profile?.is_admin && (
                <Tab.Screen name="Admin" component={AdminScreen} />
            )}
        </Tab.Navigator>
    );
}
