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
  const [quantityInput, setQuantityInput] = useState(''); // Declare quantity state
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
      // Ensure auction_end is greater than auction_start
      if (auctionEnd <= auctionStart) {
        Alert.alert("Error", "Auction end time must be greater than auction start time.");
        return;
      }
  
      const imagePath = image ? await uploadImage(image, `livestock/${Date.now()}_image`) : null;
      const proofPath = proofOfOwnership ? await uploadImage(proofOfOwnership.uri, `proofs/${Date.now()}_proof`) : null;
      const vetPath = vetCertificate ? await uploadImage(vetCertificate.uri, `certificates/${Date.now()}_vet`) : null;
  
      // Insert data into the livestock table
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
        quantity: parseInt(quantityInput), // Save quantity in the table
        status: 'PENDING',
      }]);
  
      if (error) throw error;
  
      Alert.alert("Success", "Your livestock has been submitted for review. It will be available for auction once approved by the admin.");
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

          <TextInput
            placeholder="Quantity"
            style={styles.input}
            keyboardType="numeric"
            value={quantityInput} 
            onChangeText={setQuantityInput}  
          />

          <TouchableOpacity onPress={() => setAuctionStartPickerVisible(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>Set Auction Start</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAuctionEndPickerVisible(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>Set Auction End</Text>
          </TouchableOpacity> 

  
          <View style={styles.rowContainer}>
            <TouchableOpacity onPress={() => pickDocument(setProofOfOwnership)} style={[styles.documentUploadButton, styles.flexButton]}>
              <View style={styles.iconTextContainer}>
                <Ionicons name="document-outline" size={20} color="#888" />
                <Text style={styles.uploadText}>Upload Proof of Ownership</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickDocument(setVetCertificate)} style={[styles.documentUploadButton, styles.flexButton]}>
              <View style={styles.iconTextContainer}>
                <Ionicons name="document-text-outline" size={20} color="#888" />
                <Text style={styles.uploadText}>Upload Vet Certificate</Text>
              </View>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isAuctionStartPickerVisible}
            mode="datetime"
            onConfirm={handleAuctionStartConfirm}
            onCancel={() => setAuctionStartPickerVisible(false)}
          />
          <DateTimePickerModal
            isVisible={isAuctionEndPickerVisible}
            mode="datetime"
            onConfirm={handleAuctionEndConfirm}
            onCancel={() => setAuctionEndPickerVisible(false)}
          />
          
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    paddingBottom: 70, 
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30, 
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    borderRadius: 5,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  doubleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  doubleInput: {
    width: '48%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginVertical: 20,
    backgroundColor: '#f9f9f9',
  },
  imagePreview: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  iconTextContainer: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 5,
    fontSize: 14,
    color: '#555',
  },
  datePickerButton: {
    backgroundColor: '#335441', 
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  datePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#335441', 
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  documentUploadButton: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  flexButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#335441', 
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc', 
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default PostPage;
