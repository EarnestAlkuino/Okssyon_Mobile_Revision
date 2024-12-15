// // components/PickerField.js
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { Picker } from '@react-native-picker/picker';

// const PickerField = ({ label, selectedValue, onValueChange, options }) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>{label}</Text>
//       <Picker
//         selectedValue={selectedValue}
//         onValueChange={onValueChange}
//         style={styles.picker}
//       >
//         {options.map((option, index) => (
//           <Picker.Item key={index} label={option.label} value={option.value} />
//         ))}
//       </Picker>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//   },
// });

// export default PickerField;
