import React, { useRef } from 'react';
import { Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminScreen from '../screens/AdminScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMessages } from '../context/MessageContext';

import { useNotificationNavigation } from '../hooks/useNotifications';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

function AnimatedTabIcon({ name, size, color, focused }: { name: any; size: number; color: string; focused: boolean }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: focused ? 1.15 : 1,
            useNativeDriver: true,
            tension: 200,
            friction: 10,
        }).start();
    }, [focused]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons name={name} size={size - 4} color={color} />
        </Animated.View>
    );
}

export default function MainTabs() {
    const { profile } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const { unreadCount } = useMessages();
    const navigation = useNavigation();

    // Handle deep linking from notifications
    useNotificationNavigation(navigation);

    return (
        <Tab.Navigator
            id="MainTabs"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primaryLight,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarStyle: {
                    backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                    height: Platform.OS === 'ios' ? 88 : 72,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    elevation: 0,
                    shadowOpacity: 0,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 0.3,
                },
                tabBarIconStyle: {
                    marginBottom: -2,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Rooms') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Messages') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'MyProfile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    } else if (route.name === 'Admin') {
                        iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
                    }

                    return <AnimatedTabIcon name={iconName} size={size} color={color} focused={focused} />;
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
                options={{ 
                    tabBarLabel: 'Chats',
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: COLORS.primary,
                        color: '#FFFFFF',
                        fontSize: 10,
                        fontWeight: '700',
                    }
                }}
            />
            <Tab.Screen
                name="MyProfile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
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
