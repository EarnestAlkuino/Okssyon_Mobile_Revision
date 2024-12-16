import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { supabase } from '../supabase';
import AuctionDetailsHeader from '../Components/LivestockAuctionDetailPage/AuctionDetailsHeader';

const EditAuctionPage = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('livestock')
        .select('*')
        .eq('livestock_id', itemId)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to load auction details.');
        console.error('Error fetching auction details:', error);
        navigation.goBack();
      } else {
        setItem(data);
      }
      setLoading(false);
    };

    fetchItem();

    const subscription = supabase
      .channel('livestock_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'livestock', filter: `livestock_id=eq.${itemId}` },
        (payload) => {
          console.log('Real-time update:', payload.new);
          setItem(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [itemId]);

  const handleSave = async () => {
    if (!item.category || !item.breed || item.weight <= 0 || item.starting_price <= 0) {
      Alert.alert('Validation Error', 'Please fill in all fields correctly.');
      return;
    }
  
    setSaving(true);
    const { error } = await supabase
      .from('livestock')
      .update({
        category: item.category,
        weight: item.weight,
        breed: item.breed,
        starting_price: item.starting_price,
        location: item.location,
      })
      .eq('livestock_id', itemId);
  
    if (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', 'Failed to save changes.');
    } else {
      Alert.alert('Success', 'Auction updated successfully.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('LivestockAuctionDetailPage', { itemId, userId: item.owner_id });
          },
        },
      ]);
    }
    setSaving(false);
  };
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#405e40" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>No auction details available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuctionDetailsHeader title="Edit Auction" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Weight"
            value={item.weight.toString()}
            keyboardType="numeric"
            onChangeText={(text) => setItem({ ...item, weight: parseFloat(text) || 0 })}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Breed"
            value={item.breed}
            onChangeText={(text) => setItem({ ...item, breed: text })}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Starting Price (₱)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Starting Price"
            value={item.starting_price.toString()}
            keyboardType="numeric"
            onChangeText={(text) => setItem({ ...item, starting_price: parseFloat(text) || 0 })}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Location"
            value={item.location}
            onChangeText={(text) => setItem({ ...item, location: text })}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2D3748',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: '#2D3748',
  },
  saveButton: {
    backgroundColor: '#1E7848',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
});

export default EditAuctionPage;
