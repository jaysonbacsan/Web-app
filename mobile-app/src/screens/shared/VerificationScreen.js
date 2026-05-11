import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function VerificationScreen({ token, user, navigation }) {
    const [loading, setLoading] = useState(false);
    const [validId, setValidId] = useState(null);
    const [resume, setResume] = useState(null);
    const [businessPermit, setBusinessPermit] = useState(null);
    const [nbiClearance, setNbiClearance] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        requestPermissions();
        checkExistingVerification();
    }, []);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photos');
        }
    };

    const checkExistingVerification = async () => {
        try {
            const response = await fetch(`${API_URL}/verification-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.is_verified) {
                Alert.alert('Already Verified', 'Your account is already verified!');
                navigation.goBack();
            }
        } catch (err) {
            console.log('Error checking verification:', err);
        }
    };

    const pickImage = async (setter) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        
        if (!result.canceled) {
            setter(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!validId) {
            Alert.alert('Error', 'Please upload Valid ID');
            return;
        }
        
        if (user.role === 'worker' && !resume) {
            Alert.alert('Error', 'Please upload Resume/CV');
            return;
        }
        
        if (user.role === 'client') {
            if (!businessPermit) {
                Alert.alert('Error', 'Please upload Business Permit');
                return;
            }
            if (!nbiClearance) {
                Alert.alert('Error', 'Please upload NBI Clearance');
                return;
            }
        }
        
        setSubmitting(true);
        
        try {
            const formData = new FormData();
            
            const validIdFile = {
                uri: validId,
                name: 'validId.jpg',
                type: 'image/jpeg'
            };
            formData.append('validId', validIdFile);
            
            if (resume && user.role === 'worker') {
                const resumeFile = {
                    uri: resume,
                    name: 'resume.pdf',
                    type: 'application/pdf'
                };
                formData.append('resume', resumeFile);
            }
            
            if (businessPermit && user.role === 'client') {
                const permitFile = {
                    uri: businessPermit,
                    name: 'businessPermit.jpg',
                    type: 'image/jpeg'
                };
                formData.append('businessPermit', permitFile);
            }
            
            if (nbiClearance && user.role === 'client') {
                const nbiFile = {
                    uri: nbiClearance,
                    name: 'nbiClearance.jpg',
                    type: 'image/jpeg'
                };
                formData.append('nbiClearance', nbiFile);
            }
            
            if (user.role === 'worker') {
                formData.append('skills', skills);
                formData.append('experience_years', experience);
                formData.append('hourly_rate', hourlyRate);
            }
            
            console.log('Submitting verification...');
            
            const response = await fetch(`${API_URL}/submit-verification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
            
            const data = await response.json();
            console.log('Response:', data);
            
            if (data.success) {
                Alert.alert('Success', 'Documents submitted! Admin will review within 24-48 hours.');
                navigation.goBack();
            } else {
                Alert.alert('Error', data.message || data.error || 'Submission failed');
            }
        } catch (err) {
            console.log('Submit error:', err);
            Alert.alert('Error', 'Connection failed. Please check your internet and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const requirements = user?.role === 'worker' 
        ? ['Valid ID', 'Resume/CV', 'Skills', 'Experience']
        : ['Valid ID', 'BIR Business Permit', 'NBI Clearance'];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.gray, padding: 20 }}>
            <View style={{ backgroundColor: colors.primary, padding: 20, borderRadius: 10, marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.white }}>📋 Account Verification</Text>
                <Text style={{ color: '#BFDBFE', marginTop: 5 }}>Submit documents to get verified (GCash style)</Text>
            </View>
            
            <View style={{ backgroundColor: colors.white, borderRadius: 10, padding: 15, marginBottom: 15 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Required Documents:</Text>
                {requirements.map((req, index) => (
                    <Text key={index}>• {req}</Text>
                ))}
            </View>
            
            <TouchableOpacity 
                style={{ backgroundColor: validId ? colors.verified : colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between' }}
                onPress={() => pickImage(setValidId)}
            >
                <Text>{validId ? '✓ Valid ID Selected' : '🪪 Upload Valid ID'}</Text>
                <Text>{validId ? '✅' : '📎'}</Text>
            </TouchableOpacity>
            
            {user?.role === 'worker' && (
                <>
                    <TouchableOpacity 
                        style={{ backgroundColor: resume ? colors.verified : colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between' }}
                        onPress={() => pickImage(setResume)}
                    >
                        <Text>{resume ? '✓ Resume/CV Selected' : '📄 Upload Resume/CV'}</Text>
                        <Text>{resume ? '✅' : '📎'}</Text>
                    </TouchableOpacity>
                    
                    <TextInput
                        style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }}
                        placeholder="Skills (e.g., Plumbing, Electrical)"
                        value={skills}
                        onChangeText={setSkills}
                    />
                    
                    <TextInput
                        style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }}
                        placeholder="Experience (years)"
                        value={experience}
                        onChangeText={setExperience}
                        keyboardType="numeric"
                    />
                    
                    <TextInput
                        style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }}
                        placeholder="Hourly Rate (₱)"
                        value={hourlyRate}
                        onChangeText={setHourlyRate}
                        keyboardType="numeric"
                    />
                </>
            )}
            
            {user?.role === 'client' && (
                <>
                    <TouchableOpacity 
                        style={{ backgroundColor: businessPermit ? colors.verified : colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between' }}
                        onPress={() => pickImage(setBusinessPermit)}
                    >
                        <Text>{businessPermit ? '✓ Business Permit Selected' : '🏢 Upload Business Permit'}</Text>
                        <Text>{businessPermit ? '✅' : '📎'}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={{ backgroundColor: nbiClearance ? colors.verified : colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between' }}
                        onPress={() => pickImage(setNbiClearance)}
                    >
                        <Text>{nbiClearance ? '✓ NBI Clearance Selected' : '🔍 Upload NBI Clearance'}</Text>
                        <Text>{nbiClearance ? '✅' : '📎'}</Text>
                    </TouchableOpacity>
                </>
            )}
            
            <TouchableOpacity 
                style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, opacity: submitting ? 0.7 : 1 }}
                onPress={handleSubmit} 
                disabled={submitting}
            >
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>{submitting ? 'Submitting...' : 'Submit for Verification'}</Text>
            </TouchableOpacity>
            
            <Text style={{ fontSize: 12, color: colors.darkGray, textAlign: 'center', marginTop: 15 }}>
                Documents will be reviewed by admin. You will be notified once verified.
            </Text>
        </ScrollView>
    );
}
