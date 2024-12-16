import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ItemDetails = ({ item }) => (
  <View style={styles.infoContainer}>
    <View style={styles.infoRow}>
      <Icon name="map-marker-outline" size={15} color="#4A5568" />
      <Text style={styles.infoLabel}>Location</Text>
      <Text style={styles.infoValue}>- {item.location || 'Not specified'}</Text>
    </View>
    <View style={styles.infoRow}>
      <Icon name="calendar-outline" size={15} color="#4A5568" />
      <Text style={styles.infoLabel}>Age</Text>
      <Text style={styles.infoValue}>- {item.age ? `${item.age} years old` : 'Not specified'}</Text>
    </View>
    <View style={styles.infoRow}>
      <Icon name="scale-bathroom" size={15} color="#4A5568" />
      <Text style={styles.infoLabel}>Weight</Text>
      <Text style={styles.infoValue}>- {item.weight} kg</Text>
      <Icon name="gender-male-female" size={15} color="#4A5568" style={styles.iconSpacing} />
      <Text style={styles.infoLabel}>Gender</Text>
      <Text style={styles.infoValue}>- {item.gender || 'Not specified'}</Text>
    </View>
    <View style={styles.verificationsContainer}>
      <View style={styles.verificationItem}>
        <Text style={styles.verificationText}>
          Proof of Ownership <Icon name="check-circle" size={13} color="#1E7848" />
        </Text>
      </View>
      <View style={styles.verificationItem}>
        <Text style={styles.verificationText}>
          Vet Certificate <Icon name="check-circle" size={13} color="#1E7848" />
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  infoContainer: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconSpacing: { marginLeft: 35 },
  infoLabel: { fontSize: 14, fontWeight: '500', color: '#4A5568', marginLeft: 8 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#4A5568', marginLeft: 4 },
  verificationsContainer: { flexDirection: 'row', marginVertical: 1 },
  verificationItem: {
    borderWidth: 1,
    borderColor: '#1E7848',
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  verificationText: { fontSize: 12, color: '#2C3E50' },
});

export default ItemDetails;
