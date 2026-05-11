import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

export default function ProfileImagePicker({ currentImage, onImageUpdate }) {
    const [image, setImage] = useState(currentImage);
    const [uploading, setUploading] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photos');
            return;
        }

        // Launch image picker
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
            
            // Create form data
            const formData = new FormData();
            formData.append('profileImage', {
                uri: uri,
                name: 'profile.jpg',
                type: 'image/jpeg'
            });

            console.log('Uploading image...');
            console.log('API URL:', `${API_URL}/upload-profile-image`);
            
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
                setImage(data.imageUrl);
                onImageUpdate(data.imageUrl);
                Alert.alert('Success', 'Profile picture updated!');
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

    return (
        <TouchableOpacity onPress={pickImage} disabled={uploading} style={{ alignItems: 'center' }}>
            <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.gray,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: colors.primary,
                overflow: 'hidden',
                position: 'relative'
            }}>
                {uploading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : image ? (
                    <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
                ) : (
                    <Text style={{ fontSize: 40 }}>👤</Text>
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
                    <Text style={{ fontSize: 16, color: colors.white }}>📷</Text>
                </View>
            </View>
            <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: colors.info }}>
                {uploading ? 'Uploading...' : 'Tap to change photo'}
            </Text>
        </TouchableOpacity>
    );
}
