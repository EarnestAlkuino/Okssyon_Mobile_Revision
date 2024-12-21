import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CategoryPicker = ({ label, selectedValue, onValueChange, options }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.buttonGroup}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.button,
            selectedValue === option.value && styles.selectedButton,
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text
            style={[
              styles.buttonText,
              selectedValue === option.value && styles.selectedButtonText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

CategoryPicker.defaultProps = {
  options: [
    { label: 'Cattle', value: 'Cattle' },
    { label: 'Goat', value: 'Goat' },
    { label: 'Sheep', value: 'Sheep' },
    { label: 'Horse', value: 'Horse' },
    { label: 'Pig', value: 'Pig' },
    { label: 'Carabao', value: 'Carabao' },
  ],
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: '#405E40',
    borderColor: '#405E40',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  selectedButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CategoryPicker;
