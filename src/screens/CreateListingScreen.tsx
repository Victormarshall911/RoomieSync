import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function CreateListingScreen() {
    const { user } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'Room' | 'Roommate'>('Room');
    const [searchingFor, setSearchingFor] = useState<'Looking for Roommate' | 'Listing a Space'>('Listing a Space');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
    });

    const handleSubmit = async () => {
        if (!formData.title || !formData.price || !formData.location) {
            Alert.alert('Error', 'Please fill in all required fields (Title, Price, Location)');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('listings')
                .insert({
                    user_id: user?.id,
                    title: formData.title,
                    description: formData.description,
                    price: parseInt(formData.price),
                    location: formData.location,
                    type,
                    searching_for: searchingFor,
                });

            if (error) throw error;

            Alert.alert('Success', 'Listing created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            console.error('Error creating listing:', err);
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={isDark ? [COLORS.bg, COLORS.bgCard] : [COLORS.bg, '#F1F5F9']} style={styles.gradient}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Create Listing</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>I am...</Text>
                            <View style={styles.typeRow}>
                                <TouchableOpacity
                                    style={[styles.typeButton, searchingFor === 'Listing a Space' && styles.typeButtonActive]}
                                    onPress={() => {
                                        setSearchingFor('Listing a Space');
                                        setType('Room');
                                    }}
                                >
                                    <Text style={[styles.typeText, searchingFor === 'Listing a Space' && styles.typeTextActive]}>🏠 Listing a Space</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeButton, searchingFor === 'Looking for Roommate' && styles.typeButtonActive]}
                                    onPress={() => {
                                        setSearchingFor('Looking for Roommate');
                                        setType('Roommate');
                                    }}
                                >
                                    <Text style={[styles.typeText, searchingFor === 'Looking for Roommate' && styles.typeTextActive]}>🔍 Needs Roomie</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.inputLabel}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Spacious ensuite near Akoka"
                                placeholderTextColor={COLORS.textMuted}
                                value={formData.title}
                                onChangeText={(v) => setFormData({ ...formData, title: v })}
                            />

                            <Text style={styles.inputLabel}>Price (₦ per year) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 250000"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="numeric"
                                value={formData.price}
                                onChangeText={(v) => setFormData({ ...formData, price: v })}
                            />

                            <Text style={styles.inputLabel}>Location *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Lagos, Yaba"
                                placeholderTextColor={COLORS.textMuted}
                                value={formData.location}
                                onChangeText={(v) => setFormData({ ...formData, location: v })}
                            />

                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Tell others more about the space or what you are looking for..."
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                                numberOfLines={4}
                                value={formData.description}
                                onChangeText={(v) => setFormData({ ...formData, description: v })}
                            />

                            <TouchableOpacity
                                style={styles.submitContainer}
                                onPress={handleSubmit}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient colors={COLORS.gradientPrimary} style={styles.submitButton}>
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Post Listing</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
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
    section: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    sectionLabel: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    typeRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    typeButton: {
        flex: 1,
        backgroundColor: COLORS.bgCard,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: COLORS.primaryFaded,
        borderColor: COLORS.primary,
    },
    typeText: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    typeTextActive: {
        color: COLORS.primaryLight,
    },
    form: {
        paddingHorizontal: SPACING.lg,
    },
    inputLabel: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs + 2,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        color: COLORS.textPrimary,
        ...FONTS.body,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitContainer: {
        marginTop: SPACING.md,
    },
    submitButton: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOWS.button,
    },
    submitButtonText: {
        ...FONTS.bodyBold,
        color: '#FFFFFF',
    },
});
