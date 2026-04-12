import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import LifestyleSurveyScreen from '../screens/LifestyleSurveyScreen';
import MainTabs from './MainTabs';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { session, profile, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!session ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : !profile ? (
                    <>
                        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                        <Stack.Screen name="Preferences" component={PreferencesScreen} />
                        <Stack.Screen name="LifestyleSurvey" component={LifestyleSurveyScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
