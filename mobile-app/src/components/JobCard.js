import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

export default function JobCard({ job, showButton = false, buttonText = '', onPress }) {
    return (
        <View style={{ backgroundColor: colors.white, padding: 15, borderRadius: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary }}>{job.title}</Text>
            <Text>{job.description}</Text>
            <Text>💰 ₱{job.budget}</Text>
            <Text>📌 Status: {job.status}</Text>
            {job.clientName && <Text>👤 Client: {job.clientName}</Text>}
            {showButton && (
                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 }}
                    onPress={onPress}
                >
                    <Text style={{ color: colors.white, fontWeight: 'bold' }}>{buttonText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
