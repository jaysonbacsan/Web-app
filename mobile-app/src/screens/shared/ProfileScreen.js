import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import colors from '../constants/colors';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function ProfileScreen({ user, onLogout, navigation }) {
    const [profile, setProfile] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfile();
        });
        
        fetchProfile();
        requestPermissions();
        
        return unsubscribe;
    }, [navigation]);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission not granted');
        }
    };

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProfile(data);
            
            // Update the stored user data to reflect changes
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const currentUser = JSON.parse(storedUser);
                currentUser.is_verified = data.is_verified;
                currentUser.verification_status = data.verification_status;
                await AsyncStorage.setItem('user', JSON.stringify(currentUser));
            }
            
            if (data.profile_image) {
                const imageUrl = `http://192.168.68.150:5000${data.profile_image}`;
                setProfileImage(imageUrl);
            }
        } catch (err) {
            console.log('Error fetching profile:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            await uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            
            const formData = new FormData();
            formData.append('profileImage', {
                uri: uri,
                name: 'profile.jpg',
                type: 'image/jpeg'
            });

            console.log('Uploading image...');
            
            const response = await fetch(`${API_URL}/upload-profile-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            console.log('Upload response:', data);
            
            if (data.success) {
                setProfileImage(data.imageUrl);
                Alert.alert('Success', 'Profile picture updated!');
                fetchProfile();
            } else {
                Alert.alert('Error', data.error || 'Failed to upload image');
            }
        } catch (err) {
            console.log('Upload error:', err);
            Alert.alert('Error', 'Connection failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: colors.gray }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Profile Header with Clickable Image */}
            <View style={{ backgroundColor: colors.primary, padding: 30, alignItems: 'center', paddingBottom: 40 }}>
                
                {/* Clickable Profile Image */}
                <TouchableOpacity 
                    onPress={pickImage} 
                    disabled={uploading}
                    style={{ alignItems: 'center' }}
                >
                    <View style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: colors.white,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 3,
                        borderColor: colors.white,
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {uploading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : profileImage ? (
                            <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <Text style={{ fontSize: 50 }}>👤</Text>
                        )}
                        
                        {/* Camera icon overlay */}
                        <View style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: colors.primary,
                            borderRadius: 15,
                            width: 30,
                            height: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: colors.white
                        }}>
                            <Text style={{ fontSize: 14, color: colors.white }}>📷</Text>
                        </View>
                    </View>
                    <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#BFDBFE' }}>
                        {uploading ? 'Uploading...' : 'Tap to change photo'}
                    </Text>
                </TouchableOpacity>
                
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.white, marginTop: 15 }}>
                    {profile?.name}
                </Text>
                <View style={{ marginTop: 10 }}>
                    <VerifiedBadge 
                        isVerified={profile?.is_verified} 
                        verificationStatus={profile?.verification_status} 
                    />
                </View>
            </View>

            {/* Profile Info Cards */}
            <View style={{ padding: 20, marginTop: -20 }}>
                
                {/* Personal Information */}
                <View style={{ backgroundColor: colors.white, borderRadius: 15, padding: 20, marginBottom: 15, elevation: 3 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 15 }}>
                        📋 Personal Information
                    </Text>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ color: colors.darkGray, fontSize: 12 }}>Full Name</Text>
                        <Text style={{ fontSize: 16, fontWeight: '500' }}>{profile?.name}</Text>
                    </View>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ color: colors.darkGray, fontSize: 12 }}>Email Address</Text>
                        <Text style={{ fontSize: 16 }}>{profile?.email}</Text>
                    </View>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ color: colors.darkGray, fontSize: 12 }}>Phone Number</Text>
                        <Text style={{ fontSize: 16 }}>{profile?.phone || 'Not set'}</Text>
                    </View>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ color: colors.darkGray, fontSize: 12 }}>Address</Text>
                        <Text style={{ fontSize: 16 }}>{profile?.address || 'Not set'}</Text>
                    </View>
                    <View>
                        <Text style={{ color: colors.darkGray, fontSize: 12 }}>Account Type</Text>
                        <Text style={{ fontSize: 16 }}>{profile?.role === 'worker' ? '🔧 Worker' : '🏢 Client'}</Text>
                    </View>
                    {profile?.business_name && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ color: colors.darkGray, fontSize: 12 }}>Business Name</Text>
                            <Text style={{ fontSize: 16 }}>{profile.business_name}</Text>
                        </View>
                    )}
                </View>

                {/* Verification Section */}
                <View style={{ backgroundColor: colors.white, borderRadius: 15, padding: 20, marginBottom: 15, elevation: 3 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 15 }}>
                        🔒 Verification Status
                    </Text>
                    {!profile?.is_verified ? (
                        <>
                            <Text style={{ color: colors.warning, marginBottom: 10 }}>
                                ⚠️ Your account is not verified. You need to verify to access all features.
                            </Text>
                            <TouchableOpacity 
                                style={{ backgroundColor: colors.info, padding: 12, borderRadius: 10, alignItems: 'center' }}
                                onPress={() => navigation.navigate('verification')}
                            >
                                <Text style={{ color: colors.white, fontWeight: 'bold' }}>📋 Submit Verification Documents</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#22C55E20', padding: 12, borderRadius: 10 }}>
                            <Text style={{ fontSize: 24, marginRight: 10 }}>✅</Text>
                            <Text style={{ color: colors.verified, fontWeight: 'bold', flex: 1 }}>
                                Your account is verified! You have full access.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Statistics */}
                <View style={{ backgroundColor: colors.white, borderRadius: 15, padding: 20, marginBottom: 15, elevation: 3 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 15 }}>
                        📊 Statistics
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>⭐</Text>
                            <Text style={{ fontSize: 12, color: colors.darkGray }}>Rating</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{profile?.rating || 'New'}</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>📋</Text>
                            <Text style={{ fontSize: 12, color: colors.darkGray }}>Jobs</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{profile?.total_jobs || 0}</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>✅</Text>
                            <Text style={{ fontSize: 12, color: colors.darkGray }}>Completed</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{profile?.completed_jobs || 0}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>← Back to Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={onLogout} 
                    style={{ backgroundColor: colors.danger, padding: 15, borderRadius: 12, alignItems: 'center' }}
                >
                    <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
