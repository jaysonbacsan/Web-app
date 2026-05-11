import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import UpdateManager from './src/components/UpdateManager';
import LocationPermissionScreen from './src/screens/LocationPermissionScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerificationScreen from './src/screens/shared/VerificationScreen';

// Client Screens
import ClientDashboard from './src/screens/client/ClientDashboard';
import ClientProfileScreen from './src/screens/client/ClientProfileScreen';
import PostJobScreen from './src/screens/client/PostJobScreen';
import FindWorkersScreen from './src/screens/client/FindWorkersScreen';
import MyJobsScreen from './src/screens/client/MyJobsScreen';
import JobApplicationsScreen from './src/screens/client/JobApplicationsScreen';
import ClientWorkerProfileScreen from './src/screens/client/WorkerProfileScreen';

// Worker Screens
import WorkerDashboard from './src/screens/worker/WorkerDashboard';
import WorkerProfileScreen from './src/screens/worker/WorkerProfileScreen';
import AvailableJobsScreen from './src/screens/worker/AvailableJobsScreen';
import ResumeScreen from './src/screens/worker/ResumeScreen';
import ApplyForJobScreen from './src/screens/worker/ApplyForJobScreen';
import MyApplicationsScreen from './src/screens/worker/MyApplicationsScreen';

import colors from './src/constants/colors';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [hasLocation, setHasLocation] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('location');
    const [showLogin, setShowLogin] = useState(true);
    const [routeParams, setRouteParams] = useState({});

    const API_URL = 'http://192.168.68.150:5000/api';

    useEffect(() => {
        checkUserAndLocation();
    }, []);

    const checkUserAndLocation = async () => {
        try {
            const savedToken = await AsyncStorage.getItem('token');
            const savedUser = await AsyncStorage.getItem('user');
            
            const { status } = await Location.getForegroundPermissionsAsync();
            
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                setUserLocation(location.coords);
                setHasLocation(true);
                
                if (savedToken && savedUser) {
                    await fetch(`${API_URL}/update-location`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${savedToken}`
                        },
                        body: JSON.stringify({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        })
                    });
                }
            } else {
                setHasLocation(false);
            }
            
            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                if (hasLocation) {
                    setCurrentScreen('dashboard');
                } else {
                    setCurrentScreen('location');
                }
            } else {
                setCurrentScreen('login');
            }
        } catch (error) {
            console.log('Error:', error);
            setCurrentScreen('location');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationGranted = async (coords) => {
        setUserLocation(coords);
        setHasLocation(true);
        
        if (token && user) {
            await fetch(`${API_URL}/update-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    latitude: coords.latitude,
                    longitude: coords.longitude
                })
            });
            setCurrentScreen('dashboard');
        } else {
            setCurrentScreen('login');
        }
    };

    const handleLogin = async (newToken, newUser) => {
        await AsyncStorage.setItem('token', newToken);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        
        if (hasLocation && userLocation) {
            await fetch(`${API_URL}/update-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newToken}`
                },
                body: JSON.stringify({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude
                })
            });
        }
        
        setCurrentScreen('dashboard');
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setCurrentScreen('login');
    };

    const navigateTo = (screen, params = {}) => {
        setRouteParams(params);
        setCurrentScreen(screen);
    };

    const renderScreen = () => {
        if (currentScreen === 'location' || !hasLocation) {
            return <LocationPermissionScreen onLocationGranted={handleLocationGranted} />;
        }

        if (currentScreen === 'login') {
            return showLogin ? (
                <LoginScreen 
                    onLogin={handleLogin} 
                    onSwitchToRegister={() => setShowLogin(false)} 
                />
            ) : (
                <RegisterScreen 
                    onSwitchToLogin={() => setShowLogin(true)} 
                />
            );
        }

        if (currentScreen === 'dashboard') {
            if (user?.role === 'client') {
                return (
                    <ClientDashboard 
                        user={user} 
                        onLogout={handleLogout} 
                        navigation={{ navigate: navigateTo }}
                        userLocation={userLocation}
                    />
                );
            } else {
                return (
                    <WorkerDashboard 
                        user={user} 
                        onLogout={handleLogout} 
                        navigation={{ navigate: navigateTo }}
                        userLocation={userLocation}
                    />
                );
            }
        }

        if (currentScreen === 'profile') {
            if (user?.role === 'client') {
                return (
                    <ClientProfileScreen 
                        user={user} 
                        onLogout={handleLogout} 
                        navigation={{ navigate: navigateTo }}
                    />
                );
            } else {
                return (
                    <WorkerProfileScreen 
                        user={user} 
                        onLogout={handleLogout} 
                        navigation={{ navigate: navigateTo }}
                    />
                );
            }
        }

        if (currentScreen === 'WorkerProfile') {
            return (
                <ClientWorkerProfileScreen 
                    route={routeParams}
                    navigation={{ goBack: () => setCurrentScreen('jobApplications'), navigate: navigateTo }}
                />
            );
        }

        if (currentScreen === 'verification') {
            return (
                <VerificationScreen 
                    token={token} 
                    user={user} 
                    navigation={{ goBack: () => setCurrentScreen('profile') }} 
                />
            );
        }

        if (currentScreen === 'postJob') {
            return (
                <PostJobScreen 
                    token={token} 
                    user={user} 
                    navigation={{ goBack: () => setCurrentScreen('dashboard') }} 
                />
            );
        }

        if (currentScreen === 'findWorkers') {
            return (
                <FindWorkersScreen 
                    token={token} 
                    userLocation={userLocation}
                    navigation={{ goBack: () => setCurrentScreen('dashboard') }} 
                />
            );
        }

        if (currentScreen === 'myJobs') {
            return (
                <MyJobsScreen 
                    token={token} 
                    navigation={{ navigate: navigateTo }}
                />
            );
        }

        if (currentScreen === 'jobApplications') {
            return (
                <JobApplicationsScreen 
                    route={routeParams}
                    navigation={{ navigate: navigateTo, goBack: () => setCurrentScreen('myJobs') }} 
                />
            );
        }

        if (currentScreen === 'availableJobs') {
            return (
                <AvailableJobsScreen 
                    token={token} 
                    user={user}
                    userLocation={userLocation}
                    navigation={{ navigate: navigateTo }}
                />
            );
        }

        if (currentScreen === 'applyForJob') {
            return (
                <ApplyForJobScreen 
                    route={routeParams}
                    user={user}
                    navigation={{ 
                        navigate: navigateTo,
                        goBack: () => setCurrentScreen('availableJobs') 
                    }} 
                />
            );
        }

        if (currentScreen === 'resume') {
            return (
                <ResumeScreen 
                    token={token} 
                    navigation={{ goBack: () => setCurrentScreen('dashboard') }} 
                />
            );
        }

        // ADDED: My Applications Screen for Workers
        if (currentScreen === 'myApplications') {
            return (
                <MyApplicationsScreen 
                    navigation={{ goBack: () => setCurrentScreen('dashboard') }}
                />
            );
        }

        return <LocationPermissionScreen onLocationGranted={handleLocationGranted} />;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <>
            <UpdateManager />
            {renderScreen()}
        </>
    );
}