import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

export default function LoginScreen({ onLogin, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            console.log('Logging in with:', email);
            
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const data = await response.json();
            console.log('Login response:', data);
            
            if (data.success) {
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.token, data.user);
            } else {
                Alert.alert('Login Failed', data.error || 'Invalid credentials');
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.log('Login error:', err);
            
            if (err.name === 'AbortError') {
                Alert.alert('Timeout', 'Server is taking too long to respond. Please check your connection.');
            } else {
                Alert.alert('Connection Error', 'Cannot connect to server. Make sure backend is running at: ' + API_URL);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.gray }}>
            <View style={{ backgroundColor: colors.primary, padding: 50, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.white }}>🏗️ DOLE Central Luzon</Text>
                <Text style={{ fontSize: 14, color: '#BFDBFE', marginTop: 5 }}>Blue Collar Job Platform</Text>
            </View>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: colors.primary }}>Login</Text>
                
                <TextInput 
                    style={{ backgroundColor: colors.white, padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' }} 
                    placeholder="Email" 
                    value={email} 
                    onChangeText={setEmail} 
                    autoCapitalize="none" 
                    autoComplete="email"
                />
                
                <TextInput 
                    style={{ backgroundColor: colors.white, padding: 15, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' }} 
                    placeholder="Password" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                />
                
                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }} 
                    onPress={handleLogin} 
                    disabled={loading}
                >
                    <Text style={{ color: colors.white, fontSize: 18, fontWeight: 'bold' }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={onSwitchToRegister} style={{ marginTop: 20 }}>
                    <Text style={{ textAlign: 'center', color: colors.primary }}>Create an account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
