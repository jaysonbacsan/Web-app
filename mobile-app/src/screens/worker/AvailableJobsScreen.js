import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function AvailableJobsScreen({ token, user, userLocation, navigation }) {
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
            console.log('Fetching nearby jobs...');
            
            const response = await fetch(`${API_URL}/jobs/open`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                }
            });
            
            const data = await response.json();
            console.log('Jobs response:', data);
            
            if (Array.isArray(data)) {
                setJobs(data);
            } else {
                setJobs([]);
            }
        } catch (err) {
            console.log('Fetch jobs error:', err);
            Alert.alert('Error', 'Cannot connect to server. Make sure backend is running.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchJobs();
    };

    const applyForJob = (selectedJob) => {
        console.log('Applying for job:', selectedJob);
        
        if (!user?.is_verified) {
            Alert.alert('Not Verified', 'Please complete verification first to apply for jobs');
            return;
        }
        
        if (!selectedJob || !selectedJob.id) {
            Alert.alert('Error', 'Invalid job data. Please try again.');
            return;
        }
        
        // Navigate with the job object
        navigation.navigate('applyForJob', { job: selectedJob });
    };

    const goBack = () => {
        navigation.navigate('dashboard');
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.darkGray }}>Loading jobs...</Text>
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
                    onPress={goBack} 
                    style={{ marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}
                >
                    <Text style={{ fontSize: 24, marginRight: 5 }}>←</Text>
                    <Text style={{ color: colors.primary, fontSize: 16 }}>Back to Dashboard</Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                    Available Jobs
                </Text>
                <Text style={{ fontSize: 14, color: colors.darkGray, marginBottom: 20 }}>
                    {jobs.length} job(s) found
                </Text>
                
                <TouchableOpacity 
                    style={{ 
                        backgroundColor: colors.secondary, 
                        padding: 12, 
                        borderRadius: 10, 
                        alignItems: 'center', 
                        marginBottom: 20
                    }}
                    onPress={fetchJobs}
                >
                    <Text style={{ color: colors.white, fontWeight: 'bold' }}>🔄 Refresh Jobs</Text>
                </TouchableOpacity>
                
                {jobs.length === 0 ? (
                    <View style={{ 
                        backgroundColor: colors.white, 
                        padding: 40, 
                        borderRadius: 12, 
                        alignItems: 'center',
                        marginTop: 20
                    }}>
                        <Text style={{ fontSize: 50, marginBottom: 10 }}>🔍</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                            No jobs available
                        </Text>
                        <Text style={{ textAlign: 'center', color: colors.darkGray }}>
                            Check back later for new opportunities
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
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
                                {job.title}
                            </Text>
                            <Text style={{ color: colors.darkGray, fontSize: 12, marginBottom: 5 }}>
                                {job.category} • ₱{job.budget}
                            </Text>
                            <Text style={{ marginVertical: 5 }} numberOfLines={2}>
                                {job.description}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.info, marginBottom: 10 }}>
                                👤 Client: {job.clientName || 'Verified Client'}
                            </Text>
                            
                            <TouchableOpacity 
                                style={{ 
                                    backgroundColor: user?.is_verified ? colors.primary : colors.darkGray, 
                                    padding: 12, 
                                    borderRadius: 10, 
                                    alignItems: 'center'
                                }}
                                onPress={() => applyForJob(job)}
                                disabled={!user?.is_verified}
                            >
                                <Text style={{ color: colors.white, fontWeight: 'bold' }}>
                                    {user?.is_verified ? 'Apply Now' : 'Verify to Apply'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}