import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function MyJobsScreen({ token, navigation }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/jobs`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            });
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load jobs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const viewApplications = (jobId, jobTitle) => {
        navigation.navigate('jobApplications', { jobId, jobTitle });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray }}>
                <Text>Loading...</Text>
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

                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 20 }}>
                    My Posted Jobs
                </Text>

                {jobs.length === 0 ? (
                    <View style={{ alignItems: 'center', padding: 40 }}>
                        <Text style={{ fontSize: 50, marginBottom: 10 }}>📭</Text>
                        <Text style={{ textAlign: 'center', color: colors.darkGray }}>
                            No jobs posted yet. Tap "Post a Job" to get started!
                        </Text>
                    </View>
                ) : (
                    jobs.map(job => (
                        <View key={job.id} style={{
                            backgroundColor: colors.white,
                            borderRadius: 12,
                            padding: 15,
                            marginBottom: 15,
                            elevation: 2
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary }}>
                                {job.title}
                            </Text>
                            <Text style={{ color: colors.darkGray, fontSize: 12, marginTop: 5 }}>
                                ₱{job.budget} • {job.status}
                            </Text>
                            
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                                <View style={{
                                    backgroundColor: job.status === 'open' ? '#22C55E20' : '#F59E0B20',
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 20
                                }}>
                                    <Text style={{ color: job.status === 'open' ? '#22C55E' : '#F59E0B' }}>
                                        {job.status === 'open' ? '🟢 Open' : '🔧 Taken'}
                                    </Text>
                                </View>
                                
                                <TouchableOpacity
                                    style={{ backgroundColor: colors.info, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}
                                    onPress={() => viewApplications(job.id, job.title)}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>👥 View Applications</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}