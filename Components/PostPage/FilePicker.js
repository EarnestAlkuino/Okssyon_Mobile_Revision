import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import uploadFileToSupabase from '../../utils/uploadFileToSupabase'; // Import the backend upload logic

const FilePicker = ({ label, file, setFile, isImage = false }) => {
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    try {
      setUploading(true);
      if (isImage) {
        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
  
        if (!result.canceled && result.assets.length > 0) {
          const uri = result.assets[0].uri;
          const fileName = `image-${Date.now()}.jpg`;
          const uploadedUrl = await uploadFileToSupabase(uri, fileName);
          setFile(uploadedUrl);
        } else {
          Alert.alert('Cancelled', 'No image was selected.');
        }
      } else {
        // Launch document picker
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        console.log('DocumentPicker Result:', result); // Debug log
  
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const { uri, name } = result.assets[0];
          console.log('Document selected URI:', uri, 'Name:', name); // Debug log
          const fileName = name || `document-${Date.now()}.pdf`;
          const uploadedUrl = await uploadFileToSupabase(uri, fileName);
          setFile(uploadedUrl);
        } else if (result.canceled) {
          Alert.alert('Cancelled', 'No document was selected.');
        } else {
          Alert.alert('Error', 'Invalid document selection.');
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to upload the file. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.button, uploading && styles.disabledButton]} onPress={pickFile} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isImage ? 'Pick Image' : 'Pick Document'}</Text>}
      </TouchableOpacity>
      {file && (
        <View style={styles.previewContainer}>
          {isImage ? (
            <Image source={{ uri: file }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.fileText}>{file.split('/').pop()}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#6FA3D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
    marginTop: 8,
  },
  fileText: {
    color: '#4A5568',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    wordBreak: 'break-word',
  },
});

export default FilePicker;
