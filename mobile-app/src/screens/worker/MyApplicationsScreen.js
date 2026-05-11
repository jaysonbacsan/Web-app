import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function MyApplicationsScreen({ navigation }) {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/my-applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('My applications:', data);
            setApplications(data);
        } catch (err) {
            console.log('Error:', err);
            Alert.alert('Error', 'Failed to load your applications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return '#F59E0B';
            case 'accepted': return '#22C55E';
            case 'rejected': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'pending': return '⏳ Pending Review';
            case 'accepted': return '✅ Accepted';
            case 'rejected': return '❌ Rejected';
            default: return status;
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10 }}>Loading your applications...</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: colors.gray }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={{ padding: 20 }}>
                {/* Back Button */}
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={{ marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}
                >
                    <Text style={{ fontSize: 24, marginRight: 5 }}>←</Text>
                    <Text style={{ color: colors.primary, fontSize: 16 }}>Back to Dashboard</Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                    My Job Applications
                </Text>
                <Text style={{ fontSize: 14, color: colors.darkGray, marginBottom: 20 }}>
                    {applications.length} job(s) you applied for
                </Text>

                {applications.length === 0 ? (
                    <View style={{ 
                        backgroundColor: colors.white, 
                        padding: 40, 
                        borderRadius: 12, 
                        alignItems: 'center',
                        marginTop: 20
                    }}>
                        <Text style={{ fontSize: 50, marginBottom: 10 }}>📭</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                            No applications yet
                        </Text>
                        <Text style={{ textAlign: 'center', color: colors.darkGray }}>
                            You haven't applied for any jobs yet.
                            {'\n'}Go to "Available Jobs" to find work!
                        </Text>
                    </View>
                ) : (
                    applications.map((app) => (
                        <View key={app.id} style={{ 
                            backgroundColor: colors.white, 
                            borderRadius: 12, 
                            padding: 15, 
                            marginBottom: 15,
                            elevation: 2,
                            borderLeftWidth: 4,
                            borderLeftColor: getStatusColor(app.status)
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
                                    {app.job?.title || 'Unknown Job'}
                                </Text>
                                <View style={{ 
                                    backgroundColor: getStatusColor(app.status) + '20',
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 20
                                }}>
                                    <Text style={{ color: getStatusColor(app.status), fontSize: 12, fontWeight: 'bold' }}>
                                        {getStatusText(app.status)}
                                    </Text>
                                </View>
                            </View>

                            <Text style={{ color: colors.darkGray, fontSize: 12, marginBottom: 5 }}>
                                {app.job?.category} • ₱{app.job?.budget}
                            </Text>

                            <Text style={{ marginVertical: 5 }} numberOfLines={2}>
                                {app.job?.description}
                            </Text>

                            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' }}>
                                <Text style={{ fontSize: 12, color: colors.darkGray }}>
                                    Applied: {new Date(app.applied_at).toLocaleString()}
                                </Text>
                                <Text style={{ fontSize: 12, color: colors.info, marginTop: 5 }}>
                                    👤 Client: {app.job?.client?.name || 'Unknown'}
                                </Text>
                                {app.job?.client?.business_name && (
                                    <Text style={{ fontSize: 12, color: colors.darkGray }}>
                                        🏢 Business: {app.job.client.business_name}
                                    </Text>
                                )}
                                {app.worker_distance_km && (
                                    <Text style={{ fontSize: 12, color: colors.info, marginTop: 5 }}>
                                        📍 You were {app.worker_distance_km}km away
                                    </Text>
                                )}
                            </View>

                            {app.status === 'accepted' && (
                                <TouchableOpacity 
                                    style={{ backgroundColor: colors.info, padding: 10, borderRadius: 8, marginTop: 10 }}
                                    onPress={() => {
                                        Alert.alert('Contact Client', `Contact ${app.job?.client?.name} at ${app.job?.client?.email || 'check your email'}`);
                                    }}
                                >
                                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                                        📞 Contact Client
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {app.status === 'rejected' && (
                                <View style={{ backgroundColor: '#EF444420', padding: 10, borderRadius: 8, marginTop: 10 }}>
                                    <Text style={{ color: '#EF4444', textAlign: 'center', fontSize: 12 }}>
                                        This application was not selected. Keep applying to other jobs!
                                    </Text>
                                </View>
                            )}

                            {app.status === 'pending' && (
                                <View style={{ backgroundColor: '#F59E0B20', padding: 10, borderRadius: 8, marginTop: 10 }}>
                                    <Text style={{ color: '#F59E0B', textAlign: 'center', fontSize: 12 }}>
                                        ⏳ Your application is being reviewed by the client
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}