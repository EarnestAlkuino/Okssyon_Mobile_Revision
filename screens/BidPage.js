import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

const BidPage = ({ route, navigation }) => {
  const { item, userId, ownerId } = route.params || {};
  const [bidAmount, setBidAmount] = useState('');
  const [currentHighestBid, setCurrentHighestBid] = useState(item?.starting_price || 0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch highest bid
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

        // Fetch bidder count
        await updateBidderCount();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const setupRealtimeSubscription = () => {
      const subscription = supabase
        .channel('bids-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bids', filter: `livestock_id=eq.${item.livestock_id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newBidAmount = payload.new.bid_amount;
              setCurrentHighestBid((prevBid) =>
                newBidAmount > prevBid ? newBidAmount : prevBid
              );
              updateBidderCount();
            }
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    };

    fetchInitialData();
    const unsubscribe = setupRealtimeSubscription();

    return unsubscribe;
  }, [item.livestock_id]);

  const updateBidderCount = async () => {
    try {
      const { count, error } = await supabase
        .from('bids')
        .select('bidder_id', { count: 'exact', distinct: true })
        .eq('livestock_id', item.livestock_id);

      if (error) throw error;

      setUserCount(count || 0);
    } catch (error) {
      console.error('Error updating bidder count:', error);
    }
  };

  const handleRealTimeNotification = async (type, message, livestockId, bidderId = null, previousBidderId = null) => {
    console.log('🔹 Creating real-time notification:', { type, message, livestockId, bidderId, previousBidderId });
  
    try {
      // ✅ Step 1: Fetch the seller_id (owner_id) from livestock
      const { data: livestockData, error: livestockError } = await supabase
        .from('livestock')
        .select('owner_id')
        .eq('livestock_id', livestockId)
        .single();
  
      if (livestockError) {
        console.error('❌ Error fetching seller_id:', livestockError.message);
        return;
      }
  
      const sellerId = livestockData?.owner_id;
      console.log('✅ Seller ID fetched:', sellerId);
  
      if (!sellerId) {
        console.error('❌ No seller_id found for livestock:', livestockId);
        return;
      }
  
      // ✅ Step 2: Insert a `NEW_BID` notification for the seller (ONLY in notifications table)
      if (type === 'NEW_BID') {
        const { data: newBidNotif, error: newBidError } = await supabase
          .from('notifications')
          .insert([
            {
              livestock_id: livestockId,
              seller_id: sellerId, // ✅ Assigned only to seller
              message: `A new bid has been placed on your auction.`,
              notification_type: 'NEW_BID',
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ])
          .select();
  
        if (newBidError) {
          console.error('❌ Error inserting NEW_BID notification:', newBidError.message);
          return;
        }
  
        console.log('✅ NEW_BID notification sent to seller:', newBidNotif);
      }
  
      // ✅ Step 3: Insert a `BID_PLACED` notification for the bidder (ONLY in notification_bidders table)
      if (type === 'BID_PLACED' && bidderId) {
        const { data: bidPlacedNotif, error: bidPlacedError } = await supabase
          .from('notification_bidders')
          .insert([
            {
              notification_id: newBidNotif[0].id,  // ✅ Correctly linking to notification
              bidder_id: bidderId,
              notification_type: 'BID_PLACED',
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ]);
  
        if (bidPlacedError) {
          console.error('❌ Error inserting BID_PLACED notification:', bidPlacedError.message);
        } else {
          console.log(`✅ BID_PLACED notification sent to bidder: ${bidderId}`);
        }
      }
  
      // ✅ Step 4: If there's a previous highest bidder, notify them about being outbid
      if (type === 'OUTBID' && previousBidderId && previousBidderId !== bidderId) {
        const { data: outbidNotif, error: outbidError } = await supabase
          .from('notification_bidders')
          .insert([
            {
              notification_id: newBidNotif[0].id,  // ✅ Correctly linking to notification
              bidder_id: previousBidderId,
              notification_type: 'OUTBID',
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ]);
  
        if (outbidError) {
          console.error('❌ Error inserting OUTBID notification:', outbidError.message);
        } else {
          console.log(`✅ OUTBID notification sent to previous highest bidder: ${previousBidderId}`);
        }
      }
  
    } catch (err) {
      console.error('❌ Error handling real-time notification:', err.message);
    }
  };
  
  

  const addToBid = (amount) => {
    const newBid = (parseInt(bidAmount || 0, 10) + amount).toString();
    setBidAmount(newBid);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={30} color="#4A5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place a Bid</Text>
      </View>

      <View style={styles.bidInfoContainer}>
        <View style={styles.bidItem}>
          <Text style={styles.bidLabel}>Highest Bid</Text>
          <Text style={styles.bidValue}>
            {currentHighestBid ? `₱${currentHighestBid.toLocaleString()}` : 'N/A'}
          </Text>
        </View>
        <View style={styles.bidItem}>
          <Text style={styles.bidLabel}>No. of Bidders</Text>
          <Text style={styles.bidValue}>{userCount || '0'}</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your bid"
        value={bidAmount}
        onChangeText={setBidAmount}
        keyboardType="numeric"
        placeholderTextColor="#A0AEC0"
      />

      <View style={styles.presetBidContainer}>
        {[1000, 3000, 5000, 10000].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.presetButton}
            onPress={() => addToBid(amount)}
          >
            <Text style={styles.presetButtonText}>+₱{amount.toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handlePlaceBid}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Bid</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 10,
  },
  bidInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bidItem: {
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 5,
  },
  bidValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  input: {
    height: 50,
    borderColor: '#CBD5E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 20,
    color: '#2D3748',
  },
  presetBidContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: '#EDF2F7',
    padding: 10,
    borderRadius: 8,
    width: '22%',
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  submitButton: {
    backgroundColor: '#48BB78',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default BidPage;
