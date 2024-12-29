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
        <Text style={styles.price}>
          Starting Price: ₱{auction.starting_price?.toLocaleString()}
        </Text>
        <Text style={styles.date}>
          Ends on: {new Date(auction.auction_end).toLocaleDateString()}
        </Text>
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
    padding: 16,
    alignItems: 'center',
    gap: 16,
    height: 140, // Increased card height
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-around',
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 13, // Lower font size for starting price
    fontWeight: '400',
    color: '#4A5568',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default AuctionCard;
