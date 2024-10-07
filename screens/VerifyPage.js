import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const ImagePickerComponent = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to pick image from the gallery
  const pickImage = async () => {
    // Request permission to access the media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access media library is required!', [
        { text: 'OK' }
      ]);
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // If the user didn't cancel the picker
    if (!result.canceled) {
      setSelectedImage(result.uri);
    } else {
      console.log('Image picking canceled');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select an Image</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.iconTextContainer}>
            <Ionicons name="image-outline" size={24} color="#888" />
            <Text style={styles.uploadText}>Pick an Image</Text>
          </View>
        )}
      </TouchableOpacity>

      {selectedImage && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Image selected successfully!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  imagePickerButton: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 10,
  },
  infoContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 5,
  },
  infoText: {
    color: '#155724',
    fontSize: 16,
  },
});

export default ImagePickerComponent;
