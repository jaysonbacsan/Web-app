import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

export default function TabBar({ currentTab, onTabChange }) {
    return (
        <View style={{ flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#ddd', paddingVertical: 10 }}>
            <TouchableOpacity 
                style={{ flex: 1, alignItems: 'center', padding: 10 }}
                onPress={() => onTabChange('home')}
            >
                <Text style={{ fontSize: 24 }}>🏠</Text>
                <Text style={{ fontSize: 12, color: currentTab === 'home' ? colors.primary : colors.darkGray }}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={{ flex: 1, alignItems: 'center', padding: 10 }}
                onPress={() => onTabChange('profile')}
            >
                <Text style={{ fontSize: 24 }}>👤</Text>
                <Text style={{ fontSize: 12, color: currentTab === 'profile' ? colors.primary : colors.darkGray }}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
}
