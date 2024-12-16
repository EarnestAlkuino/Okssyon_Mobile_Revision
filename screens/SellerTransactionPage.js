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

const SellerTransactionPage = ({ route, navigation }) => {
  const { livestockId } = route.params || {};
  const [transactionSteps, setTransactionSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  const isValidUUID = (id) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);

  useEffect(() => {
    if (!livestockId || !isValidUUID(livestockId)) {
      Alert.alert('Error', 'Invalid livestock ID. Please try again.');
      navigation.goBack();
      return;
    }

    const fetchTransactionData = async () => {
      setLoading(true);
      try {
        // Fetch livestock details
        const { data: livestockData, error: livestockError } = await supabase
          .from('livestock')
          .select('status, winner_id')
          .eq('livestock_id', livestockId)
          .single();
    
        if (livestockError || !livestockData) {
          Alert.alert('Error', 'Failed to load livestock data. Please try again.');
          return;
        }
    
        const { status, winner_id } = livestockData;
        const steps = [];
    
        // Step 1: Livestock Posted (always completed)
        steps.push({
          id: '1',
          name: 'Livestock Posted',
          status: 'completed',
        });
    
        // Step 2: Check for SOLD status
        if (status === 'SOLD' && winner_id) {
          // Fetch the winner's name from profiles table
          const { data: bidderData, error: bidderError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', winner_id)
            .single();
    
          if (!bidderError && bidderData) {
            steps.push({
              id: '2',
              name: `Winning Confirmation: ${bidderData.name}`,
              status: 'completed',
            });
          } else {
            steps.push({
              id: '2',
              name: 'Winning Confirmation: Unknown Winner',
              status: 'completed',
            });
          }
        } else if (status === 'AUCTION_ENDED') {
          // Fallback for auction ended but not yet confirmed as SOLD
          steps.push({
            id: '2',
            name: 'Awaiting Winner Confirmation',
            status: 'pending',
          });
        }
    
        setTransactionSteps(steps);
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        console.error('Error fetching transaction data:', error);
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
        {transactionSteps.map((step, index) => (
          <View key={step.id} style={styles.stepWrapper}>
            {/* Left Section: Circle with Connecting Line */}
            <View style={styles.leftSection}>
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
              {/* Render the line only if it's not the last step */}
              {index < transactionSteps.length - 1 && <View style={styles.stepLine} />}
            </View>

            {/* Right Section: Step Details */}
            <View style={styles.stepDetails}>
              <Text
                style={[
                  styles.stepTitle,
                  step.status === 'completed' && styles.completedText,
                ]}
              >
                {step.name}
              </Text>
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
    alignItems: 'center',
    marginBottom: 50, // Adjust space between steps
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative', // Needed for absolute line positioning
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10, // Ensures a perfect circle
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    zIndex: 2, // Ensure it appears above the line
  },
  completedStepCircle: {
    backgroundColor: '#257446',
  },
  pendingStepCircle: {
    backgroundColor: '#ddd',
  },
  stepLine: {
    position: 'absolute',
    top: 20, // Aligns line with the bottom of the circle
    width: 1,
    height: 50, // Adjust height dynamically for spacing
    backgroundColor: '#257446', // White line color
    zIndex: 1, // Ensure it appears behind the circle
  },
  stepDetails: {
    flex: 1,
    justifyContent: 'center', // Align text vertically with the circle
  },
  stepTitle: {
    fontSize: 18,
    color: '#555',
  },
  completedText: {
    fontWeight: 'bold',
    color: '#257446',
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

export default SellerTransactionPage;
