import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Appearance } from 'react-native';
import { DARK_COLORS, LIGHT_COLORS, FONTS, RADIUS, SPACING, ThemeColors } from '../utils/theme';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary that respects the current system color scheme.
 * Because class components can't use hooks, we read Appearance directly.
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    private getColors(): ThemeColors {
        const scheme = Appearance.getColorScheme();
        return scheme === 'light' ? LIGHT_COLORS : DARK_COLORS;
    }

    public render() {
        if (this.state.hasError) {
            const COLORS = this.getColors();
            return (
                <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
                    <View style={[styles.card, { backgroundColor: COLORS.bgCard, borderColor: COLORS.border }]}>
                        <Text style={styles.icon}>⚠️</Text>
                        <Text style={[styles.title, { color: COLORS.textPrimary }]}>Something went wrong</Text>
                        <Text style={[styles.message, { color: COLORS.textSecondary }]}>
                            An unexpected error occurred. Our team has been notified.
                        </Text>
                        {__DEV__ && this.state.error && (
                            <View style={styles.devErrorContainer}>
                                <Text style={styles.devError}>{this.state.error.toString()}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={this.handleReset}>
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        borderWidth: 1,
        width: '100%',
    },
    icon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    title: {
        ...FONTS.h2,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    message: {
        ...FONTS.body,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    devErrorContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,0,0,0.1)',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
    },
    devError: {
        ...FONTS.small,
        color: '#ff6b6b',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    button: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.lg,
    },
    buttonText: {
        ...FONTS.bodyBold,
        color: '#FFFFFF',
    },
});
