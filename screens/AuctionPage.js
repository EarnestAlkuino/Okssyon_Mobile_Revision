import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabase';



const AuctionPage = ({ navigation, route }) => {
  const { category, userId } = route.params; // Receive category and userId from navigation
  const [livestockData, setLivestockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLivestockData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('livestock')
        .select('*')
        .eq('category', category); // Fetch based on category

      if (error) {
        Alert.alert("Error", "Failed to fetch livestock data.");
      } else {
        setLivestockData(data);
      }
      
      setLoading(false);
    };

    fetchLivestockData();
  }, [category]);

  const handleLivestockSelect = (item) => {
    console.log("Navigating to LivestockAuctionDetailPage with itemId:", item.id, "and userId:", userId); // Debugging
    navigation.navigate('LivestockAuctionDetailPage', { itemId: item.id, userId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleLivestockSelect(item)}>
      <Image
        source={{ uri: item.image_uri || 'https://via.placeholder.com/100' }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.detailsText}>Breed: {item.breed || 'Unknown'}</Text>
        <Text style={styles.detailsText}>Location: {item.location || 'Not specified'}</Text>
        <Text style={styles.detailsText}>Weight: {item.weight} kg</Text>
        <Text style={styles.detailsText}>Starting Price: ₱{item.starting_price?.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

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
      <FlatList
        data={livestockData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
});

export default AuctionPage;