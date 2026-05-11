import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import colors from '../constants/colors';

export default function LocationPermissionScreen({ onLocationGranted }) {
    const [locationStatus, setLocationStatus] = useState('checking');
    const [location, setLocation] = useState(null);

    useEffect(() => {
        checkLocationStatus();
    }, []);

    const checkLocationStatus = async () => {
        const { status } = await Location.getForegroundPermissionsAsync();
        
        if (status === 'granted') {
            const userLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            setLocation(userLocation.coords);
            setLocationStatus('granted');
            onLocationGranted(userLocation.coords);
        } else if (status === 'denied') {
            setLocationStatus('denied');
        } else {
            setLocationStatus('undetermined');
        }
    };

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
            const userLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            setLocation(userLocation.coords);
            setLocationStatus('granted');
            onLocationGranted(userLocation.coords);
        } else {
            setLocationStatus('denied');
            Alert.alert(
                'Location Required',
                'This app requires location access to find jobs and workers near you. Please enable location in settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                        } else {
                            Linking.openSettings();
                        }
                    }}
                ]
            );
        }
    };

    if (locationStatus === 'granted') {
        return null; // Will redirect to main app
    }

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>📍</Text>
            </View>
            
            <Text style={styles.title}>Location Required</Text>
            <Text style={styles.subtitle}>
                 we need your location to:
            </Text>
            
            <View style={styles.bulletPoints}>
                <View style={styles.bulletItem}>
                    <Text style={styles.bulletIcon}>✓</Text>
                    <Text style={styles.bulletText}>Find jobs near you</Text>
                </View>
                <View style={styles.bulletItem}>
                    <Text style={styles.bulletIcon}>✓</Text>
                    <Text style={styles.bulletText}>Connect with nearby workers</Text>
                </View>
                <View style={styles.bulletItem}>
                    <Text style={styles.bulletIcon}>✓</Text>
                    <Text style={styles.bulletText}>Get accurate distance estimates</Text>
                </View>
                <View style={styles.bulletItem}>
                    <Text style={styles.bulletIcon}>✓</Text>
                    <Text style={styles.bulletText}>Access all platform features</Text>
                </View>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={requestLocationPermission}>
                <Text style={styles.buttonText}>Enable Location</Text>
            </TouchableOpacity>
            
            <Text style={styles.note}>
                Your location is only used for matching you with nearby jobs and workers. 
                We never share your exact location without your permission.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
    },
    icon: {
        fontSize: 50
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: colors.darkGray,
        marginBottom: 20,
        textAlign: 'center'
    },
    bulletPoints: {
        marginBottom: 30,
        width: '100%'
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 10
    },
    bulletIcon: {
        fontSize: 18,
        color: colors.verified,
        marginRight: 12,
        fontWeight: 'bold'
    },
    bulletText: {
        fontSize: 14,
        color: colors.text,
        flex: 1
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center'
    },
    buttonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold'
    },
    note: {
        fontSize: 12,
        color: colors.darkGray,
        textAlign: 'center',
        marginTop: 20
    }
});