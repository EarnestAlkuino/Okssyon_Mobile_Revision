import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BidderTransactionPage = ({ navigation }) => {
  // Static transaction data
  const [transactionSteps, setTransactionSteps] = useState([
    { id: 1, name: 'Payment', description: 'paid', completed: true },
    { id: 2, name: 'Transfer of Ownership', description: 'Download Ownership Form', completed: false },
    { id: 3, name: 'Transfer of Vet Certificate', description: 'Download Vet Certificate', completed: false },
    { id: 4, name: 'Shipping Permit', description: 'Download Shipping permit', completed: false },
    { id: 5, name: 'Successfully Auctioned', description: '', completed: false },
    { id: 6, name: 'Rate Auctioneer', description: 'Proceed to rate form (optional)', completed: false },
  ]);

  // Function to handle when a step is clicked (if needed)
  const handleStepClick = (step) => {
    if (!step.completed) {
      alert(`Please complete the previous steps to proceed with ${step.name}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Transaction</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Auction Transaction</Text>
        {transactionSteps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepIndicator}>
              <View style={[styles.circle, step.completed && styles.completedCircle]} />
            </View>
            <View style={styles.stepDetails}>
              <Text style={[styles.stepName, step.completed && styles.completedText]}>
                {step.name}
              </Text>
              {step.description ? (
                <TouchableOpacity onPress={() => handleStepClick(step)}>
                  <Text style={styles.stepDescription}>
                    {step.completed ? step.description : `⬇ ${step.description}`}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  headerContainer: {
    backgroundColor: '#257446',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#257446',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepIndicator: {
    marginRight: 10,
    alignItems: 'center',
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  completedCircle: {
    borderColor: '#257446',
    backgroundColor: '#257446',
  },
  stepDetails: {
    flex: 1,
  },
  stepName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  completedText: {
    color: '#257446',
  },
  stepDescription: {
    fontSize: 14,
    color: '#555',
    textDecorationLine: 'underline',
    marginTop: 2,
  },
});

export default BidderTransactionPage;
