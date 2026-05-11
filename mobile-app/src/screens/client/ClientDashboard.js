import React, { useState, useEffect } from 'react';
import { 
    View, Text, TouchableOpacity, ScrollView, 
    Alert, RefreshControl, Image 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';
import VerifiedBadge from '../../components/VerifiedBadge';
import NotificationBell from '../../components/NotificationBell';  // ADD THIS

export default function ClientDashboard({ user, onLogout, navigation }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        fetchMyJobs();
        fetchProfileImage();
    }, []);

    const fetchProfileImage = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.profile_image) {
                setProfileImage(`http://192.168.68.150:5000${data.profile_image}`);
            }
        } catch (err) {
            console.log('Error fetching profile image:', err);
        }
    };

    const fetchMyJobs = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/jobs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMyJobs();
        await fetchProfileImage();
        setRefreshing(false);
    };

    const menuItems = [
        { 
            id: 'postJob', 
            title: 'Post a Job', 
            icon: '📝', 
            color: colors.secondary,
            description: 'Create a new job posting',
            screen: 'postJob'
        },
        { 
            id: 'findWorkers', 
            title: 'Find Workers', 
            icon: '🔍', 
            color: colors.info,
            description: 'Search for nearby workers',
            screen: 'findWorkers'
        },
        { 
            id: 'myJobs', 
            title: 'My Jobs', 
            icon: '📋', 
            color: colors.warning,
            description: 'View your job postings',
            screen: 'myJobs'
        },
        { 
            id: 'profile', 
            title: 'My Profile', 
            icon: '👤', 
            color: colors.primary,
            description: 'View and edit profile',
            screen: 'profile'
        }
    ];

    const stats = [
        { label: 'Total Jobs', value: jobs.length, icon: '📋', color: colors.primary },
        { label: 'Open Jobs', value: jobs.filter(j => j.status === 'open').length, icon: '🟢', color: colors.secondary },
        { label: 'In Progress', value: jobs.filter(j => j.status === 'taken').length, icon: '🔄', color: colors.info },
        { label: 'Completed', value: jobs.filter(j => j.status === 'completed').length, icon: '✅', color: colors.verified }
    ];

    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: colors.gray }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header with Profile and Notification Bell */}
            <View style={{ backgroundColor: colors.primary, padding: 20, paddingBottom: 30 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('profile')}>
                            <View style={{
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                backgroundColor: colors.white,
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden'
                            }}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <Text style={{ fontSize: 30 }}>👤</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.white }}>
                                Welcome, {user.name}!
                            </Text>
                            <VerifiedBadge isVerified={user.is_verified} verificationStatus={user.verification_status} />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <NotificationBell navigation={navigation} />
                        <TouchableOpacity onPress={onLogout} style={{ backgroundColor: colors.danger, padding: 8, borderRadius: 8 }}>
                            <Text style={{ color: colors.white }}>🚪</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={{ padding: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>
                    📊 Your Stats
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {stats.map((stat, index) => (
                        <View key={index} style={{
                            width: '48%',
                            backgroundColor: colors.white,
                            borderRadius: 12,
                            padding: 15,
                            marginBottom: 10,
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            elevation: 3
                        }}>
                            <Text style={{ fontSize: 28 }}>{stat.icon}</Text>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: stat.color }}>{stat.value}</Text>
                            <Text style={{ fontSize: 12, color: colors.darkGray }}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Menu Grid */}
            <View style={{ padding: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>
                    🚀 Quick Actions
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={{
                                width: '48%',
                                backgroundColor: item.color,
                                borderRadius: 12,
                                padding: 20,
                                marginBottom: 10,
                                alignItems: 'center'
                            }}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <Text style={{ fontSize: 32 }}>{item.icon}</Text>
                            <Text style={{ color: colors.white, fontWeight: 'bold', marginTop: 10 }}>
                                {item.title}
                            </Text>
                            <Text style={{ color: colors.white, fontSize: 10, marginTop: 5, textAlign: 'center' }}>
                                {item.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recent Jobs */}
            <View style={{ padding: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>
                    📋 Recent Jobs
                </Text>
                {loading ? (
                    <Text style={{ textAlign: 'center', padding: 20 }}>Loading...</Text>
                ) : jobs.length === 0 ? (
                    <View style={{ backgroundColor: colors.white, padding: 30, borderRadius: 12, alignItems: 'center' }}>
                        <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
                        <Text style={{ textAlign: 'center', color: colors.darkGray }}>
                            No jobs posted yet. Tap "Post a Job" to get started!
                        </Text>
                    </View>
                ) : (
                    jobs.slice(0, 5).map(job => (
                        <View key={job.id} style={{
                            backgroundColor: colors.white,
                            borderRadius: 10,
                            padding: 15,
                            marginBottom: 10,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{job.title}</Text>
                                <Text style={{ color: colors.darkGray, fontSize: 12 }}>{job.category}</Text>
                                <Text style={{ color: colors.secondary, fontWeight: 'bold' }}>₱{job.budget}</Text>
                            </View>
                            <View style={{
                                backgroundColor: job.status === 'open' ? colors.secondary : colors.warning,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 20
                            }}>
                                <Text style={{ color: colors.white, fontSize: 12 }}>{job.status}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}