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
  const createdAt = item?.created_at;

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

  // Add preset increment to bid
  const addToBid = (amount) => {
    if (typeof amount !== 'number') return;
    const newBid = (parseFloat(bidAmount || 0) + amount).toString();
    setBidAmount(newBid);
  };

  // Handle bid submission
  const handlePlaceBid = async () => {
    const parsedBidAmount = parseFloat(bidAmount);

    if (userId === ownerId) {
      Alert.alert('Error', 'You cannot place a bid on your own auction.');
      return;
    }

    if (isNaN(parsedBidAmount) || parsedBidAmount <= currentHighestBid) {
      Alert.alert(
        'Invalid Bid',
        `Your bid must be higher than the current highest bid of ₱${(currentHighestBid || 0).toLocaleString()}.`
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bids').insert([
        {
          livestock_id: item.livestock_id,
          bidder_id: userId,
          bid_amount: parsedBidAmount,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setCurrentHighestBid(parsedBidAmount);
      Alert.alert(
        'Success',
        `You placed a bid of ₱${parsedBidAmount.toLocaleString()}.`
      );
      setBidAmount('');
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to place your bid. Please try again.');
    } finally {
      setLoading(false);
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

            {/* Bid Info */}
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

            {/* Bid Input */}
            <TextInput
              style={styles.input}
              placeholder="Enter your bid"
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="numeric"
              placeholderTextColor="#A0AEC0"
            />

            {/* Preset Bid Buttons */}
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

            {/* Submit Button */}
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
    width: '45%', // Adjust width for proper spacing
    alignItems: 'center',
  },
  
});

export default BottomDrawerModal;
