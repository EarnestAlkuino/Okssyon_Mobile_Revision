import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { supabase } from '../supabase';
import AuctionHeader from '../Components/MyAuctions/AuctionHeader';
import FilePicker from '../Components/PostPage/FilePicker';
import CategoryPicker from '../Components/PostPage/CategoryPicker';
import TextInputField from '../Components/PostPage/TextInputField';
import DurationInput from '../Components/PostPage/DurationInput';
import SubmitButton from '../Components/PostPage/SubmitButton';
import uploadFileToSupabase from '../utils/uploadFileToSupabase'; // Ensure this is correct.

const PostPage = ({ navigation }) => {
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
  const [quantity, setQuantity] = useState('');
  const [auctionDuration, setAuctionDuration] = useState({ days: '0', hours: '0', minutes: '0' });
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setOwnerId(user.id);
        } else {
          Alert.alert('Error', 'User not authenticated. Please log in.');
          navigation.navigate('LoginPage');
        }
      } catch (err) {
        console.error('Error fetching user ID:', err);
        Alert.alert('Error', 'Unable to fetch user information.');
      }
    };
    fetchUserId();
  }, [navigation]);

  const handleSubmit = async () => {
    if (!category || !gender || !breed || !age || !weight || !startingPrice || !location || !quantity) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const durationDays = parseInt(auctionDuration.days || '0', 10);
    const durationHours = parseInt(auctionDuration.hours || '0', 10);
    const durationMinutes = parseInt(auctionDuration.minutes || '0', 10);

    if (durationDays <= 0 && durationHours <= 0 && durationMinutes <= 0) {
      Alert.alert('Error', 'Auction duration must be greater than 0.');
      return;
    }

    setLoading(true);

    try {
      const nowPH = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
      const auctionEndPH = new Date(
        nowPH.getTime() +
          durationDays * 24 * 60 * 60 * 1000 +
          durationHours * 60 * 60 * 1000 +
          durationMinutes * 60 * 1000
      );

      // Upload files to Supabase
      const imageUrl = image ? await uploadFileToSupabase(image, `image-${Date.now()}.jpg`) : null;
      const proofOfOwnershipUrl = proofOfOwnership
        ? await uploadFileToSupabase(proofOfOwnership, `proof-of-ownership-${Date.now()}.pdf`)
        : null;
      const vetCertificateUrl = vetCertificate
        ? await uploadFileToSupabase(vetCertificate, `vet-certificate-${Date.now()}.pdf`)
        : null;

      // Insert data into Supabase
      const { error } = await supabase.from('livestock').insert({
        owner_id: ownerId,
        category,
        gender,
        breed,
        age: parseInt(age, 10),
        weight: parseFloat(weight),
        starting_price: parseFloat(startingPrice),
        location,
        quantity: parseInt(quantity, 10),
        image_url: imageUrl,
        proof_of_ownership_url: proofOfOwnershipUrl,
        vet_certificate_url: vetCertificateUrl,
        auction_start: nowPH.toISOString(),
        auction_end: auctionEndPH.toISOString(),
        status: 'PENDING',
        bidding_duration: `${durationDays} days ${durationHours} hours ${durationMinutes} minutes`,
      });

      if (error) throw error;

      Alert.alert('Success', 'Your livestock has been submitted for admin approval.');
      navigation.goBack();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', 'Failed to post livestock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AuctionHeader title="Post Livestock" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ padding: 16 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <FilePicker label="Upload Livestock Photo" file={image} setFile={setImage} isImage />
          <FilePicker label="Upload Proof of Ownership" file={proofOfOwnership} setFile={setProofOfOwnership} />
          <FilePicker label="Upload Vet Certification" file={vetCertificate} setFile={setVetCertificate} />

          <CategoryPicker label="Category" selectedValue={category} onValueChange={setCategory} />
          <CategoryPicker
            label="Gender"
            selectedValue={gender}
            onValueChange={setGender}
            options={[
              { label: 'Female', value: 'female' },
              { label: 'Male', value: 'male' },
            ]}
          />

          <TextInputField label="Breed" value={breed} onChangeText={setBreed} />
          <TextInputField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
          <TextInputField label="Weight" value={weight} onChangeText={setWeight} keyboardType="numeric" />
          <TextInputField label="Starting Price" value={startingPrice} onChangeText={setStartingPrice} keyboardType="numeric" />
          <TextInputField label="Location" value={location} onChangeText={setLocation} />
          <TextInputField label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

          <DurationInput label="Auction Duration" value={auctionDuration} setValue={setAuctionDuration} />

          <SubmitButton text="Submit" onPress={handleSubmit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PostPage;
