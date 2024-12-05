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
            value={quantityInput}  // Ensure quantityInput is being used correctly
            onChangeText={setQuantityInput}  // Correct reference to setQuantityInput
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

          <TouchableOpacity onPress={() => setAuctionStartPickerVisible(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>Set Auction Start</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isAuctionStartPickerVisible}
            mode="datetime"
            onConfirm={handleAuctionStartConfirm}
            onCancel={() => setAuctionStartPickerVisible(false)}
          />

    

          <TouchableOpacity onPress={() => setAuctionEndPickerVisible(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>Set Auction End</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isAuctionEndPickerVisible}
            mode="datetime"
            onConfirm={handleAuctionEndConfirm}
            onCancel={() => setAuctionEndPickerVisible(false)}
          />



          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitText}>Submit for Approval</Text>
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
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    paddingLeft: 8,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconTextContainer: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  doubleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  doubleInput: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  datePickerButton: {
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  datePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
  },
  documentUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentUploadText: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PostPage;
