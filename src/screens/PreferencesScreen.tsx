import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PreferencesScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { profileData } = route.params;

    const [budgetMin, setBudgetMin] = useState('200000');
    const [budgetMax, setBudgetMax] = useState('500000');
    const [location, setLocation] = useState('');

    const handleNext = () => {
        if (!location) {
            Alert.alert('Error', 'Please enter a location preference');
            return;
        }

        // @ts-ignore
        navigation.navigate('LifestyleSurvey', {
            profileData: {
                ...profileData,
                budgetMin: parseInt(budgetMin),
                budgetMax: parseInt(budgetMax),
                locationPreference: location,
            }
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Preferences</Text>
            <Text style={styles.subtitle}>Budget and Location</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Budget Range (Naira per year)</Text>
                <View style={styles.rangeContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Min"
                        keyboardType="numeric"
                        value={budgetMin}
                        onChangeText={setBudgetMin}
                    />
                    <Text style={styles.rangeDash}>-</Text>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Max"
                        keyboardType="numeric"
                        value={budgetMax}
                        onChangeText={setBudgetMax}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Location Preference</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Akoka, Yaba"
                    value={location}
                    onChangeText={setLocation}
                />
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
    rangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rangeDash: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
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
