import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../supabase';
import Header from '../Components/Header';

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
        <Text style={styles.detailsText}>Breed: <Text style={styles.detailValue}>{item.breed || 'Unknown'}</Text></Text>
        <Text style={styles.detailsText}>Location: <Text style={styles.detailValue}>{item.location || 'Not specified'}</Text></Text>
        <Text style={styles.detailsText}>Weight: <Text style={styles.detailValue}>{item.weight} kg</Text></Text>
        <Text style={styles.detailsText}>Gender: <Text style={styles.detailValue}>{item.gender}</Text></Text>
        <Text style={styles.detailsText}>Starting Price: <Text style={styles.priceText}>₱{item.starting_price?.toLocaleString()}</Text></Text>
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
      <Header 
        title={`Available ${category}`} 
        showBackButton={true}
        onBackPress={() => navigation.goBack()} 
        showSettingsButton={false}
      />
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
    backgroundColor: '#f2f2f2',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 6, 
    elevation: 8,
    top: 20,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  categoryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#335441',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  detailValue: {
    fontWeight: '600',
    color: '#333',
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#405e40',
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