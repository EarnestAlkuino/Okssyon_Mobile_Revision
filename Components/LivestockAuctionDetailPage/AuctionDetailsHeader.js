import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const AuctionDetailsHeader = ({ title, onBackPress }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
        <Icon name="arrow-back" size={24} color="#2C3E50" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iconButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

export default AuctionDetailsHeader;
