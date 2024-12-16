// Components/LivestockAuctionDetailPage/SellerInfo.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SellerInfo = ({ sellerName, location, profileImage }) => {
  return (
    <View style={styles.sellerSection}>
      <View style={styles.sellerContainer}>
        <Image
          source={{
            uri: profileImage || 'https://via.placeholder.com/50',
          }}
          style={styles.sellerImage}
        />
        <View>
          <View style={styles.verifiedRow}>
            <Text style={styles.sellerName}>{sellerName || 'Unknown Seller'}</Text>
            <Icon name="check-circle" size={18} color="#1E7848" style={styles.verifiedIconSpacing} />
          </View>
          <Text style={styles.sellerInfo}>Verified Seller</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sellerSection: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  verifiedIconSpacing: {
    marginLeft: 5,
  },
  sellerInfo: {
    fontSize: 14,
    color: '#6C6C6C',
  },
  locationText: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
});

export default SellerInfo;
