import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import React from 'react';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    // Push notifications don't work in Expo Go (SDK 53+).
    // They require a development build with a valid EAS projectId.
    // In dev, we silently skip registration to avoid console spam.
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
        console.log('Push notifications are not supported in Expo Go. Skipping registration.');
        return;
    }

    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Push notification permission not granted.');
            return;
        }

        // @ts-ignore
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

        if (!projectId) {
            console.log('No projectId found. Run `npx eas init` to configure push notifications.');
            return;
        }

        try {
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } catch (e) {
            console.log('Push token registration failed (expected in dev):', (e as Error).message);
            return;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function savePushToken(userId: string, token: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);

    if (error) {
        console.error('Error saving push token:', error);
    }
}

export function useNotificationNavigation(navigation: any) {
    React.useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            
            if (data?.type === 'chat' && data?.conversationId) {
                // Navigate to Chat screen with the conversationId
                navigation.navigate('Chat', { 
                    conversationId: data.conversationId,
                    otherUser: data.otherUser || { id: data.senderId, full_name: 'User' }
                });
            }
        });

        return () => subscription.remove();
    }, [navigation]);
}
