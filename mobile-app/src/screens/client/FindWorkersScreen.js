import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';

export default function FindWorkersScreen({ token, userLocation, navigation }) {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const API_URL = 'http://192.168.68.150:5000/api';

    const searchWorkers = async () => {
        setLoading(true);
        try {
            const storedToken = await AsyncStorage.getItem('token');
            console.log('Fetching nearby workers...');
            
            const response = await fetch(`${API_URL}/nearby-workers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`
                }
            });
            
            const data = await response.json();
            console.log('Workers response:', data);
            
            if (Array.isArray(data)) {
                setWorkers(data);
            } else {
                setWorkers([]);
                if (data.error) {
                    Alert.alert('Error', data.error);
                }
            }
            setSearched(true);
        } catch (err) {
            console.log('Search workers error:', err);
            Alert.alert('Error', 'Failed to fetch nearby workers. Please check your connection.');
            setWorkers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await searchWorkers();
    };

    const contactWorker = (worker) => {
        Alert.alert(
            'Contact Worker',
            `Would you like to contact ${worker.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => Alert.alert('Call', `Calling ${worker.name}...`) },
                { text: 'Message', onPress: () => Alert.alert('Message', `Messaging ${worker.name}...`) }
            ]
        );
    };

    const getDistanceColor = (distance) => {
        if (!distance) return colors.darkGray;
        if (distance < 5) return '#22C55E';
        if (distance < 10) return '#F59E0B';
        return '#EF4444';
    };

    const getStars = (rating) => {
        if (!rating || rating === 0) return '⭐ New';
        const stars = '⭐'.repeat(Math.floor(rating));
        return stars + ` ${rating}`;
    };

    return (
        <ScrollView 
            style={{ flex: 1, backgroundColor: colors.gray }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                    Find Nearby Workers
                </Text>
                <Text style={{ fontSize: 14, color: colors.darkGray, marginBottom: 20 }}>
                    Search for verified workers in your area
                </Text>
                
                <TouchableOpacity 
                    style={{ 
                        backgroundColor: colors.primary, 
                        padding: 15, 
                        borderRadius: 12, 
                        alignItems: 'center',
                        marginBottom: 20,
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}
                    onPress={searchWorkers}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Text style={{ fontSize: 20, marginRight: 8 }}>🔍</Text>
                            <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>
                                Search Workers Near Me
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
                
                {searched && !loading && (
                    <>
                        {workers.length === 0 ? (
                            <View style={{ 
                                backgroundColor: colors.white, 
                                padding: 40, 
                                borderRadius: 12, 
                                alignItems: 'center',
                                marginTop: 20
                            }}>
                                <Text style={{ fontSize: 50, marginBottom: 10 }}>👷</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                                    No workers found
                                </Text>
                                <Text style={{ textAlign: 'center', color: colors.darkGray }}>
                                    No verified workers are currently available in your area.
                                    {'\n'}Try expanding your search radius or check back later.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary }}>
                                        Found {workers.length} worker(s) nearby
                                    </Text>
                                    <TouchableOpacity onPress={searchWorkers}>
                                        <Text style={{ color: colors.info }}>🔄 Refresh</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                {workers.map(worker => (
                                    <View key={worker.id} style={{ 
                                        backgroundColor: colors.white, 
                                        borderRadius: 12, 
                                        padding: 15, 
                                        marginBottom: 15,
                                        elevation: 2,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 2
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: 30,
                                                backgroundColor: colors.gray,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{ fontSize: 30 }}>👤</Text>
                                            </View>
                                            
                                            <View style={{ marginLeft: 12, flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
                                                        {worker.name}
                                                    </Text>
                                                    {worker.distance && (
                                                        <View style={{ 
                                                            backgroundColor: getDistanceColor(worker.distance) + '20',
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 4,
                                                            borderRadius: 15
                                                        }}>
                                                            <Text style={{ color: getDistanceColor(worker.distance), fontSize: 11, fontWeight: 'bold' }}>
                                                                📍 {worker.distance} km
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                
                                                <Text style={{ fontSize: 12, color: colors.darkGray, marginTop: 2 }}>
                                                    {getStars(worker.rating)}
                                                </Text>
                                                
                                                {worker.phone && (
                                                    <Text style={{ fontSize: 12, color: colors.info, marginTop: 2 }}>
                                                        📞 {worker.phone}
                                                    </Text>
                                                )}
                                                
                                                {worker.address && (
                                                    <Text style={{ fontSize: 11, color: colors.darkGray, marginTop: 2 }} numberOfLines={1}>
                                                        📍 {worker.address}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        
                                        <View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
                                            <TouchableOpacity 
                                                style={{ flex: 1, backgroundColor: colors.info, padding: 10, borderRadius: 8, alignItems: 'center' }}
                                                onPress={() => contactWorker(worker)}
                                            >
                                                <Text style={{ color: colors.white, fontWeight: 'bold' }}>📞 Contact</Text>
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity 
                                                style={{ flex: 1, backgroundColor: colors.primary, padding: 10, borderRadius: 8, alignItems: 'center' }}
                                                onPress={() => Alert.alert('View Profile', `View ${worker.name}'s full profile`)}
                                            >
                                                <Text style={{ color: colors.white, fontWeight: 'bold' }}>👤 View Profile</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}
                
                {!searched && !loading && (
                    <View style={{ 
                        backgroundColor: colors.white, 
                        padding: 40, 
                        borderRadius: 12, 
                        alignItems: 'center',
                        marginTop: 20
                    }}>
                        <Text style={{ fontSize: 50, marginBottom: 10 }}>📍</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                            Search for Workers
                        </Text>
                        <Text style={{ textAlign: 'center', color: colors.darkGray }}>
                            Tap the "Search Workers Near Me" button to find verified workers in your area.
                            {'\n'}Workers are sorted by distance from your location.
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}