import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../supabase';
import AuctionHeader from '../Components/MyAuctions/AuctionHeader';
import Tabs from '../Components/MyAuctions/Tabs';

const MyAuctionsPage = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState('ONGOING');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null); // New: Handle errors

  const fetchBidderAuctions = async (status) => {
    setLoading(true);
    try {
      // ✅ Get logged-in user (bidder)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'Failed to fetch user information. Please log in again.');
        navigation.navigate('LoginPage');
        return;
      }

      // ✅ Fetch auctions where the user has placed a bid
      let query = supabase
        .from('bids')
        .select('livestock_id, livestock:livestock_id (*), bid_amount')
        .eq('bidder_id', user.id);

      // ✅ Filter based on tab selection
      if (status === 'ONGOING') {
        query = query.neq('livestock.status', 'AUCTION_ENDED'); // Exclude ended auctions
      } else if (status === 'BID_WON') {
        query = query.eq('livestock.winner_id', user.id).eq('livestock.status', 'AUCTION_ENDED'); // Only won auctions
      }

      const { data, error } = await query;

      if (error) {
        setErrorMessage('Failed to fetch auctions.');
      } else {
        // ✅ Remove any bids that reference a null livestock entry
        const validAuctions = data.filter(item => item.livestock !== null);
        setAuctions(validAuctions);
        setErrorMessage(validAuctions.length === 0 ? 'No auctions found.' : null);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBidderAuctions(currentTab);
  }, [currentTab]);

  const renderItem = ({ item }) => {
    // ✅ Ensure item.livestock exists before rendering
    if (!item.livestock) {
      console.warn('Skipping invalid auction item:', item);
      return null;
    }

    const isAuctionEnded = item.livestock.status === 'AUCTION_ENDED';
    const isWinner = item.livestock.winner_id === item.bidder_id; // User won the bid

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isAuctionEnded && !isWinner ? styles.disabledAuction : null, // Greyed-out style
        ]}
        onPress={() =>
          !isAuctionEnded || isWinner // Prevent navigation if auction ended & user didn't win
            ? navigation.navigate('LivestockAuctionDetailPage', { itemId: item.livestock.livestock_id })
            : Alert.alert('Auction Ended', 'You can no longer view this auction.')
        }
        disabled={isAuctionEnded && !isWinner} // Disable clicking
      >
        <Image
          source={{ uri: item.livestock.image_url || 'https://via.placeholder.com/100' }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.breedText}>Breed: {item.livestock.breed || 'Unknown Breed'}</Text>
          <View style={styles.detailsRow}>
            <Icon name="map-marker-outline" size={16} color="#4A5568" />
            <Text style={styles.detailValue}>Location: {item.livestock.location || 'Not specified'}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Icon name="scale-bathroom" size={16} color="#4A5568" />
            <Text style={styles.detailValue}>Weight: {item.livestock.weight} kg</Text>
          </View>
          <View style={styles.detailsRow}>
            <Icon name="gender-male-female" size={16} color="#4A5568" />
            <Text style={styles.detailValue}>Gender: {item.livestock.gender}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Your Bid:</Text>
            <Text style={styles.priceText}>₱{item.bid_amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles[item.livestock.status.toLowerCase()]]}>
              {item.livestock.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
      <AuctionHeader title="My Bids" />
      <Tabs
        tabs={['ONGOING', 'BID_WON']}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      {errorMessage ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={auctions}
          renderItem={renderItem}
          keyExtractor={(item) => item.livestock.livestock_id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'top',
  },
  image: {
    width: 120,
    height: 130,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  disabledAuction: {
    backgroundColor: '#E0E0E0', // Greyed-out background
    opacity: 0.6,
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

export default MyAuctionsPage;
