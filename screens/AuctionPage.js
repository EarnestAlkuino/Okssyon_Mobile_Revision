import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // For updated icons
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../supabase';
import AuctionHeader from '../Components/AuctionHeader';

const AuctionPage = ({ navigation, route }) => {
  const { category, userId } = route.params;
  const isFocused = useIsFocused();
  const [livestockData, setLivestockData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch livestock data from Supabase
  const fetchLivestockData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
      .from('livestock')
      .select('*')
      .eq('category', category)
      .eq('status', 'AVAILABLE'); // Only fetch livestock with 'AVAILABLE' status
  
      if (error) {
        console.error('Error fetching data:', error.message);
        Alert.alert('Error', `Failed to fetch livestock data: ${error.message}`);
      } else {
        console.log('Fetched Livestock Data:', data); // Debug log
        setLivestockData(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', `An unexpected error occurred: ${err.message}`);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (isFocused) {
      fetchLivestockData();
    }
  }, [isFocused]);

  const handleLivestockSelect = useCallback(
    (item) => {
      navigation.navigate('LivestockAuctionDetailPage', { itemId: item.livestock_id, userId });
    },
    [navigation, userId]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity style={styles.card} onPress={() => handleLivestockSelect(item)}>
        <Image
          source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.breedText}>Breed - {item.breed || 'Unknown Breed'}</Text>
          <View style={styles.detailsRow}>
            <Icon name="map-marker-outline" size={16} color="#4A5568" />
            <Text style={styles.detailValue}>Location - {item.location || 'Not specified'}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Icon name="scale-bathroom" size={16} color="#4A5568" /> {/* Updated weight icon */}
            <Text style={styles.detailValue}>Weight - {item.weight} kg</Text>
          </View>
          <View style={styles.detailsRow}>
            <Icon name="gender-male-female" size={16} color="#4A5568" />
            <Text style={styles.detailValue}>Gender - {item.gender}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Starting Price</Text>
            <Text style={styles.priceText}>₱{item.starting_price?.toLocaleString()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleLivestockSelect]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuctionHeader title={`Available ${category}`} onBackPress={() => navigation.goBack()} />
      {livestockData.length > 0 ? (
        <FlatList
          data={livestockData}
          renderItem={renderItem}
          keyExtractor={(item) => item.livestock_id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No available livestock in this category.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  breedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    marginLeft: 4,
    color: '#4A5568',
  },
  priceContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6C6C6C',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E7848',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C6C6C',
  },
});

export default AuctionPage;
