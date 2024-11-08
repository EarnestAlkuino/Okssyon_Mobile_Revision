import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../supabase';

const AuctionPage = ({ navigation, route }) => {
  const { category, userId } = route.params;
  const isFocused = useIsFocused();
  const [livestockData, setLivestockData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLivestockData = async () => {
    console.log("Fetching data for category:", category);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('livestock')
        .select('*')
        .eq('category', category);

      if (error) {
        console.error("Error fetching data:", error.message);
        Alert.alert("Error", `Failed to fetch livestock data: ${error.message}`);
      } else {
        console.log("Fetched livestock data:", data);
        setLivestockData(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isFocused && category) {
      fetchLivestockData();
    }
  }, [isFocused, category, userId]);

  const handleLivestockSelect = useCallback((item) => {
    navigation.navigate('LivestockAuctionDetailPage', { itemId: item.livestock_id, userId });

  });
  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleLivestockSelect(item)}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.detailsText}>Breed: {item.breed || 'Unknown'}</Text>
        <Text style={styles.detailsText}>Location: {item.location || 'Not specified'}</Text>
        <Text style={styles.detailsText}>Weight: {item.weight} kg</Text>
        <Text style={styles.detailsText}>Gender: {item.gender}</Text>
        <Text style={styles.detailsText}>Starting Price: ₱{item.starting_price?.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  ), [handleLivestockSelect]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#405e40" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available {category}</Text>
      {livestockData.length > 0 ? (
        <FlatList
          data={livestockData}
          renderItem={renderItem}
          keyExtractor={(item) => item.livestock_id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No livestock available in this category.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#335441',
    marginBottom: 10,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#335441',
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
});

export default AuctionPage;
