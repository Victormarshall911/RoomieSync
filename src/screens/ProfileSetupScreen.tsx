import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileSetupScreen() {
    const { user, fetchProfile } = useAuth();
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [department, setDepartment] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!fullName || !university || !department || !gender) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Usually we would save this to state and navigate to next step
        // But for this demo, we'll start building the profile object
        // and navigate to Preferences.
        // @ts-ignore
        navigation.navigate('Preferences', {
            profileData: { fullName, university, department, gender }
        });
    };

    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Basic Info</Text>
            <Text style={styles.subtitle}>Let's start with the basics</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Victor Adebayo"
                    value={fullName}
                    onChangeText={setFullName}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>University</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. UNILAG"
                    value={university}
                    onChangeText={setUniversity}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Department</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Computer Science"
                    value={department}
                    onChangeText={setDepartment}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderContainer}>
                    {['Male', 'Female'].map((g) => (
                        <TouchableOpacity
                            key={g}
                            style={[
                                styles.genderButton,
                                gender === g && styles.genderButtonActive
                            ]}
                            onPress={() => setGender(g as 'Male' | 'Female')}
                        >
                            <Text style={[
                                styles.genderText,
                                gender === g && styles.genderTextActive
                            ]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    genderButtonActive: {
        borderColor: '#4F46E5',
        backgroundColor: '#EEF2FF',
    },
    genderText: {
        color: '#6B7280',
        fontWeight: '500',
    },
    genderTextActive: {
        color: '#4F46E5',
    },
    nextButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
