import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function WorkerProfileScreen({ route, navigation }) {
    const { workerId, workerName, jobId } = route.params;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        fetchWorkerProfile();
    }, []);

    const fetchWorkerProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/worker-profile/${workerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProfile(data);
        } catch (err) {
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const hireWorker = async () => {
        Alert.alert(
            'Hire Worker',
            `Are you sure you want to hire ${workerName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Hire',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            await fetch(`${API_URL}/hire-worker/${jobId}`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            Alert.alert('Success', 'Worker hired! They will be notified.');
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to hire worker');
                        }
                    }
                }
            ]
        );
    };

    const startChat = () => {
        navigation.navigate('chat', { userId: workerId, userName: workerName, jobId });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.gray }}>
            <View style={{ backgroundColor: colors.primary, padding: 30, alignItems: 'center' }}>
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 50 }}>👤</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.white, marginTop: 10 }}>
                    {profile?.worker?.name}
                </Text>
                <View style={{ marginTop: 5, backgroundColor: profile?.worker?.is_verified ? '#22C55E' : '#F59E0B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                    <Text style={{ color: 'white', fontSize: 12 }}>
                        {profile?.worker?.is_verified ? '✓ Verified' : '⚠️ Unverified'}
                    </Text>
                </View>
            </View>

            <View style={{ padding: 20 }}>
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 15, marginBottom: 15 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>👤 Personal Information</Text>
                    {profile?.worker?.age && <Text><Text style={{ fontWeight: 'bold' }}>Age:</Text> {profile.worker.age}</Text>}
                    <Text><Text style={{ fontWeight: 'bold' }}>Phone:</Text> {profile?.worker?.phone || 'Not set'}</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Address:</Text> {profile?.worker?.address || 'Not set'}</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Rating:</Text> ⭐ {profile?.worker?.rating || 'New'}</Text>
                </View>

                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 15, marginBottom: 15 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>🛠️ Skills & Experience</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Skills:</Text> {profile?.resume?.skills || 'Not specified'}</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Experience:</Text> {profile?.resume?.experience_years || 0} years</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Hourly Rate:</Text> ₱{profile?.resume?.hourly_rate || 0}</Text>
                </View>

                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 15, marginBottom: 15 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>📝 Bio</Text>
                    <Text>{profile?.worker?.bio || 'No bio provided'}</Text>
                </View>

                <TouchableOpacity 
                    style={{ backgroundColor: colors.success, padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 }}
                    onPress={hireWorker}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>✅ Hire Worker</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={{ backgroundColor: colors.info, padding: 15, borderRadius: 10, alignItems: 'center' }}
                    onPress={startChat}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>💬 Message Worker</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}