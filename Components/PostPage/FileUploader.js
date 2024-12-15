// // components/FileUploader.js
// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';

// const FileUploader = ({ label, onPick, fileType }) => {
//   const pickFile = async () => {
//     try {
//       if (fileType === 'image') {
//         const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (!permissionResult.granted) {
//           alert('Permission to access media library is required!');
//           return;
//         }
//         const result = await ImagePicker.launchImageLibraryAsync({
//           mediaTypes: ImagePicker.MediaTypeOptions.Images,
//           allowsEditing: true,
//           aspect: [4, 3],
//           quality: 1,
//         });

//         if (!result.canceled && result.assets.length > 0) {
//           onPick(result.assets[0].uri);
//         }
//       } else if (fileType === 'document') {
//         const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
//         if (result.type !== 'cancel') {
//           onPick(result.uri);
//         }
//       }
//     } catch (error) {
//       alert(`Failed to pick a ${fileType}`);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>{label}</Text>
//       <TouchableOpacity style={styles.button} onPress={pickFile}>
//         <Text style={styles.buttonText}>Pick {fileType === 'image' ? 'Image' : 'Document'}</Text>
//       </TouchableOpacity>
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
//   button: {
//     backgroundColor: '#3498db',
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     textAlign: 'center',
//   },
// });

// export default FileUploader;
