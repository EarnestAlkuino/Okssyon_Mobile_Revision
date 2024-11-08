import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase'; // Adjust the path based on your project structure

const BidPage = ({ route, navigation }) => {
  const { item, userId, ownerId } = route.params || {};
  const [bidAmount, setBidAmount] = useState('');
  const [currentHighestBid, setCurrentHighestBid] = useState(item?.starting_price || 0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the initial highest bid and unique user count
    const fetchInitialBidData = async () => {
      try {
        // Get the highest bid
        const { data: highestBidData, error: highestBidError } = await supabase
          .from('bids')
          .select('bid_amount')
          .eq('livestock_id', item.livestock_id)
          .order('bid_amount', { ascending: false })
          .limit(1);

        if (highestBidError) throw highestBidError;
        if (highestBidData.length > 0) {
          setCurrentHighestBid(highestBidData[0].bid_amount);
        }

        // Get the unique user count
        const { data: userCountData, error: userCountError } = await supabase
          .from('bids')
          .select('bidder_id', { count: 'exact', distinct: true })
          .eq('livestock_id', item.livestock_id);

        if (userCountError) throw userCountError;
        setUserCount(userCountData.length);
      } catch (error) {
        console.error('Error fetching bid data:', error);
      }
    };

    fetchInitialBidData();

    // Set up real-time subscription for bid changes on this item
    const subscription = supabase
      .channel('livestock-bid-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `livestock_id=eq.${item.livestock_id}` },
        (payload) => {
          const newBidAmount = payload.new.bid_amount;
          const newBidderId = payload.new.bidder_id;

          setCurrentHighestBid((prev) => (newBidAmount > prev ? newBidAmount : prev));
          
          // Update user count if this is a new unique user
          setUserCount((prevCount) => {
            // Only increase count if the new bidder is unique
            const isUniqueBidder = !userCountData.some((user) => user.bidder_id === newBidderId);
            return isUniqueBidder ? prevCount + 1 : prevCount;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [item.livestock_id]);

  const handlePlaceBid = async () => {
    if (!item) {
      Alert.alert('Error', 'Invalid auction item.');
      navigation.goBack();
      return;
    }

    if (userId === ownerId) {
      Alert.alert('Error', 'You cannot place a bid on your own auction.');
      return;
    }

    const parsedBidAmount = parseFloat(bidAmount);
    if (isNaN(parsedBidAmount)) {
      Alert.alert('Invalid Bid', 'Please enter a valid bid amount.');
      return;
    }

    setLoading(true);

    try {
      const latestHighestBid = currentHighestBid;

      if (parsedBidAmount <= latestHighestBid) {
        Alert.alert(
          'Invalid Bid',
          `Your bid must be higher than the current highest bid of ₱${latestHighestBid.toLocaleString()}.`
        );
        setLoading(false);
        return;
      }

      // Insert the new bid into Supabase
      const { error } = await supabase.from('bids').insert([
        {
          livestock_id: item.livestock_id,
          bidder_id: userId,
          bid_amount: parsedBidAmount,
          status: 'pending',
        },
      ]);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Your bid has been placed!');
      setBidAmount('');
    } catch (error) {
      console.error('Error placing bid:', error);
      Alert.alert('Error', 'Could not place your bid. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addToBid = (amount) => {
    const newBid = (parseInt(bidAmount || 0, 10) + amount).toString();
    setBidAmount(newBid);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>{item?.category?.toUpperCase() || 'Auction Item'}</Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.details}>Weight: {item?.weight || 'N/A'}kg | Breed: {item?.breed || 'N/A'}</Text>
      </View>

      <View style={styles.bidInfoContainer}>
        <View style={styles.bidItem}>
          <Text style={styles.bidLabel}>Highest Bid</Text>
          <Text style={styles.bidValue}>₱{currentHighestBid.toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.bidItem}>
          <Text style={styles.bidLabel}>No. of Bidders</Text>
          <Text style={styles.bidValue}>{userCount}</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your bid"
        value={bidAmount}
        onChangeText={setBidAmount}
        keyboardType="numeric"
      />

      <View style={styles.presetBidContainer}>
        <View style={styles.presetRow}>
          {[1000, 3000].map((amount) => (
            <TouchableOpacity key={amount} style={styles.presetButton} onPress={() => addToBid(amount)}>
              <Text style={styles.presetButtonText}>+₱{amount.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.presetRow}>
          {[5000, 10000].map((amount) => (
            <TouchableOpacity key={amount} style={styles.presetButton} onPress={() => addToBid(amount)}>
              <Text style={styles.presetButtonText}>+₱{amount.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handlePlaceBid} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Bid</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailsContainer: {
    width: '80%',
    marginBottom: 10,
  },
  details: {
    fontSize: 18,
    marginVertical: 5,
  },
  bidInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 5,
    paddingHorizontal: 5,
  },
  bidItem: {
    alignItems: 'center',
    flex: 1,
  },
  bidLabel: {
    fontSize: 16,
    color: '#335441',
  },
  bidValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    backgroundColor: '#335441',
    height: '100%',
    marginHorizontal: 10,
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#335441',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  presetBidContainer: {
    width: '80%',
    marginBottom: 20,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  presetButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 15,
  },
  submitButton: {
    backgroundColor: '#335441',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    borderColor: '#335441',
    borderWidth: 1,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  cancelText: {
    color: '#335441',
    fontSize: 18,
  },
});

export default BidPage;
