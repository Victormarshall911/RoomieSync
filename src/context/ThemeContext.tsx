import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from '../utils/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    colors: ThemeColors;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@roomiesync_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [colors, setColors] = useState<ThemeColors>(DARK_COLORS);
    const [isDark, setIsDark] = useState(true);

    // Initialize theme from storage
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedMode) {
                    setThemeModeState(savedMode as ThemeMode);
                }
            } catch (err) {
                console.error('Failed to load theme:', err);
            }
        };
        loadTheme();
    }, []);

    // Update colors when themeMode or systemColorScheme changes
    useEffect(() => {
        const activeMode = themeMode === 'system' ? systemColorScheme : themeMode;
        const darkened = activeMode === 'dark' || activeMode === null; // Default dark for RoomieSync

        setIsDark(darkened);
        setColors(darkened ? DARK_COLORS : LIGHT_COLORS);
    }, [themeMode, systemColorScheme]);

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        setThemeModeState(mode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (err) {
            console.error('Failed to save theme:', err);
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ themeMode, colors, isDark, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
