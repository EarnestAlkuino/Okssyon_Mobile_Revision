import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';  
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; // Importing Ionicons

const PostPage = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('female');
  const [image, setImage] = useState(null);
  const [proofOfOwnership, setProofOfOwnership] = useState(null);
  const [vetCertificate, setVetCertificate] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const pickDocument = async (setDocument) => {
    let result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.type === 'success') {
      setDocument(result);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Livestock Upload Form</Text>
      </TouchableOpacity>

      {/* Image Upload */}
      <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.iconTextContainer}>
            <Ionicons name="image-outline" size={40} color="#fff" />
            <Text style={styles.uploadText}>Upload Photos</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Category Picker */}
      <View style={styles.inputContainer}>
        <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)} style={styles.picker}>
          <Picker.Item label="Category" value="" />
          <Picker.Item label="Cattle" value="Cattle" />
          <Picker.Item label="Horse" value="Horse" />
          <Picker.Item label="Carabao" value="Carabao" />
          <Picker.Item label="Pig" value="Pig" />
          <Picker.Item label="Sheep" value="Sheep" />
          <Picker.Item label="Goat" value="Goat" />
        </Picker>
      </View>

      {/* Proof of Ownership Upload */}
      <TouchableOpacity onPress={() => pickDocument(setProofOfOwnership)} style={[styles.documentUploadButton, styles.outline]}>
        <View style={styles.iconTextContainer}>
          <Ionicons name="document-outline" size={24} color="#888" />
          <Text style={styles.uploadText}>Proof of Ownership</Text>
        </View>
      </TouchableOpacity>

      {/* Vet Certificate Upload */}
      <TouchableOpacity onPress={() => pickDocument(setVetCertificate)} style={[styles.documentUploadButton, styles.outline]}>
        <View style={styles.iconTextContainer}>
          <Ionicons name="document-text-outline" size={24} color="#888" />
          <Text style={styles.uploadText}>Vet Certificate</Text>
        </View>
      </TouchableOpacity>

      {/* Breed and Age */}
      <View style={styles.doubleInputContainer}>
        <TextInput placeholder="Breed" style={styles.doubleInput} />
        <TextInput placeholder="Age" style={styles.doubleInput} keyboardType="numeric" />
      </View>

      {/* Gender Picker */}
      <View style={styles.inputContainer}>
        <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)} style={styles.picker}>
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Male" value="male" />
        </Picker>
      </View>

      {/* Weight Input */}
      <TextInput placeholder="Weight" style={styles.input} keyboardType="numeric" />

      {/* Starting Price Input */}
      <TextInput placeholder="Starting Price" style={styles.input} keyboardType="numeric" />

      {/* Auction Date Input */}
      <TextInput placeholder="Date and time auction will end" style={styles.input} />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButtonGreen}>
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={24} color="#888" />
        <Ionicons name="chatbubble-outline" size={24} color="#888" />
        <Ionicons name="add-circle" size={40} color="#335441" />
        <Ionicons name="notifications-outline" size={24} color="#888" />
        <Ionicons name="person-outline" size={24} color="#888" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#335441',
    padding: 10,
    borderRadius: 5,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  uploadButton: {
    width: '100%',
    height: 200,
    backgroundColor: '#888', // Gray background for the button
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20, // Space between fields
  },
  uploadText: {
    fontSize: 16,
    color: '#fff', // White text inside the button
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
  inputContainer: {
    marginBottom: 15,
  },
  doubleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  doubleInput: {
    width: '48%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15, // Space between fields
  },
  picker: {
    width: '100%',
    height: 40,
  },
  documentUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 15, // Space between fields
  },
  outline: {
    borderColor: '#335441', // Outline for "Proof of Ownership" and "Vet Certificate"
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    width: '48%',
    borderColor: '#335441',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#335441',
    fontSize: 16,
  },
  uploadButtonGreen: {
    width: '48%',
    backgroundColor: '#335441',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingVertical: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default PostPage;
