import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function JobApplicationsScreen({ route, navigation }) {
    const { jobId, jobTitle } = route.params || {};
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        if (jobId) {
            fetchApplications();
        }
    }, [jobId]);

    const fetchApplications = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/jobs/${jobId}/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load applications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    const handleReview = async (applicationId, status) => {
        Alert.alert(
            status === 'accepted' ? 'Accept Application' : 'Reject Application',
            `Are you sure you want to ${status} this application?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            await fetch(`${API_URL}/applications/${applicationId}/review`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ status })
                            });
                            Alert.alert('Success', `Application ${status}`);
                            fetchApplications();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to review application');
                        }
                    }
                }
            ]
        );
    };

    const viewWorkerProfile = (workerId, workerName) => {
        navigation.navigate('WorkerProfile', {
            workerId: workerId,
            workerName: workerName,
            jobId: jobId
        });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10 }}>Loading applications...</Text>
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
                    <Text style={{ color: colors.primary, fontSize: 16 }}>Back to My Jobs</Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                    Applications for: {jobTitle || 'Job'}
                </Text>
                <Text style={{ color: colors.darkGray, marginBottom: 20 }}>
                    {applications.length} worker(s) applied
                </Text>

                {applications.length === 0 ? (
                    <View style={{ alignItems: 'center', padding: 40, backgroundColor: colors.white, borderRadius: 12 }}>
                        <Text style={{ fontSize: 50, marginBottom: 10 }}>📭</Text>
                        <Text style={{ textAlign: 'center', color: colors.darkGray }}>No applications yet</Text>
                        <Text style={{ textAlign: 'center', color: colors.darkGray, fontSize: 12, marginTop: 5 }}>
                            Workers will appear here when they apply
                        </Text>
                    </View>
                ) : (
                    applications.map(app => (
                        <View key={app.id} style={{
                            backgroundColor: colors.white,
                            borderRadius: 12,
                            padding: 15,
                            marginBottom: 15,
                            elevation: 2
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    backgroundColor: colors.gray,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{ fontSize: 25 }}>👤</Text>
                                </View>
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{app.worker?.name || 'Unknown'}</Text>
                                    <Text style={{ color: colors.darkGray, fontSize: 12 }}>⭐ Rating: {app.worker?.rating || 'New'}</Text>
                                    {app.worker_distance_km && (
                                        <Text style={{ color: colors.info, fontSize: 11 }}>📍 {app.worker_distance_km} km away</Text>
                                    )}
                                </View>
                                <View style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 20,
                                    backgroundColor: 
                                        app.status === 'pending' ? '#F59E0B20' :
                                        app.status === 'accepted' ? '#22C55E20' : '#EF444420'
                                }}>
                                    <Text style={{
                                        color: app.status === 'pending' ? '#F59E0B' :
                                               app.status === 'accepted' ? '#22C55E' : '#EF4444',
                                        fontSize: 11,
                                        fontWeight: 'bold'
                                    }}>
                                        {app.status?.toUpperCase() || 'PENDING'}
                                    </Text>
                                </View>
                            </View>

                            <Text style={{ fontSize: 12, color: colors.darkGray, marginTop: 10 }}>
                                Applied: {new Date(app.applied_at).toLocaleString()}
                            </Text>

                            {/* VIEW FULL PROFILE & RESUME BUTTON */}
                            <TouchableOpacity
                                style={{ backgroundColor: colors.info, padding: 10, borderRadius: 8, marginTop: 10 }}
                                onPress={() => viewWorkerProfile(app.worker_id, app.worker?.name)}
                            >
                                <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>
                                    👤 View Full Profile & Resume
                                </Text>
                            </TouchableOpacity>

                            {app.status === 'pending' && (
                                <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#22C55E', padding: 10, borderRadius: 8, alignItems: 'center' }}
                                        onPress={() => handleReview(app.id, 'accepted')}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>✓ Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#EF4444', padding: 10, borderRadius: 8, alignItems: 'center' }}
                                        onPress={() => handleReview(app.id, 'rejected')}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>✗ Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            
                            {app.status === 'accepted' && (
                                <View style={{ marginTop: 10, backgroundColor: '#22C55E20', padding: 10, borderRadius: 8 }}>
                                    <Text style={{ color: '#22C55E', textAlign: 'center', fontWeight: 'bold' }}>
                                        ✓ Application Accepted - Contact the worker
                                    </Text>
                                </View>
                            )}
                            
                            {app.status === 'rejected' && (
                                <View style={{ marginTop: 10, backgroundColor: '#EF444420', padding: 10, borderRadius: 8 }}>
                                    <Text style={{ color: '#EF4444', textAlign: 'center', fontWeight: 'bold' }}>
                                        ✗ Application Rejected
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