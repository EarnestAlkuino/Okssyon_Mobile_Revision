import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

const SellerTransactionPage = ({ navigation }) => {
  // Hardcoded transaction details
  const transactionDetails = {
    category: 'Cattle',
    location: 'Farmville',
    winningBid: {
      bidder: 'John Doe',
      bidAmount: 15000,
    },
  };

  const handleConfirm = () => {
    // Simulate confirmation action
    Alert.alert('Success', 'Transaction confirmed successfully.');
    navigation.navigate('LivestockAuctionDetailPage', { itemId: 'hardcoded-livestock-id' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Seller Transaction</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.detailTitle}>Auction Details</Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Category:</Text> {transactionDetails.category}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Location:</Text> {transactionDetails.location}
        </Text>

        <Text style={styles.detailTitle}>Winning Bid</Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Bidder:</Text> {transactionDetails.winningBid.bidder}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Winning Price:</Text> ₱{transactionDetails.winningBid.bidAmount.toLocaleString()}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Transaction</Text>
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
  header: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#257446',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#257446',
    marginTop: 15,
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

export default SellerTransactionPage;
