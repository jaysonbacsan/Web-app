import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

export default function NotificationBell({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;
            
            const response = await fetch(`${API_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.log('Error fetching notifications:', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.log('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
            Alert.alert('Success', 'All notifications marked as read');
        } catch (err) {
            console.log('Error marking all as read:', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'verified': return '✅';
            case 'rejected': return '❌';
            case 'approved': return '✅';
            case 'application': return '📝';
            case 'job_taken': return '🔧';
            default: return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch(type) {
            case 'verified': return '#22C55E';
            case 'rejected': return '#EF4444';
            default: return '#3B82F6';
        }
    };

    return (
        <>
            <TouchableOpacity onPress={() => setShowModal(true)} style={{ position: 'relative', marginRight: 15 }}>
                <Text style={{ fontSize: 24 }}>🔔</Text>
                {unreadCount > 0 && (
                    <View style={{
                        position: 'absolute',
                        top: -5,
                        right: -10,
                        backgroundColor: colors.danger,
                        borderRadius: 10,
                        minWidth: 18,
                        height: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 4
                    }}>
                        <Text style={{ color: colors.white, fontSize: 10, fontWeight: 'bold' }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal visible={showModal} animationType="slide" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: colors.white,
                        marginTop: 100,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary }}>
                                🔔 Notifications
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={{ fontSize: 20, color: colors.darkGray }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {notifications.length > 0 && (
                            <TouchableOpacity onPress={markAllAsRead} style={{ marginBottom: 10 }}>
                                <Text style={{ color: colors.info, textAlign: 'right' }}>Mark all as read</Text>
                            </TouchableOpacity>
                        )}

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {notifications.length === 0 ? (
                                <View style={{ alignItems: 'center', padding: 40 }}>
                                    <Text style={{ fontSize: 50, marginBottom: 10 }}>🔕</Text>
                                    <Text style={{ color: colors.darkGray }}>No notifications yet</Text>
                                </View>
                            ) : (
                                notifications.map(notif => (
                                    <TouchableOpacity
                                        key={notif.id}
                                        style={{
                                            backgroundColor: notif.is_read ? '#f9f9f9' : '#EFF6FF',
                                            padding: 15,
                                            borderRadius: 10,
                                            marginBottom: 10,
                                            borderLeftWidth: 3,
                                            borderLeftColor: getNotificationColor(notif.type)
                                        }}
                                        onPress={() => markAsRead(notif.id)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 24, marginRight: 10 }}>
                                                {getNotificationIcon(notif.type)}
                                            </Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontWeight: 'bold', color: colors.text }}>
                                                    {notif.title}
                                                </Text>
                                                <Text style={{ fontSize: 12, color: colors.darkGray, marginTop: 5 }}>
                                                    {notif.message}
                                                </Text>
                                                <Text style={{ fontSize: 10, color: colors.darkGray, marginTop: 5 }}>
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </Text>
                                            </View>
                                            {!notif.is_read && (
                                                <View style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: 5,
                                                    backgroundColor: colors.info
                                                }} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}