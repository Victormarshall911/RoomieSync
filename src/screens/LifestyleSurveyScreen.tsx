import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function LifestyleSurveyScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, fetchProfile } = useAuth();
    // @ts-ignore
    const { profileData } = route.params;

    const [sleep, setSleep] = useState<'Night Owl' | 'Early Bird' | null>(null);
    const [cleanliness, setCleanliness] = useState<number>(5);
    const [socializing, setSocializing] = useState<'Guests often' | 'Rarely' | null>(null);
    const [smoking, setSmoking] = useState<'Yes' | 'No' | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFinish = async () => {
        if (!sleep || !socializing || !smoking) {
            Alert.alert('Error', 'Please answer all questions');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .insert([{
                    id: user?.id,
                    full_name: profileData.fullName,
                    university: profileData.university,
                    department: profileData.department,
                    gender: profileData.gender,
                    budget_min: profileData.budgetMin,
                    budget_max: profileData.budgetMax,
                    location_preference: profileData.locationPreference,
                    sleep_habit: sleep,
                    cleanliness: cleanliness,
                    socializing: socializing,
                    smoking: smoking,
                }]);

            if (error) throw error;

            await fetchProfile();
            // AppNavigator will automatically switch to Main stack because profile now exists
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Lifestyle Survey</Text>
            <Text style={styles.subtitle}>Help us find your best match</Text>

            <SurveyQuestion
                label="Sleep Habits"
                options={['Night Owl', 'Early Bird']}
                value={sleep}
                onSelect={setSleep}
            />

            <View style={styles.questionGroup}>
                <Text style={styles.label}>Cleanliness (1-10)</Text>
                <View style={styles.cleanlinessContainer}>
                    {[...Array(10)].map((_, i) => (
                        <TouchableOpacity
                            key={i + 1}
                            style={[
                                styles.cleanBtn,
                                cleanliness === i + 1 && styles.cleanBtnActive
                            ]}
                            onPress={() => setCleanliness(i + 1)}
                        >
                            <Text style={[
                                styles.cleanText,
                                cleanliness === i + 1 && styles.cleanTextActive
                            ]}>{i + 1}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <SurveyQuestion
                label="Socializing"
                options={['Guests often', 'Rarely']}
                value={socializing}
                onSelect={setSocializing}
            />

            <SurveyQuestion
                label="Smoking preference"
                options={['Yes', 'No']}
                value={smoking}
                onSelect={setSmoking}
            />

            <TouchableOpacity style={styles.finishButton} onPress={handleFinish} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.finishButtonText}>Finish Profile</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const SurveyQuestion = ({ label, options, value, onSelect }: any) => (
    <View style={styles.questionGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.optionsContainer}>
            {options.map((opt: string) => (
                <TouchableOpacity
                    key={opt}
                    style={[
                        styles.optionButton,
                        value === opt && styles.optionButtonActive
                    ]}
                    onPress={() => onSelect(opt)}
                >
                    <Text style={[
                        styles.optionText,
                        value === opt && styles.optionTextActive
                    ]}>{opt}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
    },
    questionGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    optionButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    optionButtonActive: {
        borderColor: '#4F46E5',
        backgroundColor: '#EEF2FF',
    },
    optionText: {
        color: '#6B7280',
        fontWeight: '500',
    },
    optionTextActive: {
        color: '#4F46E5',
    },
    cleanlinessContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    cleanBtn: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    cleanBtnActive: {
        borderColor: '#4F46E5',
        backgroundColor: '#EEF2FF',
    },
    cleanText: {
        color: '#6B7280',
    },
    cleanTextActive: {
        color: '#4F46E5',
        fontWeight: 'bold',
    },
    finishButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    finishButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
