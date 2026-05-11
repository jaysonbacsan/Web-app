import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function ClientProfileScreen({ user, onLogout, navigation }) {
    return (
        <View style={{ flex: 1, backgroundColor: colors.gray }}>
            <View style={{ backgroundColor: colors.primary, padding: 30, alignItems: 'center' }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 40 }}>👤</Text>
                </View>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.white }}>{user.name}</Text>
                <View style={{ marginTop: 10 }}>
                    <VerifiedBadge isVerified={user.isVerified} verificationStatus={user.verificationStatus} />
                </View>
            </View>

            <View style={{ padding: 20 }}>
                <View style={{ backgroundColor: colors.white, borderRadius: 10, padding: 15 }}>
                    <Text><Text style={{ fontWeight: 'bold' }}>Email:</Text> {user.email}</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Role:</Text> 🏢 Client</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Status:</Text> {user.isVerified ? '✅ Verified' : '⏳ Pending Verification'}</Text>
                </View>

                {!user.isVerified && (
                    <TouchableOpacity 
                        style={{ backgroundColor: colors.info, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 }}
                        onPress={() => navigation.navigate('verification')}
                    >
                        <Text style={{ color: colors.white, fontWeight: 'bold' }}>📋 Submit Verification Documents</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 }}
                    onPress={() => navigation.navigate('dashboard')}
                >
                    <Text style={{ color: colors.white, fontWeight: 'bold' }}>← Back to Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onLogout} style={{ backgroundColor: colors.danger, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ color: colors.white, fontWeight: 'bold' }}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
