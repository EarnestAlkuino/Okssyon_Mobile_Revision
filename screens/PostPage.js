import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import Header from '../Components/Header';
import { supabase } from '../supabase'; // Import Supabase client

const PostPage = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('female');
  const [image, setImage] = useState(null);
  const [proofOfOwnership, setProofOfOwnership] = useState(null);
  const [vetCertificate, setVetCertificate] = useState(null);
  const [auctionStart, setAuctionStart] = useState(new Date());
  const [auctionEnd, setAuctionEnd] = useState(new Date());
  const [isAuctionStartPickerVisible, setAuctionStartPickerVisible] = useState(false);
  const [isAuctionEndPickerVisible, setAuctionEndPickerVisible] = useState(false);
  const [breedInput, setBreedInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [startingPriceInput, setStartingPriceInput] = useState('');
  const [location, setLocation] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        Alert.alert("Error", "User not authenticated");
      }
    };
    fetchUserId();
  }, []);

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

  const handleAuctionStartConfirm = (date) => {
    setAuctionStart(date);
    setAuctionStartPickerVisible(false);
  };

  const handleAuctionEndConfirm = (date) => {
    setAuctionEnd(date);
    setAuctionEndPickerVisible(false);
  };

  const uploadImage = async (uri, path) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, blob, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    try {
      const imagePath = image ? await uploadImage(image, `livestock/${Date.now()}_image`) : null;
      const proofPath = proofOfOwnership ? await uploadImage(proofOfOwnership.uri, `proofs/${Date.now()}_proof`) : null;
      const vetPath = vetCertificate ? await uploadImage(vetCertificate.uri, `certificates/${Date.now()}_vet`) : null;

      const { data, error } = await supabase.from('livestock').insert([{
        owner_id: userId,
        category,
        gender,
        image_url: imagePath,
        proof_of_ownership_url: proofPath,
        vet_certificate_url: vetPath,
        breed: breedInput,
        age: parseInt(ageInput),
        weight: parseFloat(weightInput),
        starting_price: parseFloat(startingPriceInput),
        location,
        auction_start: auctionStart,
        auction_end: auctionEnd,
      }]);

      if (error) throw error;
      Alert.alert("Success", "Your livestock has been uploaded for auction.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Livestock Upload Form"
        showBackButton={false}
        showSettingsButton={false}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Category</Text>
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

          <Text style={styles.label}>Gender</Text>
          <View style={styles.inputContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Male" value="male" />
            </Picker>
          </View>

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
            placeholder="Weight (kg)"
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

          <TouchableOpacity onPress={() => pickDocument(setProofOfOwnership)} style={styles.documentUploadButton}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="document-outline" size={20} color="#888" />
              <Text style={styles.documentUploadText}>Upload Proof of Ownership</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => pickDocument(setVetCertificate)} style={styles.documentUploadButton}>
            <View style={styles.iconTextContainer}>
              <Ionicons name="document-text-outline" size={20} color="#888" />
              <Text style={styles.documentUploadText}>Upload Vet Certificate</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAuctionStartPickerVisible(true)} style={styles.auctionTimeButton}>
            <Text style={styles.auctionTimeText}>{`Auction Start: ${auctionStart.toLocaleDateString()} ${auctionStart.toLocaleTimeString()}`}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isAuctionStartPickerVisible}
            mode="datetime"
            onConfirm={handleAuctionStartConfirm}
            onCancel={() => setAuctionStartPickerVisible(false)}
          />

          <TouchableOpacity onPress={() => setAuctionEndPickerVisible(true)} style={styles.auctionTimeButton}>
            <Text style={styles.auctionTimeText}>{`Auction End: ${auctionEnd.toLocaleDateString()} ${auctionEnd.toLocaleTimeString()}`}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isAuctionEndPickerVisible}
            mode="datetime"
            onConfirm={handleAuctionEndConfirm}
            onCancel={() => setAuctionEndPickerVisible(false)}
          />
          <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButtonGreen} onPress={handleSubmit}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 100,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
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
    justifyContent: 'center',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  picker: {
    height: 40,
    padding: 30,
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
  auctionTimeButton: {
    height: 45,
    backgroundColor: '#e8f4ea',
    borderColor: '#a3d9a5',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  auctionTimeText: {
    color: '#335441',
    fontSize: 16,
  },
  documentUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  documentUploadText: {
    color: '#888',
    marginLeft: 5,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 40,
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
