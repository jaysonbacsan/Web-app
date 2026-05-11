import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Updates from 'expo-updates';

export default function UpdateManager() {
    useEffect(() => {
        checkForUpdates();
    }, []);

    const checkForUpdates = async () => {
        // Skip checking in development mode
        if (__DEV__) {
            console.log('Skipping update check in development');
            return;
        }
        
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert(
                    'Update Available',
                    'A new version of the app is available. Update now?',
                    [
                        { text: 'Later', style: 'cancel' },
                        { 
                            text: 'Update Now', 
                            onPress: async () => {
                                try {
                                    await Updates.fetchUpdateAsync();
                                    await Updates.reloadAsync();
                                } catch (err) {
                                    Alert.alert('Error', 'Failed to update. Please try again later.');
                                }
                            }
                        }
                    ]
                );
            }
        } catch (err) {
            console.log('Update check failed:', err);
        }
    };

    // This component doesn't render anything visible
    return null;
}