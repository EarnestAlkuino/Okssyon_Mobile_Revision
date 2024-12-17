import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

const SellerTransactionPage = ({ route, navigation }) => {
  const { livestockId } = route.params || {};
  const [transactionSteps, setTransactionSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!livestockId) {
      Alert.alert('Error', 'Livestock ID is required.');
      navigation.goBack();
      return;
    }

    const fetchTransactionData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('livestock')
          .select(
            'status, proof_sent, vet_cert_sent, proof_of_ownership_url, vet_certificate_url'
          )
          .eq('livestock_id', livestockId)
          .single();

        if (error || !data) {
          Alert.alert('Error', 'Failed to load transaction data.');
          return;
        }

        setTransactionSteps([
          {
            id: '1',
            title: 'Auction Confirmed',
            description: '',
            status: data.status === 'SOLD' ? 'completed' : 'pending',
          },
          {
            id: '2',
            title: 'Livestock Sold',
            description: '',
            status: data.status === 'SOLD' ? 'completed' : 'pending',
          },
          {
            id: '3',
            title: 'Proof of Ownership Sent',
            description: '',
            status: data.proof_sent ? 'completed' : 'pending',
            url: data.proof_of_ownership_url,
            action: !data.proof_sent,
          },
          {
            id: '4',
            title: 'Vet Certification Sent',
            description: '',
            status: data.vet_cert_sent ? 'completed' : 'pending',
            url: data.vet_certificate_url,
            action: !data.vet_cert_sent,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [livestockId]);

  const openDocument = (url) => {
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No document available to view.');
    }
  };

  const sendDocument = async (docType) => {
    try {
      const columnToUpdate = docType === 'Proof' ? 'proof_sent' : 'vet_cert_sent';
      const message =
        docType === 'Proof'
          ? 'Proof of Ownership has been sent to the bidder.'
          : 'Vet Certification has been sent to the bidder.';

      await supabase
        .from('livestock')
        .update({ [columnToUpdate]: true })
        .eq('livestock_id', livestockId);

      Alert.alert('Success', `${docType} has been sent successfully.`);
      setTransactionSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.title.includes(docType)
            ? { ...step, status: 'completed', action: false }
            : step
        )
      );
    } catch (error) {
      Alert.alert('Error', `Failed to send ${docType}.`);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#257446" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Transaction</Text>
      </View>

      <View style={styles.stepsContainer}>
        {transactionSteps.map((step) => (
          <View key={step.id} style={styles.stepWrapper}>
            <View style={styles.stepIndicator}>
              <Ionicons
                name={step.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={step.status === 'completed' ? '#257446' : '#ccc'}
              />
            </View>
            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepTitle,
                  step.status === 'completed' && styles.completedText,
                ]}
              >
                {step.title}
              </Text>
              {step.action && step.status === 'pending' && (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() =>
                    sendDocument(
                      step.title.includes('Proof') ? 'Proof' : 'Vet Certification'
                    )
                  }
                >
                  <Text style={styles.sendButtonText}>Send Document</Text>
                </TouchableOpacity>
              )}
              {step.url && step.status === 'completed' && (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => openDocument(step.url)}
                >
                  <Text style={styles.downloadButtonText}>Download Document</Text>
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
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#257446' },
  stepsContainer: { flex: 1 },
  stepWrapper: { flexDirection: 'row', marginBottom: 20 },
  stepIndicator: { marginRight: 15 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  completedText: { color: '#257446' },
  sendButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 16 },
  downloadButton: {
    marginTop: 8,
    backgroundColor: '#257446',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  downloadButtonText: { color: '#fff', fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#257446' },
});

export default SellerTransactionPage;
