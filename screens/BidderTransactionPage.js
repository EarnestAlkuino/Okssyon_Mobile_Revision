import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

const BidderTransactionPage = ({ route, navigation }) => {
  const { livestockId } = route.params || {};
  const [transactionSteps, setTransactionSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  const isValidUUID = (id) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

  useEffect(() => {
    if (!livestockId || !isValidUUID(livestockId)) {
      console.error('Invalid or missing livestockId:', livestockId);
      Alert.alert('Error', 'Invalid livestock ID. Please try again.');
      navigation.goBack();
      return;
    }

    const fetchTransactionData = async () => {
      setLoading(true);
    
      try {
        // Fetch livestock details, including status and winner_id
        const { data: livestock, error } = await supabase
          .from('livestock')
          .select('status, starting_price, winner_id')
          .eq('livestock_id', livestockId)
          .single();
    
        if (error || !livestock) {
          console.error('Error fetching livestock data:', error);
          Alert.alert('Error', 'Failed to load transaction data. Please try again.');
          return;
        }
    
        const steps = [];
    
        // Step 1: Auction Confirmation
        if (livestock.status === 'AUCTION_ENDED' || livestock.status === 'SOLD') {
          steps.push({
            id: '1',
            name: 'Auction Confirmed',
            price: `Winning Price: ₱${livestock.starting_price || 'N/A'}`,
            status: 'completed',
          });
        } else {
          steps.push({
            id: '1',
            name: 'Awaiting Auction Confirmation',
            price: null,
            status: 'pending',
          });
        }
    
        // Step 2: Livestock Sold
        if (livestock.status === 'SOLD') {
          steps.push({
            id: '2',
            name: 'Livestock Sold',
            price: null,
            status: 'completed',
          });
    
          // Send notification to the winning bidder
          const { error: notificationError } = await supabase.from('notifications').insert({
            recipient_id: livestock.winner_id, // ID of the winning bidder
            recipient_role: 'BIDDER',
            livestock_id: livestockId,
            message: `Congratulations! You have won the auction for the livestock with a final price of ₱${livestock.starting_price}.`,
            notification_type: 'WINNER',
            is_read: false,
            created_at: new Date().toISOString(),
          });
    
          if (notificationError) {
            console.error('Error sending notification:', notificationError.message);
          } else {
            console.log('Notification sent to the winning bidder.');
          }
        }
    
        setTransactionSteps(steps);
      } catch (error) {
        console.error('Unexpected error fetching transaction data:', error.message);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    
    fetchTransactionData();
  }, [livestockId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#257446" />
        <Text style={styles.loadingText}>Loading transaction steps...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f0fdf4', '#e6f7ed']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#257446" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Auction Transaction</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {transactionSteps.map((step) => (
          <View key={step.id} style={styles.stepWrapper}>
            {/* Circle Indicator */}
            <View
              style={[
                styles.stepCircle,
                step.status === 'completed'
                  ? styles.completedStepCircle
                  : styles.pendingStepCircle,
              ]}
            >
              {step.status === 'completed' && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>

            {/* Step Details */}
            <View style={styles.stepDetails}>
              <Text
                style={[
                  styles.stepTitle,
                  step.status === 'completed' && styles.completedText,
                ]}
              >
                {step.name}
              </Text>
              {step.price && <Text style={styles.priceText}>{step.price}</Text>}
            </View>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 38,
    color: '#257446',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 30,
    marginTop: -10,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  stepCircle: {
    width: 18,
    height: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedStepCircle: {
    backgroundColor: '#257446',
  },
  pendingStepCircle: {
    backgroundColor: '#ddd',
  },
  stepDetails: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    color: '#555',
  },
  completedText: {
    fontWeight: 'bold',
    color: '#257446',
  },
  priceText: {
    marginTop: -1,
    fontSize: 15,
    color: '#257446',
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
});

export default BidderTransactionPage;
