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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../supabase';
import AuctionHeader from '../Components/AuctionHeader';

const AuctionPage = ({ navigation, route }) => {
  const { category, userId } = route.params;
  const isFocused = useIsFocused();
  const [livestockData, setLivestockData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch available livestock
  const fetchLivestockData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('livestock')
        .select('*')
        .eq('category', category)
        .eq('status', 'AVAILABLE'); // Only fetch AVAILABLE livestock

      if (error) {
        console.error('Error fetching data:', error.message);
        Alert.alert('Error', `Failed to fetch livestock data: ${error.message}`);
      } else {
        setLivestockData(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', `An unexpected error occurred: ${err.message}`);
    }
    setLoading(false);
  };

  // Function to handle auction end
  const endAuction = async (livestockId) => {
    try {
      const { data: highestBid, error: bidError } = await supabase
        .from('bids')
        .select('bidder_id')
        .eq('livestock_id', livestockId)
        .order('bid_amount', { ascending: false })
        .limit(1)
        .single();

      if (bidError) {
        console.error('Error fetching highest bid:', bidError.message);
        return;
      }

      if (!highestBid || !highestBid.bidder_id) {
        console.log('❌ No winner found. Removing auction...');

        // ❗ If no winner, DELETE the auction
        const { error: deleteError } = await supabase
          .from('livestock')
          .delete()
          .eq('livestock_id', livestockId);

        if (deleteError) {
          console.error('Error deleting auction:', deleteError.message);
        } else {
          console.log('✅ Auction removed successfully.');
        }
      } else {
        console.log('🏆 Winner found. Updating status...');
        // ✅ If there's a winner, update status to AUCTION_ENDED
        const { error: updateError } = await supabase
          .from('livestock')
          .update({ status: 'AUCTION_ENDED' })
          .eq('livestock_id', livestockId);

        if (updateError) {
          console.error('Error updating auction status:', updateError.message);
        } else {
          console.log('✅ Auction updated to AUCTION_ENDED.');
        }
      }
    } catch (err) {
      console.error('Unexpected error ending auction:', err);
    }
  };

  // Real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('livestock-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'livestock' },
        (payload) => {
          const { eventType, new: newData, old: oldData } = payload;

          setLivestockData((prevData) => {
            if (eventType === 'INSERT' && newData.status === 'AVAILABLE') {
              return [newData, ...prevData];
            }
            if (eventType === 'UPDATE') {
              if (newData.status === 'AUCTION_ENDED') {
                return prevData.filter((item) => item.livestock_id !== newData.livestock_id);
              }
              return prevData.map((item) =>
                item.livestock_id === newData.livestock_id ? newData : item
              );
            }
            if (eventType === 'DELETE') {
              return prevData.filter((item) => item.livestock_id !== oldData.livestock_id);
            }
            return prevData;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
            <Icon name="scale-bathroom" size={16} color="#4A5568" />
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
  priceContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E7848',
  },
});

export default AuctionPage;
