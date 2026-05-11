import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function ApplyForJobScreen({ route, navigation, user }) {
    // FIXED: The job is directly in route, not route.params
    const job = route?.job || route?.params?.job;
    
    console.log('ApplyForJobScreen - Job found:', job?.id, job?.title);
    
    const [location, setLocation] = useState(null);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        checkLocation();
    }, []);

    useEffect(() => {
        if (!job && !loading) {
            Alert.alert('Error', 'No job selected. Please try again.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    }, [job, loading]);

    const checkLocation = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            
            if (status === 'granted') {
                const userLoc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                setLocation(userLoc.coords);
                setLocationEnabled(true);
            } else {
                setLocationEnabled(false);
            }
        } catch (err) {
            console.log('Location error:', err);
            setLocationEnabled(false);
        } finally {
            setLoading(false);
        }
    };

    const requestLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
            const userLoc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            setLocation(userLoc.coords);
            setLocationEnabled(true);
        } else {
            Alert.alert(
                'Location Required',
                'Please enable location to apply for jobs',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
        }
    };

    const handleApply = async () => {
        if (!locationEnabled) {
            Alert.alert('Location Required', 'Please enable location to apply for this job');
            return;
        }

        if (!user?.is_verified) {
            Alert.alert('Not Verified', 'Please complete verification first');
            return;
        }

        setSubmitting(true);
        
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/jobs/${job.id}/apply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    location_lat: location?.latitude,
                    location_lng: location?.longitude
                })
            });
            
            const data = await response.json();
            console.log('Apply response:', data);
            
            if (data.success) {
                Alert.alert('Success', 'Application submitted!');
                navigation.goBack();
            } else {
                Alert.alert('Error', data.error || 'Failed to apply');
            }
        } catch (err) {
            console.log('Apply error:', err);
            Alert.alert('Error', 'Connection failed. Make sure backend is running.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>❌</Text>
                <Text style={{ fontSize: 16, color: colors.darkGray }}>Job not found</Text>
                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginTop: 20 }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ color: colors.white }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.gray, padding: 20 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 16, color: colors.primary }}>← Back to Jobs</Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: colors.primary, padding: 20, borderRadius: 12, marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>{job.title}</Text>
                <Text style={{ color: '#BFDBFE', marginTop: 5 }}>₱{job.budget} • {job.category}</Text>
            </View>

            <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 15, marginBottom: 15 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Job Description:</Text>
                <Text>{job.description}</Text>
            </View>

            <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 15, marginBottom: 15 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>📍 Location</Text>
                <Text style={{ color: locationEnabled ? colors.verified : colors.danger }}>
                    {locationEnabled ? '✓ Location enabled' : '⚠️ Location required'}
                </Text>
                {!locationEnabled && (
                    <TouchableOpacity 
                        style={{ backgroundColor: colors.info, padding: 10, borderRadius: 8, marginTop: 10 }}
                        onPress={requestLocation}
                    >
                        <Text style={{ color: 'white', textAlign: 'center' }}>Enable Location</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity 
                style={{ 
                    backgroundColor: (user?.is_verified && locationEnabled) ? colors.primary : colors.darkGray, 
                    padding: 15, 
                    borderRadius: 10, 
                    alignItems: 'center',
                    marginTop: 20
                }}
                onPress={handleApply}
                disabled={submitting || !user?.is_verified || !locationEnabled}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {submitting ? 'Submitting...' : 'Submit Application'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}