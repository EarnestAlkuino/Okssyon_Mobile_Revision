import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const AuctionCard = ({ auction, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(auction)}>
      <Image source={{ uri: auction.image }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {auction.title || 'Auction Title'}
        </Text>
        <Text style={styles.status}>{auction.status || 'Status'}</Text>
        <Text style={styles.price}>Starting Price: ₱{auction.starting_price?.toLocaleString()}</Text>
        <Text style={styles.date}>Ends on: {new Date(auction.auction_end).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#405E40',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default AuctionCard;
