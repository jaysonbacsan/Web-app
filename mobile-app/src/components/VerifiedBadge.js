import React from 'react';
import { View, Text } from 'react-native';
import colors from '../constants/colors';

export default function VerifiedBadge({ isVerified, verificationStatus }) {
    if (isVerified) {
        return (
            <View style={{ backgroundColor: '#22C55E', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, marginRight: 4 }}>✓</Text>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>VERIFIED</Text>
            </View>
        );
    }
    
    if (verificationStatus === 'pending') {
        return (
            <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>⏳ PENDING</Text>
            </View>
        );
    }
    
    if (verificationStatus === 'rejected') {
        return (
            <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>❌ REJECTED</Text>
            </View>
        );
    }
    
    return (
        <View style={{ backgroundColor: '#6B7280', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>⚠️ UNVERIFIED</Text>
        </View>
    );
}
