import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase';

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
        .eq('id', itemId)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to load auction details.');
        console.error("Error fetching auction details:", error);
        navigation.goBack();
      } else {
        console.log("Fetched Item Data:", data);
        setItem(data);
      }
      setLoading(false);
    };

    fetchItem();
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
      .eq('id', itemId);

    if (error) {
      console.error("Save Error:", error);
      Alert.alert('Error', 'Failed to save changes.');
    } else {
      Alert.alert('Success', 'Auction updated successfully.');
      navigation.goBack();
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
      <Text style={styles.header}>Edit Auction</Text>
      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={item.category}
        onChangeText={(text) => setItem({ ...item, category: text })}
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={item.weight.toString()}
        keyboardType="numeric"
        onChangeText={(text) => setItem({ ...item, weight: parseFloat(text) || 0 })}
      />

      <Text style={styles.label}>Breed</Text>
      <TextInput
        style={styles.input}
        value={item.breed}
        onChangeText={(text) => setItem({ ...item, breed: text })}
      />

      <Text style={styles.label}>Starting Price (₱)</Text>
      <TextInput
        style={styles.input}
        value={item.starting_price.toString()}
        keyboardType="numeric"
        onChangeText={(text) => setItem({ ...item, starting_price: parseFloat(text) || 0 })}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={item.location}
        onChangeText={(text) => setItem({ ...item, location: text })}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#335441',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EditAuctionPage;
