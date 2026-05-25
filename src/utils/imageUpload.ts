import { supabase } from '../lib/supabase';

export const uploadAvatarToSupabase = async (uri: string, userId: string): Promise<string> => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });

        const fileExt = uri.split('.').pop()?.toLowerCase();
        const fileName = `avatar.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, arrayBuffer, {
                upsert: true,
                contentType: blob.type
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
};
