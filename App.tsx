import 'react-native-url-polyfill/auto';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { MessageProvider } from './src/context/MessageContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useAppFonts } from './src/utils/fonts';
import 'react-native-gesture-handler';
import { LogBox, View, ActivityIndicator, StyleSheet } from 'react-native';

// Suppress known Expo Go notification warnings on launch
LogBox.ignoreLogs([
    'expo-notifications',
]);

function AppContent() {
    const { isDark } = useTheme();
    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <AuthProvider>
                <MessageProvider>
                    <AppNavigator />
                </MessageProvider>
            </AuthProvider>
        </>
    );
}

function AppWithFonts() {
    const fontsLoaded = useAppFonts();

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F5A94D" />
            </View>
        );
    }

    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppWithFonts />
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#121218',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
