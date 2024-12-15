import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PriceDetails = ({ item, latestBid }) => (
  <View style={styles.priceSection}>
    <View style={styles.priceContainer}>
      <Text style={styles.priceLabel}>Starting Price</Text>
      <Text style={styles.priceText}>₱{item.starting_price?.toLocaleString()}</Text>
    </View>
    <View style={styles.priceContainer}>
      <Text style={styles.priceLabel}>Latest Bid</Text>
      <Text style={styles.priceText}>
        ₱{latestBid?.toLocaleString() || 'No bids yet'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  priceSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  priceContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  priceLabel: { fontSize: 14, color: '#6C6C6C' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#1E7848', marginTop: 5 },
});

export default PriceDetails;
