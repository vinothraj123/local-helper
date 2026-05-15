import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import axios from "../axios";

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);

    const PRIMARY_PURPLE = '#9155FD';

    useEffect(() => {
        fetchReport();
    }, [startDate, endDate]); // தேதி மாறும்போது தானாக Fetch செய்யும்

    const fetchReport = async () => {
        setLoading(true);
        try {
            const sDate = startDate.toISOString().split('T')[0];
            const eDate = endDate.toISOString().split('T')[0];
            const res = await axios.get(`report/?start_date=${sDate}&end_date=${eDate}`);
            setReport(res.data.data);
        } catch (error) {
            console.error("Report Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Business Report</Text>
                
                {/* Date Selection Row */}
                <View style={styles.filterRow}>
                    <TouchableOpacity onPress={() => setShowStart(true)} style={styles.dateBtn}>
                        <Text style={styles.dateLabel}>From:</Text>
                        <Text style={styles.dateValue}>{startDate.toLocaleDateString('en-GB')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowEnd(true)} style={styles.dateBtn}>
                        <Text style={styles.dateLabel}>To:</Text>
                        <Text style={styles.dateValue}>{endDate.toLocaleDateString('en-GB')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showStart && (
                <DateTimePicker 
                    value={startDate} mode="date" 
                    onChange={(e, d) => { setShowStart(false); if(d) setStartDate(d); }} 
                />
            )}
            {showEnd && (
                <DateTimePicker 
                    value={endDate} mode="date" 
                    onChange={(e, d) => { setShowEnd(false); if(d) setEndDate(d); }} 
                />
            )}

            {loading ? (
                <ActivityIndicator size="large" color={PRIMARY_PURPLE} style={{marginTop: 50}} />
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Total Disbursed</Text>
                        <Text style={[styles.cardValue, {color: '#ef4444'}]}>₹{report?.total_disbursed.toLocaleString('en-IN')}</Text>
                        <Text style={styles.subDetail}>New Loans Count: {report?.new_loans_count}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Total Collected</Text>
                        <Text style={[styles.cardValue, {color: '#10b981'}]}>₹{report?.total_collected.toLocaleString('en-IN')}</Text>
                    </View>

                    {/* <View style={[styles.card, {backgroundColor: report?.net_flow >= 0 ? '#F0FDF4' : '#FEF2F2'}]}>
                        <Text style={styles.cardLabel}>Net Cash Flow</Text>
                        <Text style={[styles.cardValue, {color: report?.net_flow >= 0 ? '#16a34a' : '#dc2626'}]}>
                            ₹{report?.net_flow.toLocaleString('en-IN')}
                        </Text>
                    </View> */}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5FA' },
    header: { backgroundColor: '#9155FD', padding: 20, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    filterRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dateBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, width: '48%' },
    dateLabel: { color: '#E0E0E0', fontSize: 10, fontWeight: 'bold' },
    dateValue: { color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
    content: { padding: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 2 },
    cardLabel: { fontSize: 13, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
    cardValue: { fontSize: 24, fontWeight: '900', marginTop: 8 },
    subDetail: { fontSize: 12, color: '#94a3b8', marginTop: 5 }
});