import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

const BidPage = ({ route, navigation }) => {
  const { item, userId, ownerId } = route.params; // Receive ownerId here
  const [bidAmount, setBidAmount] = useState('');
  const [currentHighestBid, setCurrentHighestBid] = useState(item.starting_price || 0);
  const [bidCount, setBidCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBidData = async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('bid_amount')
        .eq('livestock_id', item.id)
        .order('bid_amount', { ascending: false });

      if (error) {
        console.error('Error fetching bid data:', error);
      } else if (data.length > 0) {
        setCurrentHighestBid(data[0].bid_amount);
        setBidCount(data.length);
      } else {
        setCurrentHighestBid(item.starting_price || 0);
        setBidCount(0);
      }
    };

    fetchBidData();
  }, [item.id]);

  const handlePlaceBid = async () => {
    // Prevent owner from bidding
    if (userId === ownerId) {
      Alert.alert('Error', 'You cannot place a bid on your own auction.');
      return; // Exit function if user is the owner
    }

    const parsedBidAmount = parseFloat(bidAmount);
    if (isNaN(parsedBidAmount) || parsedBidAmount <= currentHighestBid) {
      Alert.alert('Invalid Bid', 'Your bid must be higher than the current highest bid.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('bids')
        .insert([{ livestock_id: item.id, user_id: userId, bid_amount: parsedBidAmount }]);

      if (error) throw error;

      Alert.alert('Success', 'Your bid has been placed!');
      setBidAmount('');
      setCurrentHighestBid(parsedBidAmount);
      setBidCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error('Error placing bid:', error);
      Alert.alert('Error', 'There was an issue placing your bid. Please check your connection and try again.');
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

      <Text style={styles.title}>{item.category.toUpperCase()}</Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.details}>Weight: {item.weight}kg | Breed: {item.breed}</Text>
      </View>

      <View style={styles.bidInfoContainer}>
        <View style={styles.bidItem}>
          <Text style={styles.bidLabel}>Highest Bid</Text>
          <Text style={styles.bidValue}>₱{currentHighestBid.toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.bidItem}>
          <Text style={styles.bidLabel}>No. of Bidders</Text>
          <Text style={styles.bidValue}>{bidCount}</Text>
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
        {[1000, 3000, 5000, 10000].map((amount) => (
          <TouchableOpacity key={amount} style={styles.presetButton} onPress={() => addToBid(amount)}>
            <Text style={styles.presetButtonText}>+₱{amount.toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handlePlaceBid}
          disabled={loading}
        >
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
    marginBottom: 20,
  },
  presetBidContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 10,
    width: '42%',
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
  },
  submitButton: {
    backgroundColor: '#335441',
    padding: 15,
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
    paddingVertical: 12,
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
