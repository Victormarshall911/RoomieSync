import 'react-native-url-polyfill/auto';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import 'react-native-gesture-handler';
import { LogBox } from 'react-native';

// Suppress known Expo Go notification warnings
LogBox.ignoreLogs([
    'expo-notifications',
]);

export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <StatusBar style="auto" />
                    <AppNavigator />
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
