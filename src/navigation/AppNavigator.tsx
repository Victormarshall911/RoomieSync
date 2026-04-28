import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, Image } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import LifestyleSurveyScreen from '../screens/LifestyleSurveyScreen';
import MainTabs from './MainTabs';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VerificationScreen from '../screens/VerificationScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import { useTheme } from '../context/ThemeContext';
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
    CreateListing: undefined;
    EditProfile: undefined;
    ListingDetail: { listing: any };
    UserProfile: { profile: Profile };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { session, profile, loading } = useAuth();
    const { colors: COLORS } = useTheme();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 20 }}
                />
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                id="RootStack"
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            >
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
                        <Stack.Screen name="CreateListing" component={CreateListingScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
                        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
