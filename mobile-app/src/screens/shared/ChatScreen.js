import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function ChatScreen({ route, navigation }) {
    const { userId, userName, jobId } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef();

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMessages(data);
            scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch (err) {
            console.log('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver_id: userId,
                    job_id: jobId,
                    message: newMessage
                })
            });
            
            const data = await response.json();
            setMessages([...messages, data]);
            setNewMessage('');
            scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch (err) {
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: colors.gray }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={{ backgroundColor: colors.primary, padding: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.white }}>
                    💬 Chat with {userName}
                </Text>
            </View>

            <ScrollView 
                ref={scrollViewRef}
                style={{ flex: 1, padding: 15 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg, index) => (
                    <View key={msg.id || index} style={{
                        alignItems: msg.sender_id === userId ? 'flex-start' : 'flex-end',
                        marginBottom: 10
                    }}>
                        <View style={{
                            backgroundColor: msg.sender_id === userId ? colors.gray : colors.primary,
                            padding: 10,
                            borderRadius: 15,
                            maxWidth: '80%'
                        }}>
                            <Text style={{ color: msg.sender_id === userId ? colors.text : colors.white }}>
                                {msg.message}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#666', marginTop: 5 }}>
                                {formatTime(msg.created_at)}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', padding: 10, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#ddd' }}>
                <TextInput
                    style={{ flex: 1, backgroundColor: colors.gray, padding: 10, borderRadius: 20, marginRight: 10 }}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 25, width: 45, alignItems: 'center' }}
                    onPress={sendMessage}
                >
                    <Text style={{ color: colors.white, fontSize: 18 }}>➤</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}