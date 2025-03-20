import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

const BottomDrawerModal = ({
  isVisible,
  onClose,
  item,
  userId,
  ownerId,
  currentHighestBid = 0,
  setCurrentHighestBid,
  userCount = 0,
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Animate drawer on visibility change
  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handlePlaceBid = async () => {
    console.log('🔹 handlePlaceBid() started');
  
    if (userId === ownerId) {
      console.log('❌ Error: User is trying to bid on their own auction');
      Alert.alert('Error', 'You cannot place a bid on your own auction.');
      return;
    }
  
    const parsedBidAmount = parseFloat(bidAmount);
    if (isNaN(parsedBidAmount) || parsedBidAmount <= currentHighestBid) {
      console.log('❌ Invalid bid amount:', parsedBidAmount);
      Alert.alert(
        'Invalid Bid',
        `Your bid must be higher than ₱${currentHighestBid.toLocaleString()}.`
      );
      return;
    }
  
    setLoading(true);
  
    try {
      // ✅ Step 1: Fetch the previous highest bidder
      const { data: previousBids, error: previousBidError } = await supabase
        .from('bids')
        .select('bidder_id')
        .eq('livestock_id', item.livestock_id)
        .order('bid_amount', { ascending: false })
        .limit(1);
  
      if (previousBidError) {
        console.error('❌ Error fetching previous highest bidder:', previousBidError.message);
      }
  
      const previousHighestBidder = previousBids.length > 0 ? previousBids[0].bidder_id : null;
  
      // ✅ Step 2: Insert the new bid
      const { error: bidError } = await supabase.from('bids').insert([
        {
          livestock_id: item.livestock_id,
          bidder_id: userId,
          bid_amount: parsedBidAmount,
          status: 'pending',
        },
      ]);
  
      if (bidError) {
        console.error('❌ Error inserting bid:', bidError.message);
        throw bidError;
      }
  
      console.log('✅ New bid placed:', parsedBidAmount);
  
      // ✅ Step 3: Notify the seller (BID_PLACED) and previous highest bidder (OUTBID)
      await handleRealTimeNotification(
        'BID_PLACED',  // ✅ Notification type for the seller
        `A new bid has been placed on your auction.`,
        item.livestock_id,
        userId,  // ✅ Current bidder (who placed the bid)
        previousHighestBidder  // ✅ Previous highest bidder (who was outbid)
      );
  
      Alert.alert(
        'Success',
        `You have successfully placed a bid of ₱${parsedBidAmount.toLocaleString()}.`,
        [{ text: 'OK', onPress: () => onClose() }]// ✅ Now properly closes modal
      );
  
      setCurrentHighestBid(parsedBidAmount);
    } catch (error) {
      console.error('❌ Error placing bid:', error.message);
      Alert.alert('Error', 'Could not place your bid. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
   
 
   const addToBid = (amount) => {
     const newBid = (parseInt(bidAmount || 0, 10) + amount).toString();
     setBidAmount(newBid);
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
  
      // ✅ Step 2: Insert a `BID_PLACED` notification for the seller (instead of bidder)
      const { data: bidPlacedNotif, error: bidPlacedError } = await supabase
        .from('notifications')
        .insert([
          {
            livestock_id: livestockId,
            seller_id: sellerId, // ✅ Sent to seller instead of bidder
            message: `A new bid has been placed on your auction.`,
            notification_type: 'BID_PLACED',
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select();
  
      if (bidPlacedError) {
        console.error('❌ Error inserting BID_PLACED notification:', bidPlacedError.message);
        return;
      }
  
      console.log('✅ BID_PLACED notification sent to seller:', bidPlacedNotif);
  
      // ✅ Step 3: If there's a previous highest bidder, notify them about being outbid
      if (previousBidderId && previousBidderId !== bidderId) {
        const { data: outbidNotif, error: outbidError } = await supabase
          .from('notification_bidders')
          .insert([
            {
              notification_id: bidPlacedNotif[0].id,  // ✅ Correctly linking to notification
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
  
  
   
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlay} onPress={onClose} />
        <Animated.View
          style={[
            styles.drawerContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={30} color="#4A5568" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Place a Bid</Text>
            </View>

            <View style={styles.bidInfoContainer}>
              <View style={styles.bidItem}>
                <Text style={styles.bidLabel}>Highest Bid</Text>
                <Text style={styles.bidValue}>₱{(currentHighestBid || 0).toLocaleString()}</Text>
              </View>
              <View style={styles.bidItem}>
                <Text style={styles.bidLabel}>No. of Bidders</Text>
                <Text style={styles.bidValue}>{userCount || 0}</Text>
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

            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                {[1000, 3000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.gridButton}
                    onPress={() => addToBid(amount)}
                  >
                    <Text style={styles.presetButtonText}>+₱{amount.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.gridRow}>
                {[5000, 10000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.gridButton}
                    onPress={() => addToBid(amount)}
                  >
                    <Text style={styles.presetButtonText}>+₱{amount.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
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
  gridContainer: {
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  gridButton: {
    backgroundColor: '#EDF2F7',
    padding: 10,
    borderRadius: 8,
    width: '45%',
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

export default BottomDrawerModal;
