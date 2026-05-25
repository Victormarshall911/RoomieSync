import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '../screens/OnboardingScreen';
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
import EditListingScreen from '../screens/EditListingScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import { useTheme } from '../context/ThemeContext';
import { Profile } from '../utils/matching';
import { Listing } from '../screens/DiscoveryScreen';

export const ONBOARDING_KEY = '@has_seen_onboarding';

const SplashScreen = ({ COLORS }: { COLORS: any }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <View style={{ width: 90, height: 90, marginBottom: 24 }}>
            <Image source={require('../../assets/logo.png')} style={{ width: '100%', height: '100%' }} />
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} />
    </View>
);

export type ProfileSetupData = {
    fullName: string;
    university: string;
    department: string;
    gender: 'Male' | 'Female';
    localAvatarUri?: string;
};

export type PreferencesData = ProfileSetupData & {
    budgetMin: number;
    budgetMax: number;
    locationPreference: string;
};

export type RootStackParamList = {
    Onboarding: undefined;
    Auth: { isSignUp?: boolean } | undefined;
    ProfileSetup: undefined;
    Preferences: { profileData: ProfileSetupData };
    LifestyleSurvey: { profileData: PreferencesData };
    Main: undefined;
    Chat: { conversationId: string | null; otherUser: Profile };
    Profile: undefined;
    Verify: undefined;
    CreateListing: undefined;
    EditProfile: undefined;
    ListingDetail: { listing: Listing };
    EditListing: { listing: Listing };
    UserProfile: { profile: Profile };
    TermsOfService: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { session, profile, loading } = useAuth();
    const { colors: COLORS } = useTheme();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const value = await AsyncStorage.getItem(ONBOARDING_KEY);
                setHasSeenOnboarding(value === 'true');
            } catch (error) {
                setHasSeenOnboarding(false);
            }
        };
        checkOnboarding();
    }, []);

    if (loading || hasSeenOnboarding === null) {
        return <SplashScreen COLORS={COLORS} />;
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
                    hasSeenOnboarding ? (
                        <>
                            <Stack.Screen name="Auth" component={AuthScreen} />
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                            <Stack.Screen name="Preferences" component={PreferencesScreen} />
                            <Stack.Screen name="LifestyleSurvey" component={LifestyleSurveyScreen} />
                            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                            <Stack.Screen name="Preferences" component={PreferencesScreen} />
                            <Stack.Screen name="LifestyleSurvey" component={LifestyleSurveyScreen} />
                            <Stack.Screen name="Auth" component={AuthScreen} />
                            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                        </>
                    )
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
                        <Stack.Screen name="EditListing" component={EditListingScreen} />
                        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
