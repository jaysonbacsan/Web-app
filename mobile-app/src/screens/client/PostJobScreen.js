import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function PostJobScreen({ token, user, navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    const categories = ['Construction', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Welding', 'Driving', 'Cleaning'];

    const handlePostJob = async () => {
        if (!title || !description || !category || !budget) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (!user.is_verified) {
            Alert.alert('Not Verified', 'Please complete verification first to post jobs');
            return;
        }

        setLoading(true);
        
        try {
            const storedToken = await AsyncStorage.getItem('token');
            console.log('Posting job...');
            
            const response = await fetch(`${API_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    budget: parseFloat(budget),
                    location: { lat: 0, lng: 0 }
                })
            });
            
            const data = await response.json();
            console.log('Post job response:', data);
            
            if (data.id) {
                Alert.alert('Success', 'Job posted successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Error', data.error || 'Failed to post job');
            }
        } catch (err) {
            console.log('Post job error:', err);
            Alert.alert('Error', 'Connection failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.gray, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 20 }}>
                Post a Job
            </Text>
            
            <TextInput 
                style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }} 
                placeholder="Job Title" 
                value={title} 
                onChangeText={setTitle} 
            />
            
            <TextInput 
                style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', height: 100 }} 
                placeholder="Description" 
                value={description} 
                onChangeText={setDescription} 
                multiline 
            />
            
            <Text style={{ marginBottom: 5 }}>Category:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                {categories.map(cat => (
                    <TouchableOpacity 
                        key={cat} 
                        style={{ 
                            backgroundColor: category === cat ? colors.primary : '#E5E7EB', 
                            padding: 8, 
                            borderRadius: 20, 
                            margin: 5 
                        }} 
                        onPress={() => setCategory(cat)}
                    >
                        <Text style={{ color: category === cat ? colors.white : colors.text }}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            <TextInput 
                style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }} 
                placeholder="Budget (₱)" 
                value={budget} 
                onChangeText={setBudget} 
                keyboardType="numeric" 
            />
            
            {!user.is_verified && (
                <View style={{ backgroundColor: '#FEF3C7', padding: 10, borderRadius: 10, marginBottom: 10 }}>
                    <Text style={{ color: colors.warning }}>
                        ⚠️ Your account is not verified. You need to be verified to post jobs.
                    </Text>
                </View>
            )}
            
            <TouchableOpacity 
                style={{ 
                    backgroundColor: user.is_verified ? colors.primary : colors.darkGray, 
                    padding: 15, 
                    borderRadius: 10, 
                    alignItems: 'center', 
                    marginTop: 20 
                }} 
                onPress={handlePostJob} 
                disabled={!user.is_verified || loading}
            >
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>
                    {loading ? 'Posting...' : 'Post Job'}
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={{ backgroundColor: colors.darkGray, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }} 
                onPress={() => navigation.goBack()}
            >
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}