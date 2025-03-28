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
import moment from 'moment';

const MyAuctionsPage = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState('ACTIVE_BIDS');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBidderAuctions = async (status) => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'Failed to fetch user information. Please log in again.');
        navigation.navigate('LoginPage');
        return;
      }

      let query = supabase
        .from('bids')
        .select('bidder_id, livestock_id, bid_amount, livestock:livestock_id (*), status')
        .eq('bidder_id', user.id);

      if (status === 'ACTIVE_BIDS') {
        query = query.neq('livestock.status', 'AUCTION_ENDED');
      } else if (status === 'AUCTIONS_WON') {
        query = query.eq('livestock.winner_id', user.id).eq('livestock.status', 'AUCTION_ENDED');
      }

      const { data, error } = await query;
      if (error) {
        Alert.alert('Error', `Failed to fetch auctions: ${error.message}`);
      } else {
        const uniqueAuctions = Array.from(new Map(
          data.filter((item) => item.livestock)
            .map((item) => [item.livestock.livestock_id, item])
        ).values());

        setAuctions(uniqueAuctions);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBidderAuctions(currentTab);
  }, [currentTab]);

  const handleAuctionPress = (item) => {
    if (!item.livestock) {
      Alert.alert('Error', 'This auction is no longer available.');
      return;
    }

    if (currentTab === 'ACTIVE_BIDS') {
      navigation.navigate('LivestockAuctionDetailPage', { itemId: item.livestock.livestock_id });
    } else if (currentTab === 'AUCTIONS_WON') {
      navigation.navigate('BidderTransactionPage', { livestockId: item.livestock.livestock_id });
    }
  };

  const renderItem = ({ item }) => {
    const timeLeft = moment(item.livestock?.end_time).fromNow();
    const isOutbid = false; // Replace with logic to check if outbid
    
    return (
      <TouchableOpacity
        style={[styles.card, currentTab === 'ACTIVE_BIDS' ? styles.clickable : styles.nonClickable]}
        onPress={() => handleAuctionPress(item)}
        disabled={!item.livestock || currentTab !== 'ACTIVE_BIDS'}
      >
        <Image
          source={{ uri: item.livestock?.image_url || 'https://via.placeholder.com/100' }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.breedText}>Breed: {item.livestock?.breed || 'Unknown Breed'}</Text>
          <Text style={styles.timeLeft}>Closes: {timeLeft}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Your Bid:</Text>
            <Text style={styles.priceText}>₱{item.bid_amount?.toLocaleString()} {isOutbid ? '🔴 Outbid' : '🟢 Leading'}</Text>
          </View>
          {isOutbid && (
            <TouchableOpacity style={styles.bidButton} onPress={() => console.log('Increase Bid')}>
              <Text style={styles.bidButtonText}>Increase Bid</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AuctionHeader title="My Bids" />
      <Tabs
        tabs={['ACTIVE_BIDS', 'AUCTIONS_WON']}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#2C3E50" />
      ) : auctions.length > 0 ? (
        <FlatList
          data={auctions}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.livestock.livestock_id}-${item.bidder_id}`}
        />
      ) : (
        <Text style={styles.emptyText}>{currentTab === 'ACTIVE_BIDS' ? 'No active bids yet. Start bidding now!' : 'You haven’t won any auctions yet. Keep bidding to win your next livestock!'}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  card: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 },
  clickable: { opacity: 1 },
  nonClickable: { opacity: 0.5 },
  image: { width: 100, height: 100, borderRadius: 10, marginRight: 10 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  breedText: { fontSize: 16, fontWeight: 'bold' },
  timeLeft: { color: '#555' },
  priceContainer: { marginTop: 5 },
  priceLabel: { fontSize: 12, color: '#777' },
  priceText: { fontSize: 16, fontWeight: 'bold' },
  bidButton: { backgroundColor: '#ff4500', padding: 5, borderRadius: 5, marginTop: 5 },
  bidButtonText: { color: '#fff', fontSize: 14, textAlign: 'center' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#777' },
});

export default MyAuctionsPage;
