import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const SubmitButton = ({ text, onPress, loading }) => (
  <TouchableOpacity style={styles.button} onPress={onPress} disabled={loading}>
    <Text style={styles.text}>{loading ? 'Submitting...' : text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 5, marginTop: 20, alignItems: 'center' },
  text: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

export default SubmitButton;
