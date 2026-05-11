import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import colors from '../../constants/colors';

export default function ResumeScreen({ token, navigation }) {
    const [resume, setResume] = useState({ skills: '', experience: '', hourlyRate: '', education: '', bio: '' });

    const saveResume = async () => {
        try {
            const response = await fetch('http://192.168.68.120:5000/api/resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(resume)
            });
            const data = await response.json();
            
            if (data.success) {
                Alert.alert('Success', 'Resume saved!');
            } else {
                Alert.alert('Error', 'Failed to save resume');
            }
        } catch (err) {
            Alert.alert('Error', 'Connection failed');
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.gray, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 20 }}>My Resume</Text>
            
            <TextInput 
                style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }} 
                placeholder="Skills (e.g., Plumbing, Welding, Electrical)" 
                value={resume.skills} 
                onChangeText={text => setResume({...resume, skills: text})} 
                multiline 
            />
            
            <TextInput 
                style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }} 
                placeholder="Experience (years)" 
                value={resume.experience} 
                onChangeText={text => setResume({...resume, experience: text})} 
                keyboardType="numeric" 
            />
            
            <TextInput 
                style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }} 
                placeholder="Hourly Rate (₱)" 
                value={resume.hourlyRate} 
                onChangeText={text => setResume({...resume, hourlyRate: text})} 
                keyboardType="numeric" 
            />
            
            <TextInput 
                style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' }} 
                placeholder="Education" 
                value={resume.education} 
                onChangeText={text => setResume({...resume, education: text})} 
            />
            
            <TextInput 
                style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', height: 100 }} 
                placeholder="Bio / About Me" 
                value={resume.bio} 
                onChangeText={text => setResume({...resume, bio: text})} 
                multiline 
            />
            
            <TouchableOpacity 
                style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 }} 
                onPress={saveResume}
            >
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>Save Resume</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={{ backgroundColor: colors.darkGray, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }} 
                onPress={() => navigation.goBack()}
            >
                <Text style={{ color: colors.white, fontWeight: 'bold' }}>Back</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
