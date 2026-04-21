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
import ProfileScreen from '../screens/ProfileScreen';
import VerificationScreen from '../screens/VerificationScreen';
import { Profile } from '../utils/matching';

export type RootStackParamList = {
    Auth: undefined;
    ProfileSetup: undefined;
    Preferences: undefined;
    LifestyleSurvey: undefined;
    Main: undefined;
    Chat: { conversationId: string; otherUser: Profile };
    Profile: undefined;
    Verify: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { session, profile, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' }}>
                <ActivityIndicator size="large" color="#6C3AED" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
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
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="Verify" component={VerificationScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
