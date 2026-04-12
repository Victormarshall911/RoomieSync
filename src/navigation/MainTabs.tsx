import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import AdminScreen from '../screens/AdminScreen';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    const { profile } = useAuth();

    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primaryLight,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarStyle: {
                backgroundColor: COLORS.bgCard,
                borderTopColor: COLORS.border,
                borderTopWidth: 1,
                paddingBottom: 24,
                paddingTop: 8,
                height: 80,
            },
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 0.3,
            },
        }}>
            <Tab.Screen
                name="Rooms"
                component={DiscoveryScreen}
                options={{ tabBarLabel: 'Discover' }}
            />
            <Tab.Screen
                name="Messages"
                component={ConversationsScreen}
                options={{ tabBarLabel: 'Chats' }}
            />
            <Tab.Screen
                name="Verify"
                component={VerificationScreen}
                options={{ tabBarLabel: 'Verify' }}
            />
            {profile?.is_admin && (
                <Tab.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{ tabBarLabel: 'Admin' }}
                />
            )}
        </Tab.Navigator>
    );
}
