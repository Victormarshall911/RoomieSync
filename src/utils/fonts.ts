import { useFonts } from 'expo-font';
import {
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from '@expo-google-fonts/inter';

/**
 * Font family constants used throughout the app.
 * These map to the loaded Google Font variants.
 */
export const FontFamily = {
    // Headings — Sora
    soraSemiBold: 'Sora_600SemiBold',
    soraBold: 'Sora_700Bold',
    soraExtraBold: 'Sora_800ExtraBold',
    // Body — Inter
    interRegular: 'Inter_400Regular',
    interMedium: 'Inter_500Medium',
    interSemiBold: 'Inter_600SemiBold',
    interBold: 'Inter_700Bold',
} as const;

/**
 * Hook that loads all required fonts.
 * Returns `true` once every font file is ready.
 */
export function useAppFonts(): boolean {
    const [loaded] = useFonts({
        Sora_600SemiBold,
        Sora_700Bold,
        Sora_800ExtraBold,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });
    return loaded;
}
