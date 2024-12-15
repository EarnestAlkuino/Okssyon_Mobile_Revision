// // components/DurationInput.js
// import React from 'react';
// import { View, Text, TextInput, StyleSheet } from 'react-native';

// const DurationInput = ({ auctionDuration, setAuctionDuration }) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Auction Duration (Days:Hours:Minutes)</Text>
//       <View style={styles.durationContainer}>
//         <TextInput
//           style={[styles.input, styles.durationInput]}
//           value={auctionDuration.days}
//           onChangeText={(text) => setAuctionDuration({ ...auctionDuration, days: text.replace(/[^0-9]/g, '') })}
//           placeholder="Days"
//           keyboardType="numeric"
//         />
//         <Text>:</Text>
//         <TextInput
//           style={[styles.input, styles.durationInput]}
//           value={auctionDuration.hours}
//           onChangeText={(text) => setAuctionDuration({ ...auctionDuration, hours: text.replace(/[^0-9]/g, '') })}
//           placeholder="Hours"
//           keyboardType="numeric"
//         />
//         <Text>:</Text>
//         <TextInput
//           style={[styles.input, styles.durationInput]}
//           value={auctionDuration.minutes}
//           onChangeText={(text) => setAuctionDuration({ ...auctionDuration, minutes: text.replace(/[^0-9]/g, '') })}
//           placeholder="Minutes"
//           keyboardType="numeric"
//         />
//       </View>
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
//   durationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingLeft: 8,
//   },
//   durationInput: {
//     width: '32%',
//   },
// });

// export default DurationInput;
