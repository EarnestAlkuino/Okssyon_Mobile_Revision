import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Button,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const AuctionHeader = ({ title, onBackPress, onFilterApply }) => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    price: '',
    gender: '',
    breed: '',
    weight: '',
    location: '',
  });

  const handleFilterApply = () => {
    setFilterModalVisible(false);
    onFilterApply(filters); // Pass the filters back to the parent component
  };

  return (
    <>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={styles.iconButton}
        >
          <Icon name="funnel-outline" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        transparent={true}
        visible={filterModalVisible}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply Filters</Text>

            {/* Filter Fields */}
            <TextInput
              style={styles.input}
              placeholder="Max Price"
              keyboardType="numeric"
              value={filters.price}
              onChangeText={(text) => setFilters((prev) => ({ ...prev, price: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Gender"
              value={filters.gender}
              onChangeText={(text) => setFilters((prev) => ({ ...prev, gender: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Breed"
              value={filters.breed}
              onChangeText={(text) => setFilters((prev) => ({ ...prev, breed: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Max Weight (kg)"
              keyboardType="numeric"
              value={filters.weight}
              onChangeText={(text) => setFilters((prev) => ({ ...prev, weight: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={filters.location}
              onChangeText={(text) => setFilters((prev) => ({ ...prev, location: text }))}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Button title="Apply" onPress={handleFilterApply} />
              <Button
                title="Cancel"
                color="#FF5C5C"
                onPress={() => setFilterModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 20 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 16,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default AuctionHeader;
