import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ListingForm, { ListingFormData } from '../components/ListingForm';

export default function CreateListingScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: ListingFormData) => {
        try {
            setLoading(true);
            const insertPayload: any = {
                user_id: user?.id,
                title: data.title,
                description: data.description,
                price: parseInt(data.price, 10),
                location: data.location,
                type: data.type,
                searching_for: data.searching_for,
            };

            if (data.images && data.images.length > 0) {
                insertPayload.images = data.images;
            }

            const { error } = await supabase
                .from('listings')
                .insert(insertPayload);

            if (error) {
                // If column 'images' doesn't exist in Supabase yet, retry without images
                if (error.message?.includes('images') || error.code === 'PGRST204') {
                    delete insertPayload.images;
                    const { error: retryError } = await supabase
                        .from('listings')
                        .insert(insertPayload);
                    if (retryError) throw retryError;
                } else {
                    throw error;
                }
            }

            Alert.alert('Success', 'Listing created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            console.error('Error creating listing:', err);
            Alert.alert('Error', err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ListingForm
            headerTitle="Create Listing"
            onSubmit={handleSubmit}
            submitButtonTitle="Post Listing"
            loading={loading}
        />
    );
}
