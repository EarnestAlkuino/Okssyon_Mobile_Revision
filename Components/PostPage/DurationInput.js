import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const DurationInput = ({ label, value, setValue }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value.days}
        onChangeText={(text) => setValue({ ...value, days: text.replace(/[^0-9]/g, '') })}
        placeholder="Days"
        keyboardType="numeric"
      />
      <Text>:</Text>
      <TextInput
        style={styles.input}
        value={value.hours}
        onChangeText={(text) => setValue({ ...value, hours: text.replace(/[^0-9]/g, '') })}
        placeholder="Hours"
        keyboardType="numeric"
      />
      <Text>:</Text>
      <TextInput
        style={styles.input}
        value={value.minutes}
        onChangeText={(text) => setValue({ ...value, minutes: text.replace(/[^0-9]/g, '') })}
        placeholder="Minutes"
        keyboardType="numeric"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  label: { fontSize: 16, marginBottom: 8 },
  container: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  input: {
    height: 40,
    width: '30%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
  },
});

export default DurationInput;
