import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

const AuctionHeader = ({ title }) => {
  return (
    <View style={styles.header}>
      <StatusBar backgroundColor="#405e40" barStyle="light-content" />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#405e40',
    paddingHorizontal: 16,
    paddingVertical: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AuctionHeader;
