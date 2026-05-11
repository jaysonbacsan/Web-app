import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import colors from '../constants/colors';

export default function RegisterScreen({ onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('worker');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';  // ← YOUR IP

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        
        try {
            console.log('Registering at:', `${API_URL}/register`);
            console.log('Data:', { name, email, password, role, phone, address });
            
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role, phone, address })
            });
            
            const data = await response.json();
            console.log('Response:', data);
            
            if (data.success) {
                Alert.alert('Success', 'Registration successful! Please login.');
                onSwitchToLogin();
            } else {
                Alert.alert('Error', data.error || 'Registration failed');
            }
        } catch (err) {
            console.log('Error:', err);
            Alert.alert('Error', 'Connection failed. Make sure backend is running at ' + API_URL);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.gray }}>
            <View style={{ backgroundColor: colors.primary, padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.white }}>🏗️ DOLE Central Luzon</Text>
                <Text style={{ fontSize: 14, color: '#BFDBFE', marginTop: 5 }}>Blue Collar Job Platform</Text>
            </View>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: colors.primary }}>Register</Text>
                
                <TextInput 
                    style={{ backgroundColor: colors.white, padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' }} 
                    placeholder="Full Name" 
                    value={name} 
                    onChangeText={setName} 
                />
                
                <TextInput 
                    style={{ backgroundColor: colors.white, padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' }} 
                    placeholder="Email" 
                    value={email} 
                    onChangeText={setEmail} 
                    autoCapitalize="none" 
                />
                
                <TextInput 
                    style={{ backgroundColor: colors.white, padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' }} 
                    placeholder="Password" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                />
                
                <TextInput 
                    style={{ backgroundColor: colors.white, padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' }} 
                    placeholder="Phone" 
                    value={phone} 
                    onChangeText={setPhone} 
                />
                
                <TextInput 
                    style={{ backgroundColor: colors.white, padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' }} 
                    placeholder="Address" 
                    value={address} 
                    onChangeText={setAddress} 
                />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <TouchableOpacity 
                        style={{ flex: 1, padding: 10, backgroundColor: role === 'worker' ? colors.primary : '#E5E7EB', borderRadius: 10, marginRight: 5, alignItems: 'center' }} 
                        onPress={() => setRole('worker')}
                    >
                        <Text style={{ color: role === 'worker' ? colors.white : colors.text }}>🔧 Worker</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1, padding: 10, backgroundColor: role === 'client' ? colors.primary : '#E5E7EB', borderRadius: 10, marginLeft: 5, alignItems: 'center' }} 
                        onPress={() => setRole('client')}
                    >
                        <Text style={{ color: role === 'client' ? colors.white : colors.text }}>🏢 Client</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' }} 
                    onPress={handleRegister} 
                    disabled={loading}
                >
                    <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>{loading ? 'Please wait...' : 'Register'}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={onSwitchToLogin} style={{ marginTop: 20 }}>
                    <Text style={{ textAlign: 'center', color: colors.primary }}>Already have an account? Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
