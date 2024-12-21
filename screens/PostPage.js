import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';// Adjust the path as needed
 
const PostPage = () => {
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('female');
  const [image, setImage] = useState(null);
  const [proofOfOwnership, setProofOfOwnership] = useState(null);
  const [vetCertificate, setVetCertificate] = useState(null);
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [location, setLocation] = useState('');
  const [auctionDuration, setAuctionDuration] = useState({ days: '0', hours: '0', minutes: '0' });
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
 
 
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setOwnerId(user.id);
      } else {
        Alert.alert('Error', 'User not authenticated');
      }
    };
    fetchUserId();
  }, []);
 
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access media library is required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
 
      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      } else {
        alert('Image selection was canceled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image');
    }
  };
 
  const pickDocument = async (setDocument) => {
    try {
      console.log('Opening Document Picker...');
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
 
      // Debugging log
      console.log('DocumentPicker Result:', result);
 
      // Check if the result contains assets and the first asset has a URI
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const uri = result.assets[0].uri; // Extract the URI from the first asset
        setDocument(uri); // Update state with the URI
        console.log('Document selected: ', uri);
      } else if (result.canceled) {
        console.log('Document selection canceled by the user.');
      } else {
        console.log('Invalid document result:', result);
        Alert.alert('Error', 'Invalid document selection. Please try again.');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick a document. Please try again.');
    }
  };
 
 
  const uploadFileToSupabase = async (fileUri, fileName, bucketName = 'oksyon_documents') => {
    try {
      console.log('Starting file upload...');
      console.log('File URI:', fileUri);
 
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist at the given URI');
      }
 
      // Determine MIME type
      const mimeType = fileUri.endsWith('.jpg') || fileUri.endsWith('.jpeg')
        ? 'image/jpeg'
        : fileUri.endsWith('.png')
        ? 'image/png'
        : fileUri.endsWith('.pdf')
        ? 'application/pdf'
        : 'application/octet-stream';
 
      // Read the file as Base64
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
 
      console.log('File read as Base64 successfully.');
 
      // Convert Base64 to a Uint8Array
      const fileBuffer = Buffer.from(fileBase64, 'base64');
 
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });
 
      if (error) {
        console.error('Error during Supabase upload:', error);
        throw error;
      }
 
      console.log('Upload successful:', data);
 
      const supabaseUrl = process.env.SUPABASE_URL || 'https://ikvsahtemgarvhkvaftl.supabase.co'; 
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;
      console.log('Public URL:', publicUrl);
 
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
 
  const handleSubmit = async () => {
    if (!category || !gender || !breed || !age || !weight || !startingPrice || !location) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
 
    // Parse and validate duration
    const durationDays = parseInt(auctionDuration.days || '0', 10);
    const durationHours = parseInt(auctionDuration.hours || '0', 10);
    const durationMinutes = parseInt(auctionDuration.minutes || '0', 10);
 
    if (durationDays <= 0 && durationHours <= 0 && durationMinutes <= 0) {
      Alert.alert('Error', 'Auction duration must be greater than 0');
      return;
    }
 
    setLoading(true);
    try {
      // Current time in the Philippines timezone
      const nowUTC = new Date();
      const timezoneOffset = 8 * 60 * 60 * 1000; // UTC+8 in milliseconds
      const nowPH = new Date(nowUTC.getTime() + timezoneOffset);
 
      // Auction end time
      const auctionEndPH = new Date(
        nowPH.getTime() +
          durationDays * 24 * 60 * 60 * 1000 +
          durationHours * 60 * 60 * 1000 +
          durationMinutes * 60 * 1000
      );
 
      // Upload files if they exist
      const imageUrl = image ? await uploadFileToSupabase(image, `image-${Date.now()}.jpg`) : null;
      const proofOfOwnershipUrl = proofOfOwnership
        ? await uploadFileToSupabase(proofOfOwnership, `proof-of-ownership-${Date.now()}.pdf`)
        : null;
      const vetCertificateUrl = vetCertificate
        ? await uploadFileToSupabase(vetCertificate, `vet-certificate-${Date.now()}.pdf`)
        : null;
 
      // Insert into the database
      const { error } = await supabase.from('livestock').insert({
        owner_id: ownerId,
        category,
        gender,
        breed,
        age: parseInt(age, 10),
        weight: parseFloat(weight),
        starting_price: parseFloat(startingPrice),
        location,
        image_url: imageUrl,
        proof_of_ownership_url: proofOfOwnershipUrl,
        vet_certificate_url: vetCertificateUrl,
        auction_start: nowPH.toISOString(),
        auction_end: auctionEndPH.toISOString(),
        status: 'PENDING',
        bidding_duration: `${durationDays} days ${durationHours} hours ${durationMinutes} minutes`,
      });
 
      if (error) throw error;
      setImage(null);
      setProofOfOwnership(null);
      setVetCertificate(null);
      setBreed('');
      setAge('');
      setWeight('');
      setStartingPrice('');
      setLocation('');
      setAuctionDuration({ days: '0', hours: '0', minutes: '0' });
      setCategory('');
      setGender('');
      setLoading(false);
      Alert.alert('Success', 'Your livestock has been submitted for admin approval.');
    } catch (error) {
      console.error('Error submitting livestock:', error);
      Alert.alert('Error', 'Failed to post livestock');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        <Text style={styles.label}>Upload Livestock Photo</Text>
        <Text>{image ? 'Photo Selected' : 'No photo selected'}</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>
        

        <Text style={styles.label}>Category</Text>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Cattle" value="Cattle" />
          <Picker.Item label="Goat" value="Goat" />
          <Picker.Item label="Sheep" value="Sheep" />
          <Picker.Item label="Horse" value="Horse" />
          <Picker.Item label="Pig" value="Pig" />
          <Picker.Item label="Carabao" value="Carabao" />
        </Picker>

        <Text style={styles.label}>Gender</Text>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Male" value="Male" />
        </Picker>

        <Text style={styles.label}>Breed</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Enter breed"
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter age in (months)"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Weight</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter weight in (kg)"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        <Text style={styles.label}>Upload Proof of Ownership</Text>
        <Text>{proofOfOwnership ? 'File Selected' : 'No document selected'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => pickDocument(setProofOfOwnership)}>
          <Text style={styles.buttonText}>Pick Document</Text>
        </TouchableOpacity>
        

        <Text style={styles.label}>Upload Vet Certification</Text>
        <Text>{vetCertificate ? 'File Selected' : 'No document selected'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => pickDocument(setVetCertificate)}>
          <Text style={styles.buttonText}>Pick Document</Text>
        </TouchableOpacity>
        

        <Text style={styles.label}>Starting Price</Text>
        <TextInput
          style={styles.input}
          value={startingPrice}
          onChangeText={setStartingPrice}
          placeholder="Enter starting price"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Auction Duration (Days:Hours:Minutes)</Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={[styles.input, styles.durationInput]}
            value={auctionDuration.days}
            onChangeText={(text) =>
              setAuctionDuration({ ...auctionDuration, days: text.replace(/[^0-9]/g, '') })
            }
            placeholder="Days"
            keyboardType="numeric"
          />
          <Text>:</Text>
          <TextInput
            style={[styles.input, styles.durationInput]}
            value={auctionDuration.hours}
            onChangeText={(text) =>
              setAuctionDuration({ ...auctionDuration, hours: text.replace(/[^0-9]/g, '') })
            }
            placeholder="Hours"
            keyboardType="numeric"
          />
          <Text>:</Text>
          <TextInput
            style={[styles.input, styles.durationInput]}
            value={auctionDuration.minutes}
            onChangeText={(text) =>
              setAuctionDuration({ ...auctionDuration, minutes: text.replace(/[^0-9]/g, '') })
            }
            placeholder="Minutes"
            keyboardType="numeric"
          />
        </View>

        

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationInput: {
    width: '30%',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PostPage;