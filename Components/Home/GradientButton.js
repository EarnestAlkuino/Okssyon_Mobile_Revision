import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GradientButton = ({ text, onPress }) => (
  <LinearGradient colors={['#257446', '#234D35']} style={styles.button}>
    <TouchableOpacity style={styles.fullWidthButton} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  fullWidthButton: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default GradientButton;
