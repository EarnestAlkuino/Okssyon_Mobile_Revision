import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

const WinnerConfirmationPage = ({ route, navigation }) => {
  const { livestockId } = route.params;
  const [auctionResult, setAuctionResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctionResult = async () => {
      try {
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
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching auction result:', error);
        } else if (!data) {
          console.warn('No auction results found for the provided livestockId.');
        } else {
          setAuctionResult(data);
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

    Alert.alert(
      'Confirm Sale',
      'Are you sure you want to confirm this sale?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('livestock')
                .update({ status: 'SOLD' })
                .eq('livestock_id', livestockId);

              if (error) {
                Alert.alert('Error', 'Failed to update livestock status. Please try again.');
                console.error('Error updating livestock status:', error);
              } else {
                Alert.alert('Success', 'The sale has been confirmed successfully.');
                navigation.navigate('BidderTransactionPage', { auctionResult }); // Redirect to BidderTransactionPage
              }
            } catch (error) {
              console.error('Unexpected error:', error);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          },
        },
      ]
    );
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#257446" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.congratulationsText}>🎉 Congratulations! 🎉</Text>
        <Text style={styles.winningText}>
          You have won the bid for {auctionResult.livestock?.category || 'this item'}.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.detailTitle}>Winning Price</Text>
        <Text style={styles.priceText}>₱{auctionResult.bid_amount.toLocaleString()}</Text>

        <Text style={styles.detailTitle}>Seller's Information</Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Seller:</Text> {auctionResult.livestock?.profiles?.full_name || 'Unknown'}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Location:</Text> {auctionResult.livestock?.location || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Rating:</Text> ⭐⭐⭐⭐☆
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    padding: 20,
  },
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
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  header: {
    marginTop: 80,
    alignItems: 'center',
    marginBottom: 30,
  },
  congratulationsText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#257446',
    textAlign: 'center',
  },
  winningText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#257446',
    marginTop: 15,
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#257446',
    textAlign: 'center',
    marginVertical: 10,
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#555',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#257446',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WinnerConfirmationPage;
