import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { LinearGradient } from 'expo-linear-gradient';

const WinnerConfirmationPage = ({ route, navigation }) => {
  const { livestockId } = route.params;
  const [auctionResult, setAuctionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const fetchAuctionResult = async () => {
      try {
        // Fetch the auction result
        const { data, error } = await supabase
          .from('bids')
          .select(`
            bid_amount,
            livestock:livestock_id (
              category,
              location,
              profiles!fk_owner (full_name)
            ),
            profiles:bidder_id (full_name)
          `)
          .eq('livestock_id', livestockId)
          .order('bid_amount', { ascending: false })
          .limit(1);
    
        if (error) {
          console.error('Error fetching auction result:', error);
          return;
        }
    
        if (!data || data.length === 0) {
          console.warn('No auction results found for the provided livestockId.');
          return;
        }
    
        const auctionData = data[0];
        setAuctionResult(auctionData);
    
        // Check confirmation status
        const { data: confirmationData, error: confirmationError } = await supabase
          .from('auction_results')
          .select('confirmation_status')
          .eq('livestock_id', livestockId)
          .limit(1); // Replace .single() with limit(1)
    
        if (confirmationError) {
          console.error('Error checking confirmation status:', confirmationError);
        } else if (confirmationData && confirmationData.length > 0) {
          const confirmationStatus = confirmationData[0].confirmation_status;
          if (confirmationStatus === 'CONFIRMED') {
            setIsConfirmed(true);
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching auction result:', error);
      } finally {
        setLoading(false);
      }
    };
    
  
    fetchAuctionResult();
  }, [livestockId]);

  const handleConfirm = async () => {
    if (!auctionResult) {
      Alert.alert('Error', 'Unable to proceed. Auction details are missing.');
      return;
    }
  
    if (isConfirmed) {
      Alert.alert('Already Confirmed', 'This sale has already been confirmed.');
      return;
    }
  
    try {
      setLoading(true);
  
      // Step 1: Update livestock status to SOLD
      const { error: updateError } = await supabase
        .from('livestock')
        .update({ status: 'SOLD' })
        .eq('livestock_id', livestockId);
  
      if (updateError) {
        console.error('Error updating livestock status:', updateError);
        Alert.alert('Error', 'Failed to confirm the sale.');
        return;
      }
  
      // Step 2: Fetch seller ID (owner of the auction)
      const { data: livestockDetails, error: detailsError } = await supabase
        .from('livestock')
        .select('owner_id')
        .eq('livestock_id', livestockId)
        .single();
  
      if (detailsError || !livestockDetails) {
        console.error('Error fetching livestock details:', detailsError);
        Alert.alert('Error', 'Failed to fetch auction details.');
        return;
      }
  
      const sellerId = livestockDetails.owner_id;
      if (!sellerId) {
        Alert.alert('Error', 'Seller information is missing.');
        return;
      }
  
      // Step 3: Send notification to the seller about auction confirmation
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            livestock_id: livestockId,
            seller_id: sellerId, // Notify the seller
            message: `The auction has been confirmed successfully by the winner.`,
            notification_type: 'AUCTION_CONFIRMED',
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);
  
      if (notificationError) {
        console.error('Error inserting confirmation notification:', notificationError);
        Alert.alert('Error', 'Failed to notify the seller.');
        return;
      }
  
      // Step 4: Automatically navigate to `BidderTransactionPage` after confirmation
      setIsConfirmed(true);
      navigation.replace('BidderTransactionPage', { livestockId });
  
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#257446" />
        <Text style={styles.loadingText}>Loading Auction Result...</Text>
      </View>
    );
  }

  if (!auctionResult) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No auction result found.</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#14532d", "#257446", "#A7D4A9"]}
      style={{ flex: 1 }}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.congratulationsText}>Congratulations!</Text>
        <Text style={styles.winningText}>
          You have won the bid for {auctionResult.livestock?.category || 'this item'}.
        </Text>
      </View>

      <View style={styles.cardWithImage}>
        <Text style={styles.highlightedPrice}>Winning Price</Text>
        <Text style={styles.priceText}>₱{auctionResult.bid_amount.toLocaleString()}</Text>

        <View style={styles.divider} />

        <View style={styles.sellerInfoContainerRow}>
          <Ionicons name="person-circle" size={60} color="#ccc" style={styles.profileIconLeft} />
          <View style={styles.sellerDetailsTextContainer}>
            <Text style={styles.detailTitle}>Seller's Information</Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Seller:</Text> {auctionResult.livestock?.profiles?.full_name || 'Unknown'}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Location:</Text> {auctionResult.livestock?.location || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            isConfirmed && { backgroundColor: '#ccc' }, // Disable style when already confirmed
          ]}
          onPress={handleConfirm}
          disabled={isConfirmed} // Disable button after confirmation
        >
          <Text style={styles.confirmButtonText}>
            {isConfirmed ? 'Confirmed' : 'Confirm'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
  },
  loadingText: {
    fontSize: 18,
    color: '#14532d',
    marginTop: 10,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    fontWeight: '600',
  },
  divider: {
    height: 2,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
  header: {
    marginTop: 100,
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  congratulationsText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  winningText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: -10,
  },
  cardWithImage: {
    backgroundColor: '#f8f8f8',
    padding: 40,
    margin: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  highlightedPrice: {
    fontSize: 16,
    color: '#14532d',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 24,
    color: '#257446',
    fontWeight: '700',
    marginBottom: 20,
  },
  sellerInfoContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIconLeft: {
    width: 60,
    height: 60,
    marginRight: 15,


  },
  sellerDetailsTextContainer: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 18,
    color: '#257446',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#14532d',
    paddingVertical: 15,
    paddingHorizontal: 120,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WinnerConfirmationPage;