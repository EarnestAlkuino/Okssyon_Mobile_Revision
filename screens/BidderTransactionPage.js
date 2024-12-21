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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '../supabase';

const BidderTransactionPage = ({ route, navigation }) => {
  const { livestockId } = route.params || {};
  const [transactionSteps, setTransactionSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadedFiles, setDownloadedFiles] = useState([]); // Track downloaded files

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
        // Fetch livestock details, including status and documents
        const { data: livestock, error } = await supabase
          .from('livestock')
          .select(
            'status, starting_price, winner_id, proof_of_ownership_url, vet_certificate_url, proof_sent, vet_cert_sent'
          )
          .eq('livestock_id', livestockId)
          .single();

        if (error || !livestock) {
          console.error('Error fetching livestock data:', error);
          Alert.alert('Error', 'Failed to load transaction data. Please try again.');
          return;
        }

        const steps = [];

        // Step 1: Auction Confirmation
        steps.push({
          id: '1',
          name: 'Auction Confirmed',
    
          status: livestock.status === 'SOLD' || livestock.status === 'AUCTION_ENDED' ? 'completed' : 'pending',
        });

        // Step 2: Livestock Sold
        steps.push({
          id: '2',
          name: 'Livestock Sold',
          status: livestock.status === 'SOLD' ? 'completed' : 'pending',
        });

        // Step 3: Proof of Ownership Sent
        steps.push({
          id: '3',
          name: 'Proof of Ownership Received',
          status: livestock.proof_sent ? 'completed' : 'pending',
          action: livestock.proof_of_ownership_url
            ? () => downloadDocument(livestock.proof_of_ownership_url, 'Proof_of_Ownership.pdf')
            : null,
        });

        // Step 4: Vet Certification Sent
        steps.push({
          id: '4',
          name: 'Vet Certification Received',
          status: livestock.vet_cert_sent ? 'completed' : 'pending',
          action: livestock.vet_certificate_url
            ? () => downloadDocument(livestock.vet_certificate_url, 'Vet_Certification.pdf')
            : null,
        });

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

  const downloadDocument = async (url, fileName) => {
    try {
      if (downloadedFiles.includes(fileName)) {
        Alert.alert('Info', `${fileName} has already been downloaded.`);
        return;
      }

      const fileUri = FileSystem.documentDirectory + fileName;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);

      if (uri) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }

        Alert.alert('Download Complete', `${fileName} saved successfully.`);
        setDownloadedFiles((prev) => [...prev, fileName]); // Mark file as downloaded
      } else {
        Alert.alert('Error', 'Failed to download the document.');
      }
    } catch (error) {
      console.error(`Error downloading ${fileName}:`, error);
      Alert.alert('Error', `Failed to download ${fileName}. Please try again.`);
    }
  };

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
        <Text style={styles.headerText}>Bidder Transaction</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {transactionSteps.map((step) => (
          <View key={step.id} style={styles.stepWrapper}>
            {/* Circle Indicator */}
            <View
              style={[
                styles.stepCircle,
                step.status === 'completed' ? styles.completedStepCircle : styles.pendingStepCircle,
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

              {/* Action Button for Viewing/Downloading Documents */}
              {step.action && step.status === 'completed' && (
                <TouchableOpacity style={styles.downloadButton} onPress={step.action}>
                  <Text style={styles.downloadButtonText}>
                    {downloadedFiles.includes(step.name) ? 'Downloaded' : 'Download Document'}
                  </Text>
                </TouchableOpacity>
              )}
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
    fontSize: 30,
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
  downloadButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#257446',
    borderRadius: 5,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
