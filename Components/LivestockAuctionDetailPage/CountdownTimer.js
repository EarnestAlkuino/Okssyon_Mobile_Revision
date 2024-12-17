import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CountdownTimer = ({ timeRemaining }) => {
  return (
    <View style={styles.container}>
      <Icon name="clock-outline" size={20} color="#4A5568" style={styles.icon} />
      <Text style={styles.label}>Time Left:</Text>
      <Text style={styles.time}>{timeRemaining || 'Loading...'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Aligns everything to the right
    alignItems: 'center',
    marginVertical: 10,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53E3E', // Red color for the time
    marginLeft: 4,
  },
});

export default CountdownTimer;