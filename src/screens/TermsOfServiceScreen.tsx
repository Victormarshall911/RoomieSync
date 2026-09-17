import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS } from '../utils/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import ProgressBar from '../components/ProgressBar';
import GradientButton from '../components/GradientButton';

export default function TermsOfServiceScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'TermsOfService'>>();
    const fromOnboarding = route.params?.fromOnboarding ?? false;
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    const handleAccept = () => {
        navigation.navigate('Auth', { isSignUp: true });
    };

    const Section = ({ title, content }: { title: string; content: string }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionContent}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
            </View>

            {fromOnboarding && (
                <View style={styles.progressContainer}>
                    <ProgressBar currentStep={4} totalSteps={5} />
                    <Text style={styles.stepLabel}>Step 4 of 5</Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last Updated: April 30, 2026</Text>
                
                <Text style={styles.intro}>
                    Welcome to RoomieSync. By using our application, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
                </Text>

                <Section 
                    title="1. Acceptance of Terms" 
                    content="By accessing or using RoomieSync, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the app."
                />

                <Section 
                    title="2. Eligibility & Verification" 
                    content="RoomieSync is exclusively for students of recognized Nigerian tertiary institutions. You must provide a valid student ID for verification. Providing false information or using another person's identity is strictly prohibited and will result in an immediate ban."
                />

                <Section 
                    title="3. User Conduct" 
                    content="You agree to use RoomieSync for lawful purposes only. You are prohibited from posting offensive, discriminatory, or harmful content. Harassment of other users via chat or listings will not be tolerated."
                />

                <Section 
                    title="4. Safety Disclaimer" 
                    content="RoomieSync is a platform to connect students. We do not inspect properties or perform criminal background checks on users beyond student ID verification. We strongly advise meeting potential roommates in public places and involving parents or guardians before making financial commitments."
                />

                <Section 
                    title="5. Financial Transactions" 
                    content="RoomieSync does not handle payments for rent or deposits. Any financial transactions occur directly between users. We are not responsible for any financial losses, scams, or disputes arising from your interactions with other users."
                />

                <Section 
                    title="6. Data & Privacy" 
                    content="We collect your profile information and lifestyle preferences to provide our matching service. We do not sell your personal data to third parties. Please refer to our Privacy Policy for more details on how we protect your information."
                />

                <Section 
                    title="7. Account Termination" 
                    content="We reserve the right to suspend or terminate your account at our sole discretion, for conduct that we believe violates these Terms or is harmful to other users or the platform."
                />

                <Section 
                    title="8. Changes to Terms" 
                    content="RoomieSync reserves the right to modify these terms at any time. We will notify users of any significant changes via the app."
                />

                {fromOnboarding && (
                    <View style={styles.onboardingAction}>
                        <GradientButton
                            title="I Agree & Continue"
                            onPress={handleAccept}
                            style={{ width: '100%' }}
                        />
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 RoomieSync. All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    progressContainer: {
        paddingTop: SPACING.xs,
        paddingBottom: SPACING.xs,
    },
    stepLabel: {
        ...FONTS.small,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    headerTitle: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    lastUpdated: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginBottom: SPACING.sm,
    },
    intro: {
        ...FONTS.body,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        fontSize: 18,
    },
    sectionContent: {
        ...FONTS.body,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    onboardingAction: {
        marginTop: SPACING.md,
        marginBottom: SPACING.md,
    },
    footer: {
        marginTop: SPACING.xl,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingTop: SPACING.lg,
    },
    footerText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
});
