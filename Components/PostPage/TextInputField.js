import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const TextInputField = ({ label, ...props }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

const styles = StyleSheet.create({
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    marginBottom: 16,
  },
});

export default TextInputField;
