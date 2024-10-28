import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import Header from '../Components/Header';

const PostPage = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('female');
  const [image, setImage] = useState(null);
  const [proofOfOwnership, setProofOfOwnership] = useState(null);
  const [vetCertificate, setVetCertificate] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [breedInput, setBreedInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [startingPriceInput, setStartingPriceInput] = useState('');
  const [location, setLocation] = useState('');

  // Function to pick an image
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

  // Function to pick documents
  const pickDocument = async (setDocument) => {
    let result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.type === 'success') {
      setDocument(result);
    }
  };

  // Function to upload files to Supabase storage
  const uploadFile = async (uri, bucketName, fileName) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob, { contentType: blob.type });

      if (error) throw error;
      return supabase.storage.from(bucketName).getPublicUrl(fileName).data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  // Function to handle the form submission
  const handleUpload = async () => {
    try {
      // Fetch user ID from Supabase session
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        Alert.alert("Error", "User not logged in. Please log in again.");
        return;
      }

      // Upload image
      const imageUrl = image ? await uploadFile(image, 'livestock-images', `image-${Date.now()}.jpg`) : null;
      
      // Upload proof of ownership
      const proofUrl = proofOfOwnership ? await uploadFile(proofOfOwnership.uri, 'livestock-documents', `proof-${Date.now()}.pdf`) : null;

      // Upload vet certificate
      const vetCertUrl = vetCertificate ? await uploadFile(vetCertificate.uri, 'livestock-documents', `vetcert-${Date.now()}.pdf`) : null;

      // Insert the record into Supabase with owner_id
      const { data, error } = await supabase
        .from('livestock')
        .insert([
          {
            category,
            breed: breedInput,
            age: ageInput ? parseInt(ageInput) : null,
            weight: weightInput ? parseFloat(weightInput) : null,
            starting_price: startingPriceInput ? parseFloat(startingPriceInput) : null,
            gender,
            auction_start_date: date.toISOString(),
            image_uri: imageUrl,
            proof_of_ownership_uri: proofUrl,
            vet_certificate_uri: vetCertUrl,
            location,
            owner_id: userId, // Set owner_id as userId
          },
        ]);

      if (error) throw error;
      Alert.alert("Success", "Livestock uploaded successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Date and time picker functions
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(false);
    setDate(currentTime);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Livestock Upload Form"
        showSettingsButton={false}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.iconTextContainer}>
                <Ionicons name="image-outline" size={40} color="#888" />
                <Text style={styles.uploadText}>Upload Photos</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="CATTLE" value="Cattle" />
              <Picker.Item label="HORSE" value="Horse" />
              <Picker.Item label="CARABAO" value="Carabao" />
              <Picker.Item label="PIG" value="Pig" />
              <Picker.Item label="SHEEP" value="Sheep" />
              <Picker.Item label="GOAT" value="Goat" />
            </Picker>
          </View>

          <TouchableOpacity onPress={() => pickDocument(setProofOfOwnership)} style={styles.documentUploadButton}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="document-outline" size={20} color="#888" />
              <Text style={styles.documentUploadText}>Proof of Ownership</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => pickDocument(setVetCertificate)} style={styles.documentUploadButton}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="document-text-outline" size={20} color="#888" />
              <Text style={styles.documentUploadText}>Vet Certificate</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.doubleInputContainer}>
            <TextInput
              placeholder="Breed"
              style={styles.doubleInput}
              value={breedInput}
              onChangeText={setBreedInput}
            />
            <TextInput
              placeholder="Age"
              style={styles.doubleInput}
              keyboardType="numeric"
              value={ageInput}
              onChangeText={setAgeInput}
            />
          </View>

          <TextInput
            placeholder="Weight"
            style={styles.input}
            keyboardType="numeric"
            value={weightInput}
            onChangeText={setWeightInput}
          />
          <TextInput
            placeholder="Starting Price (in PHP)"
            style={styles.input}
            keyboardType="numeric"
            value={startingPriceInput}
            onChangeText={setStartingPriceInput}
          />

          <TextInput
            placeholder="Location"
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{`Auction Start: ${date.toLocaleDateString()}`}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
            <Text>{`Auction End: ${date.toLocaleTimeString()}`}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButtonGreen} onPress={handleUpload}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 15,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 10,
    padding: 15,
  },
  uploadButton: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: '#888',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  iconTextContainer: {
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  picker: {
    height: 40,
  },
  doubleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  doubleInput: {
    flex: 0.48,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 7,
    backgroundColor: '#f0f0f0',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  documentUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  documentUploadText: {
    color: '#888',
    marginLeft: 10,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 50,
    marginBottom: 20,
  },
  cancelButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderColor: '#335441',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#335441',
    fontSize: 14,
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
    fontSize: 14,
  },
});

export default PostPage;
