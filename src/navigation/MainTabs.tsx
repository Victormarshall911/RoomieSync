import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminScreen from '../screens/AdminScreen';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    const { profile } = useAuth();

    return (
        <Tab.Navigator
            id="MainTabs"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primaryLight,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 24,
                    left: 40,
                    right: 40,
                    backgroundColor: 'rgba(26, 23, 43, 0.98)',
                    borderRadius: 32,
                    height: 64,
                    borderTopWidth: 0,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 9,
                    fontWeight: '700',
                    letterSpacing: 0.3,
                    marginBottom: 10,
                    marginTop: -6,
                },
                tabBarIconStyle: {
                    marginTop: 8,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Rooms') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Messages') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    } else if (route.name === 'Admin') {
                        iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
                    }

                    return <Ionicons name={iconName} size={size - 4} color={color} />;
                },
            })}
        >
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
                name="Settings"
                component={SettingsScreen}
                options={{ tabBarLabel: 'Settings' }}
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
