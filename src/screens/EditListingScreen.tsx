import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ListingForm, { ListingFormData } from '../components/ListingForm';

export default function EditListingScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { listing } = route.params;
    const [loading, setLoading] = useState(false);

    const initialData: Partial<ListingFormData> = {
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price ? String(listing.price) : '',
        location: listing.location || '',
        type: listing.type || 'Room',
        searching_for: listing.searching_for || 'Listing a Space',
        images: listing.images || [],
    };

    const handleSubmit = async (data: ListingFormData) => {
        try {
            setLoading(true);
            const updatePayload: any = {
                title: data.title,
                description: data.description,
                price: parseInt(data.price, 10),
                location: data.location,
                type: data.type,
                searching_for: data.searching_for,
            };

            if (data.images) {
                updatePayload.images = data.images;
            }

            const { error } = await supabase
                .from('listings')
                .update(updatePayload)
                .eq('id', listing.id);

            if (error) {
                // If column 'images' doesn't exist in Supabase yet, retry without images
                if (error.message?.includes('images') || error.code === 'PGRST204') {
                    delete updatePayload.images;
                    const { error: retryError } = await supabase
                        .from('listings')
                        .update(updatePayload)
                        .eq('id', listing.id);
                    if (retryError) throw retryError;
                } else {
                    throw error;
                }
            }

            Alert.alert('Success', 'Listing updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            console.error('Error updating listing:', err);
            Alert.alert('Error', err.message || 'Failed to update listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ListingForm
            headerTitle="Edit Listing"
            initialData={initialData}
            onSubmit={handleSubmit}
            submitButtonTitle="Save Changes"
            loading={loading}
        />
    );
}
