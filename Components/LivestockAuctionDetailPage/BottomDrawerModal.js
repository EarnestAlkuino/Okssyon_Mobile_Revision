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
    if (!item) {
      Alert.alert('Error', 'Invalid auction item.');
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
  
    if (parsedBidAmount <= currentHighestBid) {
      Alert.alert(
        'Invalid Bid',
        `Your bid must be higher than the current highest bid of ₱${currentHighestBid.toLocaleString()}.`
      );
      return;
    }
  
    setLoading(true);
  
    try {
      // Fetch the current highest bidder
      const { data: highestBidderData, error: highestBidderError } = await supabase
        .from('bids')
        .select('bidder_id, bid_amount')
        .eq('livestock_id', item.livestock_id)
        .order('bid_amount', { ascending: false })
        .limit(1);
  
      if (highestBidderError) {
        throw highestBidderError;
      }
  
      const currentHighestBidder = highestBidderData?.[0]?.bidder_id;
  
      // Insert the new bid into the 'bids' table
      const { error: bidError } = await supabase
        .from('bids')
        .insert([{
          livestock_id: item.livestock_id,
          bidder_id: userId,
          bid_amount: parsedBidAmount,
          status: 'pending',
        }]);
  
      if (bidError) {
        throw bidError;
      }
  
      // Update the highest bid state
      setCurrentHighestBid(parsedBidAmount);
  
      // Notify the seller
      if (userId !== ownerId) {
        const sellerMessage = `A new bid of ₱${parsedBidAmount.toLocaleString()} has been placed on your livestock!`;
        const { error: sellerNotifError } = await supabase
          .from('notifications')
          .insert([{
            livestock_id: item.livestock_id,
            recipient_id: ownerId,
            recipient_role: 'SELLER',
            notification_type: 'NEW_BID',
            message: sellerMessage,
            is_read: false,
          }]);
  
        if (sellerNotifError) {
          console.error('Error inserting seller notification:', sellerNotifError);
        }
      }
  
      // Notify the current highest bidder about being outbid
      if (currentHighestBidder && currentHighestBidder !== userId) {
        const outbidMessage = `You have been outbid on the auction for ${item.category || 'this item'}. Place a higher bid to win!`;
        const { error: outbidNotifError } = await supabase
          .from('notifications')
          .insert([{
            livestock_id: item.livestock_id,
            recipient_id: currentHighestBidder,
            recipient_role: 'BIDDER',
            notification_type: 'OUTBID',
            message: outbidMessage,
            is_read: false,
          }]);
  
        if (outbidNotifError) {
          console.error('Error inserting outbid notification:', outbidNotifError);
        }
      }
  
      // Notify the current bidder
      const bidderMessage = `You have successfully placed a bid of ₱${parsedBidAmount.toLocaleString()} on this livestock!`;
      const { error: bidderNotifError } = await supabase
        .from('notifications')
        .insert([{
          livestock_id: item.livestock_id,
          recipient_id: userId,
          recipient_role: 'BIDDER',
          notification_type: 'NEW_BID',
          message: bidderMessage,
          is_read: false,
        }]);
  
      if (bidderNotifError) {
        console.error('Error inserting bidder notification:', bidderNotifError);
      }
  
      Alert.alert('Success', `You have successfully placed a bid of ₱${parsedBidAmount.toLocaleString()}.`);
  
    } catch (error) {
      console.error('Error placing bid or sending notification:', error);
      Alert.alert('Error', 'Could not place your bid or send notification. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
 
 
 
  const addToBid = (amount) => {
    const newBid = (parseInt(bidAmount || 0, 10) + amount).toString();
    setBidAmount(newBid);
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
